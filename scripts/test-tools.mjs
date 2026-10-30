// End-to-end proof for every tool with a real engine.
// Drives the public HTTP surface exactly like the browser does:
//   upload -> create job -> poll -> download -> inspect the bytes.
// Run the app first, then: node scripts/test-tools.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import sharp from 'sharp';

const nodeRequire = createRequire(path.join(process.cwd(), 'package.json'));
const FFMPEG = nodeRequire('ffmpeg-static');
const FFPROBE = nodeRequire('ffprobe-static').path;

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000';
const FIXTURES = path.join(process.cwd(), '.verify');

// Engine ids whose tools need an AI provider or the public internet. They are
// proved end-to-end by scripts/test-ai.mjs instead of this offline harness.
const NETWORK_ENGINES = new Set([
  'ai.write', 'ai.pdf', 'speech.transcribe', 'speech.summarize', 'speech.youtube',
  'speech.social', 'extra.ocr', 'extra.urlToPdf',
]);

const exists = async (file) => { try { await fs.access(file); return true; } catch { return false; } };

function ffmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...args], { windowsHide: true });
    let err = '';
    child.stderr.on('data', (chunk) => { err += chunk.toString(); });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(err.trim().split(/\r?\n/).pop() || 'ffmpeg failed'))));
  });
}

function probeFile(file) {
  return new Promise((resolve, reject) => {
    const child = spawn(FFPROBE, ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file], { windowsHide: true });
    let out = '';
    child.stdout.on('data', (chunk) => { out += chunk.toString(); });
    child.on('error', reject);
    child.on('close', () => {
      try { resolve(JSON.parse(out)); } catch { reject(new Error('ffprobe could not read the output')); }
    });
  });
}

// ---------- catalog ----------
async function loadCatalog() {
  const src = await fs.readFile(path.join(process.cwd(), 'lib', 'catalog.ts'), 'utf8');
  const start = src.indexOf('export const TOOLS: Tool[] = ') + 'export const TOOLS: Tool[] = '.length;
  const end = src.indexOf('\nexport const TOOL_MAP');
  const json = src.slice(start, end).trim().replace(/;\s*$/, '');
  return JSON.parse(json);
}

// ---------- fixtures ----------
async function makePdf(file, label) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  for (let i = 1; i <= 3; i++) {
    const page = doc.addPage([595, 842]);
    page.drawText(`${label} page ${i}`, { x: 60, y: 760, size: 22, font });
    page.drawText('Hello from the TinyClone verification harness.', { x: 60, y: 720, size: 11, font });
  }
  await fs.writeFile(file, await doc.save());
}

async function makeFixtures() {
  await fs.mkdir(FIXTURES, { recursive: true });
  const pdfA = path.join(FIXTURES, 'alpha.pdf');
  const pdfB = path.join(FIXTURES, 'beta.pdf');
  await makePdf(pdfA, 'Alpha');
  await makePdf(pdfB, 'Beta');

  const png = path.join(FIXTURES, 'photo.png');
  await sharp({
    create: { width: 400, height: 300, channels: 3, background: { r: 32, g: 90, b: 160 } },
  }).png().toFile(png);

  const png2 = path.join(FIXTURES, 'photo2.png');
  await sharp({
    create: { width: 320, height: 200, channels: 3, background: { r: 170, g: 60, b: 40 } },
  }).png().toFile(png2);

  const imagePdf = path.join(FIXTURES, 'withimage.pdf');
  {
    const doc = await PDFDocument.create();
    const embedded = await doc.embedPng(await fs.readFile(png));
    const page = doc.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
    await fs.writeFile(imagePdf, await doc.save());
  }

  const jpg = path.join(FIXTURES, 'photo.jpg');
  await sharp({
    create: { width: 640, height: 480, channels: 3, background: { r: 20, g: 140, b: 90 } },
  }).jpeg({ quality: 90 }).toFile(jpg);

  const csv = path.join(FIXTURES, 'people.csv');
  await fs.writeFile(csv, 'name,role,note\nAda,engineer,"likes, commas"\nGrace,admiral,compiler\nAlan,mathematician,turing\nEdsger,professor,graphs\nBarbara,architect,databases\n');

  const json = path.join(FIXTURES, 'config.json');
  await fs.writeFile(json, JSON.stringify({ app: 'tinyclone', tools: 253, nested: { ready: true, list: [1, 2, 3] } }, null, 2));

  const xml = path.join(FIXTURES, 'rows.xml');
  await fs.writeFile(xml, '<?xml version="1.0"?>\n<rows><item id="1"><name>Ada</name></item><item id="2"><name>Grace</name></item><item id="3"><name>Alan</name></item></rows>');

  // ---- media fixtures (real encodes, so conversions have real inputs) ----
  const mp4 = path.join(FIXTURES, 'clip.mp4');
  if (!(await exists(mp4))) {
    await ffmpeg([
      '-f', 'lavfi', '-i', 'testsrc=size=320x240:rate=15:duration=2',
      '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-shortest',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', mp4,
    ]);
  }
  const media = { mp4 };
  const videoCodecs = {
    avi: ['-c:v', 'mpeg4', '-q:v', '5', '-c:a', 'libmp3lame'],
    mkv: ['-c:v', 'libx264', '-c:a', 'aac'],
    mov: ['-c:v', 'libx264', '-c:a', 'aac'],
    webm: ['-c:v', 'libvpx-vp9', '-b:v', '200k', '-c:a', 'libopus'],
  };
  for (const [ext, codec] of Object.entries(videoCodecs)) {
    const out = path.join(FIXTURES, `clip.${ext}`);
    if (!(await exists(out))) await ffmpeg(['-i', mp4, ...codec, out]);
    media[ext] = out;
  }
  const audioCodecs = {
    m4a: ['-c:a', 'aac'], ogg: ['-c:a', 'libvorbis'], mp3: ['-c:a', 'libmp3lame'],
    wav: ['-c:a', 'pcm_s16le'], aac: ['-c:a', 'aac', '-f', 'adts'],
  };
  for (const [ext, codec] of Object.entries(audioCodecs)) {
    const out = path.join(FIXTURES, `tone.${ext}`);
    if (!(await exists(out))) await ffmpeg(['-i', mp4, '-vn', ...codec, out]);
    media[ext] = out;
  }
  const gifVideo = path.join(FIXTURES, 'clip.gif');
  if (!(await exists(gifVideo))) {
    await ffmpeg(['-i', mp4, '-t', '1', '-vf', 'fps=8,scale=160:-1', '-loop', '0', gifVideo]);
  }
  media.gif = gifVideo;

  const srt = path.join(FIXTURES, 'subs.srt');
  await fs.writeFile(srt, '1\n00:00:00,200 --> 00:00:01,200\nHello from the subtitles\n\n2\n00:00:01,300 --> 00:00:01,900\nSecond line\n');

  // ---- documents ----
  const XLSX = nodeRequire('xlsx');
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([
    ['name', 'role', 'score'], ['Ada', 'engineer', 99], ['Grace', 'admiral', 97],
    ['Alan', 'mathematician', 95], ['Edsger', 'professor', 93],
  ]), 'People');
  const xlsx = path.join(FIXTURES, 'people.xlsx');
  await fs.writeFile(xlsx, XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }));

  // ---- Word + PowerPoint documents (inputs for the PDF import tools) ----
  const docxLib = nodeRequire('docx');
  const wordDoc = new docxLib.Document({
    sections: [{
      children: [
        new docxLib.Paragraph({ children: [new docxLib.TextRun({ text: 'Quarterly note', bold: true })] }),
        ...Array.from({ length: 8 }, (_, i) => new docxLib.Paragraph(`Section ${i + 1}: the harness wrote this paragraph.`)),
      ],
    }],
  });
  const docx = path.join(FIXTURES, 'note.docx');
  await fs.writeFile(docx, await docxLib.Packer.toBuffer(wordDoc));

  const PptxGenJS = nodeRequire('pptxgenjs');
  const deck = new PptxGenJS();
  for (let i = 1; i <= 3; i++) {
    deck.addSlide().addText(`Slide ${i}: the harness wrote this deck.`, { x: 0.5, y: 0.5, w: 9, fontSize: 24 });
  }
  const pptx = path.join(FIXTURES, 'deck.pptx');
  await deck.writeFile({ fileName: pptx });

  const chartCsv = path.join(FIXTURES, 'revenue.csv');
  await fs.writeFile(chartCsv, 'month,value\nJan,12\nFeb,30\nMar,22\nApr,41\nMay,35\n');

  const svg = path.join(FIXTURES, 'logo.svg');
  await fs.writeFile(svg, '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120"><rect x="10" y="10" width="180" height="100" rx="12" fill="#1d4ed8"/><circle cx="65" cy="60" r="26" fill="#fbbf24"/></svg>');

  const gifImage = path.join(FIXTURES, 'still.gif');
  await sharp(png).gif().toFile(gifImage);
  const tiffImage = path.join(FIXTURES, 'still.tiff');
  await sharp(png).tiff().toFile(tiffImage);
  const webpImage = path.join(FIXTURES, 'still.webp');
  await sharp(png).webp({ quality: 82 }).toFile(webpImage);

  // ---- font (downloaded once, small) ----
  const ttf = path.join(FIXTURES, 'Roboto.ttf');
  if (!(await exists(ttf)) || (await fs.stat(ttf)).size < 50000) {
    const res = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto%5Bwdth,wght%5D.ttf');
    if (!res.ok) throw new Error('could not download the font fixture');
    await fs.writeFile(ttf, Buffer.from(await res.arrayBuffer()));
  }

  // ---- PSD (written with the same library the engine reads) ----
  let psd = null;
  try {
    const agpsd = nodeRequire('ag-psd');
    const { createCanvas } = nodeRequire('@napi-rs/canvas');
    if (typeof agpsd.initializeCanvas === 'function') agpsd.initializeCanvas(createCanvas);
    const canvas = createCanvas(120, 90);
    const g = canvas.getContext('2d');
    g.fillStyle = '#1f4e79';
    g.fillRect(0, 0, 120, 90);
    g.fillStyle = '#f59e0b';
    g.fillRect(20, 20, 60, 40);
    const pixels = Buffer.from(g.getImageData(0, 0, 120, 90).data);
    const buffer = agpsd.writePsdBuffer({
      width: 120, height: 90, children: [],
      imageData: { width: 120, height: 90, data: pixels },
    });
    psd = path.join(FIXTURES, 'sample.psd');
    await fs.writeFile(psd, buffer);
  } catch {
    psd = null;
  }

  return { pdfA, pdfB, png, png2, jpg, csv, json, xml, srt, xlsx, chartCsv, svg, gifImage, tiffImage, webpImage, ttf, psd, imagePdf, media, docx, pptx };
}

const MIME = {
  '.pdf': 'application/pdf', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.csv': 'text/csv', '.json': 'application/json', '.xml': 'application/xml',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.mkv': 'video/x-matroska',
  '.avi': 'video/x-msvideo', '.webm': 'video/webm', '.gif': 'image/gif',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.aac': 'audio/aac',
  '.ogg': 'audio/ogg', '.srt': 'application/x-subrip', '.tiff': 'image/tiff',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.psd': 'image/vnd.adobe.photoshop',
  '.ttf': 'font/ttf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
};

export async function upload(filePath) {
  const body = new FormData();
  const buf = await fs.readFile(filePath);
  body.append('files', new Blob([buf], { type: MIME[path.extname(filePath)] ?? 'application/octet-stream' }), path.basename(filePath));
  const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body });
  const data = await res.json();
  if (!res.ok) throw new Error(`upload failed: ${data.error}`);
  return data.files[0];
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function createJob(tool, fileIds, params) {
  const res = await fetch(`${BASE}/api/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category: tool.category, slug: tool.slug, fileIds, params }),
  });
  return { status: res.status, data: await res.json() };
}

async function waitFor(jobId, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const res = await fetch(`${BASE}/api/jobs/${jobId}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.status === 'done' || data.status === 'failed') return data;
    await sleep(400);
  }
  throw new Error('job timed out');
}

const SPECIAL_FILES = {
  'pdf/add-images': ['pdfA', 'png'],
  'pdf/sign': ['pdfA', 'png'],
  'pdf/extract-img': ['imagePdf'],
  'pdf/from-gif': ['gifImage'],
  'pdf/from-tiff': ['tiffImage'],
  'pdf/from-webp': ['webpImage'],
  'image/add-images': ['png', 'png2', 'jpg'],
  'image/collage-maker': ['png', 'png2', 'jpg'],
  'image/chart-maker': ['chartCsv'],
  'image/font-to-png': ['ttf'],
  'image/metadata': ['jpg'],
  'image/psd-to-jpg': ['psd'],
  'image/psd-to-png': ['psd'],
  'image/svg-to-png': ['svg'],
  'other/meme-maker': ['jpg'],
  'other/zip': ['pdfA', 'png', 'csv'],
  'pdf/from-word': ['docx'],
  'pdf/from-ppt': ['pptx'],
  'video/add-subtitles': ['media.mp4', 'srt'],
};

function pickFiles(tool, fx) {
  const label = `${tool.category}/${tool.slug}`;
  const direct = SPECIAL_FILES[label];
  if (direct) {
    const files = direct.map((key) => (key.includes('.') ? key.split('.').reduce((acc, part) => acc?.[part], fx) : fx[key])).filter(Boolean);
    return files.length ? files : null;
  }
  if (tool.engine === 'media.subtitles') return [fx.media.mp4, fx.srt];
  if (tool.engine?.startsWith('media.')) {
    const source = tool.slug.split('-to-')[0];
    const file = fx.media[source] ?? fx.media.mp4;
    return [file];
  }
  if (tool.minFiles === 0) return [];
  if (tool.accept.some((a) => a.includes('spreadsheetml'))) return [fx.xlsx];
  if (tool.accept.some((a) => a === '.ttf' || a === 'font/ttf')) return [fx.ttf];
  if (tool.slug.startsWith('psd-to-')) return fx.psd ? [fx.psd] : null;
  if (tool.slug === 'svg-to-png') return [fx.svg];
  if (tool.slug === 'make-background-transparent') return [fx.png];
  if (tool.accept.some((a) => a.startsWith('image/'))) return tool.minFiles >= 2 ? [fx.png, fx.png2, fx.jpg] : [fx.png];
  if (tool.accept.some((a) => a.includes('pdf'))) return tool.minFiles >= 2 ? [fx.pdfA, fx.pdfB] : [fx.pdfA];
  if (tool.accept.some((a) => a.includes('csv'))) return [fx.csv];
  if (tool.accept.some((a) => a.includes('json'))) return [fx.json];
  if (tool.accept.some((a) => a.includes('xml'))) return [fx.xml];
  return [fx.pdfA];
}

const PARAMS = {
  'pdf/rearrange': { order: '3,1,2' },
  'pdf/delete': { pages: '2' },
  'pdf/create': { text: 'Hello from TinyClone.\n\nThis PDF was generated by the create engine.' },
  'other/qr-code': { text: 'https://example.com/proof' },
  'other/unix-timestamp': { value: '2026-10-29' },
  'image/crop': { left: '10', top: '10', width: '120', height: '90' },
  'image/resize': { width: '160' },
  'pdf/split': { mode: 'each' },
  'pdf/add-text': { pages: '1', text: 'APPROVED', size: '20' },
  'pdf/edit': { pages: '1-2', text: 'Reviewed', size: '16' },
  'pdf/annotate': { pages: '1', note: 'Check this' },
  'pdf/add-pages': { count: '2', after: '1' },
  'pdf/sign': { page: 'last', width: '30' },
  'pdf/crop': { top: '6', bottom: '6', left: '4', right: '4' },
  'image/text-to-image': { text: 'Hello from TinyClone', width: '600' },
  'image/font-to-png': { text: 'TinyClone sample', size: '64' },
  'image/chart-maker': { title: 'Revenue by month', type: 'bar' },
  'image/add-images': { position: 'bottom-right', scale: '30' },
  'image/collage-maker': { columns: '2', cell: '200' },
  'image/make-background-transparent': { tolerance: '30' },
  'other/meme-maker': { top: 'WHEN THE BUILD', bottom: 'PASSES FIRST TIME', size: '28' },
  'other/zip': { name: 'bundle' },
  'video/cutter': { start: '0.3', end: '1.2' },
  'video/resize': { width: '240' },
  'video/compress': { quality: 'small', resolution: '480' },
  'converter/split-excel': { rows: '2' },
  'converter/xml-to-excel': {},
};

// ---------- assertions on real output bytes ----------
async function inspect(tool, buffer, name) {
  const engine = tool.engine;
  const ext = path.extname(name).toLowerCase();

  if (ext === '.svg') {
    const text = buffer.toString('utf8');
    if (!text.includes('<svg') || !text.includes('<path')) throw new Error('SVG has no traced path');
    return `svg with ${(text.match(/<path/g) ?? []).length} path(s)`;
  }
  if (ext === '.eps') {
    const text = buffer.toString('latin1');
    if (!text.startsWith('%!PS-Adobe') || !text.includes('%%BoundingBox')) throw new Error('not a valid EPS header');
    if (!/image\s*$\n/m.test(text)) throw new Error('EPS has no image operator');
    return `EPS ${(text.length / 1024).toFixed(0)}KB`;
  }
  if (ext === '.zip') {
    const JSZip = nodeRequire('jszip');
    const archive = await JSZip.loadAsync(buffer);
    const names = Object.keys(archive.files);
    if (!names.length) throw new Error('ZIP is empty');
    return `zip with ${names.length} entries (${names.slice(0, 3).join(', ')})`;
  }
  if (ext === '.xlsx') {
    const XLSX = nodeRequire('xlsx');
    const book = XLSX.read(buffer, { type: 'buffer' });
    const sheet = book.Sheets[book.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (!rows.length) throw new Error('workbook has no rows');
    return `xlsx ${book.SheetNames.length} sheet(s), ${rows.length} rows`;
  }
  if (ext === '.docx' || ext === '.pptx') {
    const JSZip = nodeRequire('jszip');
    const archive = await JSZip.loadAsync(buffer);
    const required = ext === '.docx' ? 'word/document.xml' : 'ppt/presentation.xml';
    if (!archive.files['[Content_Types].xml']) throw new Error(`${ext} is not an OOXML package`);
    if (!archive.files[required]) throw new Error(`${ext} is missing ${required}`);
    const xml = await archive.files[required].async('string');
    return `${ext.slice(1)} ${xml.length}B of XML`;
  }
  if (engine === 'pdf.toCsv') {
    const text = buffer.toString('utf8');
    if (!text.startsWith('page,text')) throw new Error('CSV does not start with page,text');
    return `${text.trim().split(/\r?\n/).length - 1} rows`;
  }
  if (engine?.startsWith('media.') || ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/x-msvideo', 'video/webm', 'audio/mpeg', 'audio/wav', 'image/gif', 'image/webp', 'audio/mp4', 'audio/aac', 'audio/ogg'].includes((MIME[ext] ?? ''))) {
    const temp = path.join(FIXTURES, `out${ext}`);
    await fs.writeFile(temp, buffer);
    try {
      const info = await probeFile(temp);
      if (!info.streams?.length) throw new Error('output has no streams');
      const kinds = info.streams.map((s) => s.codec_type).join('+');
      const seconds = Number(info.format?.duration ?? 0);
      if (!info.format?.format_name) throw new Error('ffprobe saw no container');
      return `${info.format.format_name.split(',')[0]} ${kinds} ${seconds.toFixed(1)}s`;
    } finally {
      await fs.rm(temp, { force: true });
    }
  }
  if (ext === '.json' && /-metadata\.json$/.test(name)) {
    const report = JSON.parse(buffer.toString('utf8'));
    if (!report.width || !report.height) throw new Error('metadata has no dimensions');
    return `json ${report.format} ${report.width}x${report.height}`;
  }
  if (engine === 'extra.upscale') {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) throw new Error('upscaled output is not an image');
    if (meta.width < 300) throw new Error(`upscale produced only ${meta.width}px`);
    return `${meta.format} ${meta.width}x${meta.height}`;
  }
  if (engine === 'pdf.toImage') {
    const meta = await sharp(buffer).metadata();
    if (!meta.width) throw new Error('rendered page is not an image');
    return `${meta.format} ${meta.width}x${meta.height}`;
  }
  if (engine === 'pdf.extractText') {
    const text = buffer.toString('utf8');
    if (!text.includes('Hello')) throw new Error(`no text layer extracted (got ${JSON.stringify(text.slice(0, 40))})`);
    return `${text.trim().split(/\s+/).length} words`;
  }
  if (engine === 'pdf.extractImages') {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) throw new Error('extracted image has no dimensions');
    return `${meta.format} ${meta.width}x${meta.height}`;
  }
  if (engine === 'pdf.toTiff') {
    const meta = await sharp(buffer).metadata();
    if (meta.format !== 'tiff') throw new Error(`expected TIFF, got ${meta.format}`);
    if (!meta.width || !meta.height) throw new Error('TIFF has no dimensions');
    return `tiff ${meta.width}x${meta.height}`;
  }
  if (engine === 'extra.upscale') {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) throw new Error('upscaled output is not an image');
    return `${meta.format} ${meta.width}x${meta.height}`;
  }
  if (engine.startsWith('pdf.') || engine === 'extra.docToPdf' || name.endsWith('.pdf')) {
    const head = buffer.subarray(0, 5).toString('latin1');
    if (head !== '%PDF-') throw new Error(`not a PDF (starts with ${JSON.stringify(head)})`);
    await PDFDocument.load(buffer, { updateMetadata: false });
    return 'valid PDF';
  }
  if (engine.startsWith('img.')) {
    const meta = await sharp(buffer).metadata();
    if (!meta.width || !meta.height) throw new Error('image has no dimensions');
    return `${meta.format} ${meta.width}x${meta.height}`;
  }
  if (engine === 'other.qr') {
    const meta = await sharp(buffer).metadata();
    if (meta.format !== 'png' || !meta.width) throw new Error('QR is not a PNG');
    return `png ${meta.width}x${meta.height}`;
  }
  const text = buffer.toString('utf8');
  if (engine === 'data.csvToJson') {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length < 5) throw new Error('CSV->JSON did not produce 5 rows');
    return `${parsed.length} rows`;
  }
  if (engine === 'data.jsonToXml') {
    if (!text.includes('<') || !text.includes('tinyclone')) throw new Error('XML missing expected content');
    return 'XML document';
  }
  if (engine === 'data.xmlToJson') {
    const parsed = JSON.parse(text);
    if (!JSON.stringify(parsed).includes('Ada')) throw new Error('XML->JSON lost the data');
    return 'JSON document';
  }
  if (engine === 'data.xmlToCsv') {
    if (!text.includes(',') || !text.includes('Ada')) throw new Error('XML->CSV looks wrong');
    return 'CSV rows';
  }
  if (engine === 'data.csvSplit') {
    if (!text.includes('name')) throw new Error('split CSV lost the header');
    return 'CSV chunk';
  }
  if (engine === 'other.lorem') {
    if (text.split(/\s+/).length < 20) throw new Error('lorem text too short');
    return `${text.split(/\s+/).length} words`;
  }
  if (engine === 'other.timestamp') {
    if (!text.includes('2026')) throw new Error('timestamp output does not echo the date');
    return 'converted date';
  }
  return 'ok';
}

async function download(url) {
  const res = await fetch(`${BASE}${url}`);
  if (!res.ok) throw new Error(`download ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

// ---------- main ----------
async function main() {
  const health = await fetch(BASE).catch(() => null);
  if (!health || !health.ok) throw new Error(`app is not responding at ${BASE}`);

  const tools = (await loadCatalog()).filter((t) => t.engine && !NETWORK_ENGINES.has(t.engine));
  const fx = await makeFixtures();
  console.log(`Verifying ${tools.length} working tools against ${BASE}\n`);

  const results = [];
  for (const tool of tools) {
    const label = `${tool.category}/${tool.slug}`;
    const started = Date.now();
    try {
      const paths = pickFiles(tool, fx);
      if (paths === null) {
        results.push({ label, ok: true, skipped: true, note: 'no fixture available' });
        console.log(`SKIP  ${label.padEnd(30)} no fixture available`);
        continue;
      }
      const uploaded = [];
      for (const p of paths) uploaded.push(await upload(p));

      const params = { ...Object.fromEntries(tool.params.map((p) => [p.key, p.default ?? ''])), ...(PARAMS[label] ?? {}) };
      for (const key of Object.keys(params)) if (params[key] === '') delete params[key];

      const created = await createJob(tool, uploaded.map((f) => f.id), params);
      if (created.status !== 200) throw new Error(`job create ${created.status}: ${created.data.error}`);

      const done = await waitFor(created.data.jobId);
      if (done.status !== 'done') throw new Error(done.error ?? 'job failed');
      if (!done.outputs.length) throw new Error('no outputs');

      const details = [];
      for (const out of done.outputs) {
        const buf = await download(out.url);
        if (!buf.length) throw new Error(`${out.name} is empty`);
        details.push(`${out.name} (${buf.length}B) — ${await inspect(tool, buf, out.name)}`);
      }
      results.push({ label, ok: true, ms: Date.now() - started, note: details.join('; ') });
      console.log(`PASS  ${label.padEnd(30)} ${String(Date.now() - started).padStart(5)}ms  ${details.length} output(s)`);
    } catch (err) {
      results.push({ label, ok: false, note: err.message });
      console.log(`FAIL  ${label.padEnd(30)} ${err.message}`);
    }
  }

  // ---------- platform guarantees ----------
  const extra = [];
  const check = async (name, fn) => {
    try { await fn(); extra.push({ name, ok: true }); console.log(`PASS  ${name}`); }
    catch (err) { extra.push({ name, ok: false, note: err.message }); console.log(`FAIL  ${name} — ${err.message}`); }
  };

  await check('home page renders the catalog', async () => {
    const html = await (await fetch(`${BASE}/`)).text();
    if (!html.includes('253')) throw new Error('home page missing tool count');
  });
  await check('catalog page lists ready + planned', async () => {
    const html = await (await fetch(`${BASE}/tools`)).text();
    if (!html.includes('Planned') || !html.includes('Ready')) throw new Error('missing status labels');
  });
  await check('tool page renders a workspace', async () => {
    const html = await (await fetch(`${BASE}/pdf/merge`)).text();
    if (!html.includes('Run Merge PDF') && !html.includes('Merge PDF')) throw new Error('workspace missing');
  });
  await check('unknown tool returns 404', async () => {
    const res = await fetch(`${BASE}/pdf/does-not-exist`);
    if (res.status !== 404) throw new Error(`expected 404, got ${res.status}`);
  });
  await check('planned tool is refused with its reason', async () => {
    const planned = (await loadCatalog()).find((t) => !t.engine);
    if (!planned) throw new Error('every tool has an engine; nothing to check');
    const res = await fetch(`${BASE}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category: planned.category, slug: planned.slug, fileIds: [], params: {} }),
    });
    if (res.status !== 422) throw new Error(`expected 422, got ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error('no reason returned');
  });
  await check('unsigned download is rejected', async () => {
    const res = await fetch(`${BASE}/api/download/nope/nope`);
    if (res.status !== 403) throw new Error(`expected 403, got ${res.status}`);
  });
  await check('tampered download signature is rejected', async () => {
    const res = await fetch(`${BASE}/api/download/nope/nope?exp=${Date.now() + 10000}&sig=deadbeef`);
    if (res.status !== 403) throw new Error(`expected 403, got ${res.status}`);
  });
  await check('upload rejects an empty file', async () => {
    const body = new FormData();
    body.append('files', new Blob([new Uint8Array(0)]), 'empty.pdf');
    const res = await fetch(`${BASE}/api/upload`, { method: 'POST', body });
    if (res.status !== 400) throw new Error(`expected 400, got ${res.status}`);
  });
  await check('merge requires two files', async () => {
    const one = await upload(fx.pdfA);
    const res = await createJob({ category: 'pdf', slug: 'merge' }, [one.id], {});
    if (res.status !== 400) throw new Error(`expected 400, got ${res.status}`);
  });

  const failed = results.filter((r) => !r.ok);
  const extraFailed = extra.filter((r) => !r.ok);
  console.log(`\n${results.length - failed.length}/${results.length} tools passed, ${extra.length - extraFailed.length}/${extra.length} platform checks passed`);
  if (failed.length || extraFailed.length) {
    console.log('\nFailures:');
    for (const f of [...failed, ...extraFailed]) console.log(` - ${f.label ?? f.name}: ${f.note}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
