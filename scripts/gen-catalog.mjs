// Generates lib/catalog.ts from the inspected route inventory.
// Run: node scripts/gen-catalog.mjs
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const inventoryPath = path.join(ROOT, '.rea-capture', 'all_tools.txt');
const routes = fs
  .readFileSync(inventoryPath, 'utf8')
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter((l) => /^\/(pdf|image|video|write|converter|other)\//.test(l));

const CATEGORIES = ['pdf', 'image', 'video', 'write', 'converter', 'other'];

const WORD = {
  pdf: 'PDF', jpg: 'JPG', jpeg: 'JPEG', png: 'PNG', svg: 'SVG', webp: 'WebP', avif: 'AVIF',
  heic: 'HEIC', gif: 'GIF', tiff: 'TIFF', eps: 'EPS', psd: 'PSD', vsd: 'VSD', vsdx: 'VSDX',
  docx: 'DOCX', pptx: 'PPTX', xlsx: 'XLSX', csv: 'CSV', json: 'JSON', xml: 'XML', ai: 'AI',
  bg: 'Background', qr: 'QR', url: 'URL', id: 'ID', api: 'API', ocr: 'OCR', mp3: 'MP3',
  mp4: 'MP4', mov: 'MOV', mkv: 'MKV', m4a: 'M4A', webm: 'WebM', wav: 'WAV', fb: 'Facebook',
  inst: 'Instagram', tiktok: 'TikTok', twitter: 'X', youtube: 'YouTube', ppt: 'PPT',
  azw3: 'AZW3', mobi: 'MOBI', epub: 'EPUB', msg: 'MSG', gif_alt: 'GIF', word: 'Word',
  excel: 'Excel', txt: 'TXT', ipynb: 'ipynb', avif2: 'AVIF', apng: 'APNG',
  powerpoint: 'PowerPoint', keynote: 'Keynote', pages: 'Pages', numbers: 'Numbers',
  html: 'HTML', markdown: 'Markdown', eml: 'EML', rtf: 'RTF', odt: 'ODT',
};

// Single-word PDF actions read better with the format appended.
const PDF_VERB = {
  merge: 'Merge PDF', split: 'Split PDF', compress: 'Compress PDF', rotate: 'Rotate PDF',
  rearrange: 'Rearrange PDF', delete: 'Delete PDF Pages', watermark: 'Watermark PDF',
};

const CATEGORY_LABEL = {
  pdf: 'PDF', image: 'Image', video: 'Video', write: 'Write',
  converter: 'Converters', other: 'Utilities',
};

const NAMES = {
  'pdf/merge': 'Merge PDF', 'pdf/split': 'Split PDF', 'pdf/compress': 'Compress PDF',
  'pdf/rotate': 'Rotate PDF', 'pdf/rearrange': 'Rearrange PDF', 'pdf/delete': 'Delete PDF Pages',
  'pdf/create': 'Create PDF', 'pdf/extract-text': 'Extract Text from PDF',
  'pdf/extract-img': 'Extract Images from PDF', 'pdf/from-jpg': 'JPG to PDF',
  'pdf/from-png': 'PNG to PDF', 'pdf/to-jpg': 'PDF to JPG', 'pdf/to-png': 'PDF to PNG',
  'pdf/watermark': 'Watermark PDF', 'pdf/add-text': 'Add Text to PDF', 'pdf/crop': 'Crop PDF',
  'pdf/to-text': 'PDF to Text', 'pdf/add-pages': 'Add Pages to PDF',
  'pdf/remove-watermark': 'Remove PDF Watermark', 'pdf/summarizer': 'PDF Summarizer',
  'image/compress': 'Compress Image', 'image/resize': 'Resize Image', 'image/crop': 'Crop Image',
  'image/grayscale': 'Grayscale Image', 'image/flip': 'Flip Image', 'image/pixelate': 'Pixelate Image',
  'image/border': 'Add Border to Image', 'image/profile-photo': 'Profile Photo Maker',
  'image/crop-circle': 'Crop Image to Circle', 'image/combine-maker': 'Combine Images',
  'image/split': 'Split Image', 'image/remove-bg': 'Remove Background',
  'other/qr-code': 'QR Code Generator', 'other/lorem-ipsum-generator': 'Lorem Ipsum Generator',
  'other/unix-timestamp': 'Unix Timestamp Converter',
  'converter/csv-to-json': 'CSV to JSON', 'converter/json-to-xml': 'JSON to XML',
  'converter/xml-to-json': 'XML to JSON', 'converter/xml-to-csv': 'XML to CSV',
  'converter/split-csv': 'Split CSV',
  'pdf/summarizer': 'PDF Summarizer', 'pdf/translate': 'Translate PDF',
  'pdf/from-url': 'URL to PDF', 'pdf/from-word': 'Word to PDF', 'pdf/from-ppt': 'PowerPoint to PDF',
  'image/upscale': 'Upscale Image', 'image/to-text': 'Image to Text (OCR)',
  'image/tiff-to-text': 'TIFF to Text (OCR)',
  'video/audio-to-text': 'Audio to Text', 'video/to-text': 'Video to Text',
  'video/transcribe-podcast': 'Transcribe Podcast', 'video/summarize-podcast': 'Summarize Podcast',
  'video/youtube-to-text': 'YouTube to Text', 'video/youtube-transcript': 'YouTube Transcript',
  'video/from-fb': 'Download Facebook Video', 'video/from-inst': 'Download Instagram Video',
  'video/from-tiktok': 'Download TikTok Video', 'video/from-twitter': 'Download X Video',
  'video/from-gif': 'GIF to MP4',
  'write/summarize-youtube': 'Summarize YouTube Video',
  'image/change-bg-photo': 'Change Photo Background', 'image/remove-person': 'Remove Person from Photo',
  'image/remove-text-photo': 'Remove Text from Photo', 'image/remove-watermark-photo': 'Remove Watermark from Photo',
  'image/remove-objects': 'Remove Objects from Photo', 'image/cleanup-picture': 'Cleanup Picture',
  'image/colorize-photo': 'Colorize Photo', 'image/ai-image-generator': 'AI Image Generator',
  'image/blur-background': 'Blur Background', 'image/translate': 'Translate Image Text',
};

const split = (slug) => {
  const s = slug.replace(/^\/+/, '');
  const [category, ...rest] = s.split('/');
  return { category, slug: rest.join('/') };
};

const word = (w) => WORD[w] ?? w.charAt(0).toUpperCase() + w.slice(1);

function humanize(slug) {
  const parts = slug.split('-');
  if (parts[0] === 'to') return `to ${parts.slice(1).map(word).join(' ')}`;
  if (parts[0] === 'from') return `${parts.slice(1).map(word).join(' ')} from`;
  return parts.map(word).join(' ');
}

// ---- engine assignment -------------------------------------------------
// Every entry is either backed by a real engine (implemented in lib/engines)
// or explicitly planned with the reason it needs extra infrastructure.
const IMAGE_IN = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif', 'gif', 'tiff']);
const IMAGE_OUT = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'gif']);

const ENGINES = {
  'pdf/merge': { engine: 'pdf.merge', accept: ['application/pdf'], params: [] },
  'pdf/split': {
    engine: 'pdf.split', accept: ['application/pdf'],
    params: [{ key: 'mode', label: 'Split mode', type: 'select', default: 'each',
      options: [{ value: 'each', label: 'One file per page' }, { value: 'ranges', label: 'Custom ranges' }] },
    { key: 'ranges', label: 'Ranges (e.g. 1-3,4-6)', type: 'text', placeholder: '1-3,4-6' }],
  },
  'pdf/compress': {
    engine: 'pdf.compress', accept: ['application/pdf'],
    params: [{ key: 'level', label: 'Compression', type: 'select', default: 'balanced',
      options: [{ value: 'light', label: 'Light' }, { value: 'balanced', label: 'Balanced' }, { value: 'strong', label: 'Strong (drops metadata)' }] }],
  },
  'pdf/rotate': {
    engine: 'pdf.rotate', accept: ['application/pdf'],
    params: [{ key: 'angle', label: 'Rotation', type: 'select', default: '90',
      options: [{ value: '90', label: '90° clockwise' }, { value: '180', label: '180°' }, { value: '270', label: '90° counter-clockwise' }] },
    { key: 'pages', label: 'Pages (blank = all)', type: 'text', placeholder: 'all' }],
  },
  'pdf/rearrange': {
    engine: 'pdf.rearrange', accept: ['application/pdf'],
    params: [{ key: 'order', label: 'New page order', type: 'text', placeholder: '3,1,2', help: 'Comma separated page numbers. Omit pages to drop them.' }],
  },
  'pdf/delete': {
    engine: 'pdf.delete', accept: ['application/pdf'],
    params: [{ key: 'pages', label: 'Pages to delete', type: 'text', placeholder: '2,4-6' }],
  },
  'pdf/create': {
    engine: 'pdf.create', accept: [],
    params: [{ key: 'text', label: 'Document text', type: 'textarea', placeholder: 'Type or paste text…' },
    { key: 'size', label: 'Page size', type: 'select', default: 'a4',
      options: [{ value: 'a4', label: 'A4' }, { value: 'letter', label: 'Letter' }] }],
  },
  'pdf/extract-text': { engine: 'pdf.extractText', accept: ['application/pdf'], params: [] },
  'pdf/to-jpg': {
    engine: 'pdf.toImage', accept: ['application/pdf'], params: [{ key: 'scale', label: 'Scale', type: 'select', default: '2',
      options: [{ value: '1', label: '1x' }, { value: '2', label: '2x' }, { value: '3', label: '3x' }] }],
    fixed: { format: 'jpeg' },
  },
  'pdf/to-png': {
    engine: 'pdf.toImage', accept: ['application/pdf'], params: [{ key: 'scale', label: 'Scale', type: 'select', default: '2',
      options: [{ value: '1', label: '1x' }, { value: '2', label: '2x' }, { value: '3', label: '3x' }] }],
    fixed: { format: 'png' },
  },
  'pdf/from-jpg': { engine: 'pdf.fromImage', accept: ['image/jpeg', 'image/png'], params: [], fixed: {} },
  'pdf/from-png': { engine: 'pdf.fromImage', accept: ['image/jpeg', 'image/png'], params: [], fixed: {} },
  'pdf/watermark': {
    engine: 'pdf.watermark', accept: ['application/pdf'],
    params: [{ key: 'text', label: 'Watermark text', type: 'text', default: 'CONFIDENTIAL' },
    { key: 'opacity', label: 'Opacity (%)', type: 'number', default: '18' },
    { key: 'angle', label: 'Angle (degrees)', type: 'number', default: '45' }],
  },
  'image/compress': {
    engine: 'img.compress', accept: ['image/*'],
    params: [{ key: 'quality', label: 'Quality (1-100)', type: 'number', default: '72' },
    { key: 'format', label: 'Output format', type: 'select', default: 'keep',
      options: [{ value: 'keep', label: 'Keep original' }, { value: 'jpeg', label: 'JPG' }, { value: 'webp', label: 'WebP' }, { value: 'png', label: 'PNG' }] }],
  },
  'image/resize': {
    engine: 'img.resize', accept: ['image/*'],
    params: [{ key: 'width', label: 'Width (px)', type: 'number', placeholder: 'auto' },
    { key: 'height', label: 'Height (px)', type: 'number', placeholder: 'auto' },
    { key: 'fit', label: 'Fit', type: 'select', default: 'inside',
      options: [{ value: 'inside', label: 'Inside (keep ratio)' }, { value: 'cover', label: 'Cover (crop)' }, { value: 'fill', label: 'Stretch' }] },
    { key: 'format', label: 'Output format', type: 'select', default: 'keep',
      options: [{ value: 'keep', label: 'Keep original' }, { value: 'jpeg', label: 'JPG' }, { value: 'png', label: 'PNG' }, { value: 'webp', label: 'WebP' }] }],
  },
  'image/crop': {
    engine: 'img.crop', accept: ['image/*'],
    params: [{ key: 'left', label: 'Left (px)', type: 'number', default: '0' },
    { key: 'top', label: 'Top (px)', type: 'number', default: '0' },
    { key: 'width', label: 'Width (px)', type: 'number' },
    { key: 'height', label: 'Height (px)', type: 'number' }],
  },
  'image/grayscale': { engine: 'img.grayscale', accept: ['image/*'], params: [] },
  'image/flip': {
    engine: 'img.flip', accept: ['image/*'],
    params: [{ key: 'axis', label: 'Flip', type: 'select', default: 'horizontal',
      options: [{ value: 'horizontal', label: 'Horizontal' }, { value: 'vertical', label: 'Vertical' }, { value: 'both', label: 'Both' }] }],
  },
  'image/pixelate': {
    engine: 'img.pixelate', accept: ['image/*'],
    params: [{ key: 'size', label: 'Pixel size', type: 'number', default: '12' }],
  },
  'image/border': {
    engine: 'img.border', accept: ['image/*'],
    params: [{ key: 'width', label: 'Border width (px)', type: 'number', default: '16' },
    { key: 'color', label: 'Colour (hex)', type: 'text', default: '#111827' }],
  },
  'image/profile-photo': {
    engine: 'img.profile', accept: ['image/*'],
    params: [{ key: 'size', label: 'Output size', type: 'select', default: '512',
      options: [{ value: '256', label: '256 × 256' }, { value: '512', label: '512 × 512' }, { value: '1024', label: '1024 × 1024' }] }],
  },
  'image/crop-circle': {
    engine: 'img.circle', accept: ['image/*'],
    params: [{ key: 'size', label: 'Output size', type: 'number', default: '512' }],
  },
  'image/combine-maker': { engine: 'img.combine', accept: ['image/*'], params: [] },
  'image/split': {
    engine: 'img.split', accept: ['image/*'],
    params: [{ key: 'columns', label: 'Columns', type: 'number', default: '2' },
    { key: 'rows', label: 'Rows', type: 'number', default: '2' }],
  },
  'other/qr-code': {
    engine: 'other.qr', accept: [],
    params: [{ key: 'text', label: 'Content', type: 'textarea', placeholder: 'https://example.com' },
    { key: 'size', label: 'Size (px)', type: 'number', default: '512' }],
  },
  'other/lorem-ipsum-generator': {
    engine: 'other.lorem', accept: [],
    params: [{ key: 'paragraphs', label: 'Paragraphs', type: 'number', default: '3' }],
  },
  'other/unix-timestamp': {
    engine: 'other.timestamp', accept: [],
    params: [{ key: 'value', label: 'Timestamp or date', type: 'text', placeholder: '1700000000 or 2026-10-29' }],
  },
  'converter/csv-to-json': { engine: 'data.csvToJson', accept: ['.csv', 'text/csv', 'text/plain'], params: [] },
  'converter/json-to-xml': { engine: 'data.jsonToXml', accept: ['.json', 'application/json', 'text/plain'], params: [] },
  'converter/xml-to-json': { engine: 'data.xmlToJson', accept: ['.xml', 'application/xml', 'text/xml', 'text/plain'], params: [] },
  'converter/xml-to-csv': { engine: 'data.xmlToCsv', accept: ['.xml', 'application/xml', 'text/xml', 'text/plain'], params: [] },
  'converter/split-csv': {
    engine: 'data.csvSplit', accept: ['.csv', 'text/csv', 'text/plain'],
    params: [{ key: 'rows', label: 'Rows per file', type: 'number', default: '1000' }],
  },
};

// ---- second wave: ffmpeg, spreadsheets, overlays, tracing ----------------
const MEDIA_ACCEPT = ['video/*', 'audio/*', '.mp4', '.mov', '.mkv', '.avi', '.webm', '.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg'];
const IMAGE_ACCEPT = ['image/*', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.tiff', '.svg', '.psd'];
const VIDEO_OUT = new Set(['mp4', 'mov', 'mkv', 'avi', 'webm', 'gif', 'webp', 'mp3', 'wav', 'm4a', 'm4r', 'flac', 'ogg', 'aac']);

const param = (key, label, type, def, extra = {}) => ({ key, label, type, default: String(def), ...extra });
const numberP = (key, label, def) => param(key, label, 'number', def);
const textP = (key, label, def, placeholder) => param(key, label, 'text', def, placeholder ? { placeholder } : {});
const selectP = (key, label, def, options) => param(key, label, 'select', def, {
  options: options.map(([value, text]) => ({ value, label: text })),
});

const addEngine = (route, engine, opts = {}) => {
  if (ENGINES[route]) return;
  ENGINES[route] = {
    engine,
    accept: opts.accept ?? ['application/pdf'],
    params: opts.params ?? [],
    fixed: opts.fixed ?? {},
  };
};

const COMPRESS_PARAMS = [
  selectP('quality', 'Quality', 'balanced', [['high', 'High'], ['balanced', 'Balanced'], ['small', 'Smallest file']]),
  selectP('resolution', 'Resolution', 'keep', [['keep', 'Keep original'], ['1080', '1080p'], ['720', '720p'], ['480', '480p']]),
];
const TRIM_PARAMS = [
  textP('start', 'Start (mm:ss or seconds)', '0', '00:05'),
  textP('end', 'End (mm:ss or seconds)', '', '00:20'),
];

for (const r of routes) {
  const { category, slug } = split(r);
  if (category !== 'video' || ENGINES[r]) continue;
  const m = /^([a-z0-9]+)-to-([a-z0-9]+)$/.exec(slug);
  if (m && VIDEO_OUT.has(m[2])) {
    addEngine(r, 'media.convert', { accept: MEDIA_ACCEPT, fixed: { format: m[2] } });
  }
}

addEngine('/video/compress', 'media.compress', { accept: MEDIA_ACCEPT, params: COMPRESS_PARAMS });
addEngine('/video/compress-avi', 'media.compress', { accept: MEDIA_ACCEPT, fixed: { format: 'avi' }, params: COMPRESS_PARAMS });
addEngine('/video/compress-mkv', 'media.compress', { accept: MEDIA_ACCEPT, fixed: { format: 'mkv' }, params: COMPRESS_PARAMS });
addEngine('/video/compress-mov', 'media.compress', { accept: MEDIA_ACCEPT, fixed: { format: 'mov' }, params: COMPRESS_PARAMS });
addEngine('/video/cutter', 'media.trim', { accept: MEDIA_ACCEPT, params: TRIM_PARAMS });
addEngine('/video/extract-audio', 'media.audio', { accept: MEDIA_ACCEPT, fixed: { format: 'mp3' } });
addEngine('/video/mute', 'media.mute', { accept: MEDIA_ACCEPT });
addEngine('/video/resize', 'media.resize', {
  accept: MEDIA_ACCEPT,
  params: [numberP('width', 'Width (px)', 1280), numberP('height', 'Height (px)', '')],
});
addEngine('/video/to-gif', 'media.gif', {
  accept: MEDIA_ACCEPT,
  params: [numberP('fps', 'Frames per second', 10), numberP('width', 'Width (px)', 480)],
});
addEngine('/video/to-webp', 'media.webp', {
  accept: MEDIA_ACCEPT,
  params: [numberP('fps', 'Frames per second', 12), numberP('width', 'Width (px)', 640)],
});
addEngine('/video/add-subtitles', 'media.subtitles', {
  accept: ['video/*', '.srt', '.vtt', '.ass', 'application/x-subrip', 'text/vtt', 'text/plain'],
  params: [numberP('fontSize', 'Subtitle font size', 22)],
});

// ---- image -------------------------------------------------------------
addEngine('/image/add-images', 'img.addImages', {
  accept: IMAGE_ACCEPT,
  params: [
    selectP('position', 'Placement', 'bottom-right', [
      ['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left'], ['top-right', 'Top right'],
      ['top-left', 'Top left'], ['center', 'Centre'], ['stack', 'Stack down the left'],
    ]),
    numberP('scale', 'Overlay width (% of base)', 25),
    numberP('margin', 'Margin (px)', 16),
  ],
});
addEngine('/image/collage-maker', 'img.collage', {
  accept: IMAGE_ACCEPT,
  params: [
    numberP('columns', 'Columns', 2), numberP('cell', 'Tile size (px)', 480),
    numberP('gap', 'Gap (px)', 12), textP('background', 'Background (hex)', '#ffffff'),
  ],
});
addEngine('/image/chart-maker', 'img.chart', {
  accept: ['.csv', 'text/csv', 'text/plain'],
  params: [
    selectP('type', 'Chart type', 'bar', [['bar', 'Bar'], ['line', 'Line'], ['pie', 'Pie']]),
    textP('title', 'Chart title', '', 'Quarterly revenue'),
  ],
});
addEngine('/image/text-to-image', 'img.text', {
  accept: [],
  params: [
    param('text', 'Text', 'textarea', 'Hello from TinyClone'),
    numberP('width', 'Width (px)', 1000), numberP('size', 'Font size (px)', 48),
    textP('color', 'Text colour (hex)', '#ffffff'), textP('background', 'Background (hex)', '#0b1020'),
    selectP('bold', 'Bold', 'no', [['no', 'No'], ['yes', 'Yes']]),
  ],
});
addEngine('/image/font-to-png', 'img.font', {
  accept: ['.ttf', '.otf', '.woff', '.woff2', 'font/ttf', 'font/otf', 'font/woff', 'font/woff2'],
  params: [
    textP('text', 'Sample text', 'The quick brown fox jumps over the lazy dog'),
    numberP('size', 'Font size (px)', 72), textP('color', 'Text colour (hex)', '#111827'),
    textP('background', 'Background (hex)', '#ffffff'),
  ],
});
addEngine('/image/make-background-transparent', 'img.transparent', {
  accept: IMAGE_ACCEPT,
  params: [numberP('tolerance', 'Colour tolerance (0-100)', 24)],
});
addEngine('/image/metadata', 'img.metadata', { accept: IMAGE_ACCEPT });
for (const slug of ['jpg-to-svg', 'png-to-svg', 'tiff-to-svg']) {
  addEngine('/image/' + slug, 'img.trace', {
    accept: IMAGE_ACCEPT,
    params: [numberP('threshold', 'Threshold (1-255)', 160)],
  });
}
addEngine('/image/svg-to-png', 'img.svgToPng', {
  accept: ['.svg', 'image/svg+xml'],
  params: [
    numberP('width', 'Width (px)', 1024),
    selectP('background', 'Background', 'white', [['white', 'White'], ['transparent', 'Transparent']]),
  ],
});
for (const format of ['jpeg', 'png']) {
  addEngine('/image/psd-to-' + (format === 'jpeg' ? 'jpg' : format), 'img.psd', {
    accept: ['.psd', 'image/vnd.adobe.photoshop'], fixed: { format },
  });
}
addEngine('/image/png-to-eps', 'img.eps', { accept: IMAGE_ACCEPT });

// ---- PDF ---------------------------------------------------------------
const TEXT_PARAMS = [
  textP('pages', 'Pages (blank = all)', '', '1-3'),
  param('text', 'Text', 'textarea', 'DRAFT'),
  numberP('size', 'Font size', 18),
  textP('color', 'Colour (hex)', '#dc2626'),
  numberP('x', 'From left (% of page)', 8),
  numberP('y', 'From top (% of page)', 8),
];
addEngine('/pdf/add-text', 'pdf.addText', { params: TEXT_PARAMS });
addEngine('/pdf/edit', 'pdf.addText', { params: TEXT_PARAMS });
addEngine('/pdf/annotate', 'pdf.annotate', {
  params: [
    textP('pages', 'Pages (blank = first page)', '', '1'),
    numberP('x', 'Left (% of page)', 10), numberP('y', 'Top (% of page)', 10),
    numberP('width', 'Width (% of page)', 40), numberP('height', 'Height (% of page)', 8),
    textP('color', 'Highlight colour (hex)', '#f59e0b'),
    numberP('opacity', 'Opacity (%)', 35),
    textP('note', 'Label', '', 'Check this'),
  ],
});
addEngine('/pdf/add-images', 'pdf.stampImages', {
  accept: ['application/pdf', 'image/*'],
  params: [
    selectP('position', 'Placement', 'bottom-right', [
      ['bottom-right', 'Bottom right'], ['bottom-left', 'Bottom left'], ['top-right', 'Top right'],
      ['top-left', 'Top left'], ['center', 'Centre'],
    ]),
    numberP('width', 'Image width (% of page)', 25),
    numberP('opacity', 'Opacity (%)', 100),
    numberP('margin', 'Margin (points)', 18),
  ],
});
addEngine('/pdf/add-pages', 'pdf.addBlank', {
  params: [numberP('count', 'Blank pages', 1), textP('after', 'Insert after page (or end)', 'end', 'end')],
});
addEngine('/pdf/crop', 'pdf.crop', {
  params: [
    numberP('top', 'Top margin (%)', 5), numberP('bottom', 'Bottom margin (%)', 5),
    numberP('left', 'Left margin (%)', 5), numberP('right', 'Right margin (%)', 5),
  ],
});
addEngine('/pdf/extract-img', 'pdf.extractImages');
addEngine('/pdf/sign', 'pdf.sign', {
  accept: ['application/pdf', 'image/*'],
  params: [
    textP('page', 'Page (1, last)', '1'), numberP('width', 'Signature width (% of page)', 25),
    numberP('x', 'From left (%)', 65), numberP('y', 'From top (%)', 78),
  ],
});
addEngine('/pdf/to-word', 'pdf.toDocx');
addEngine('/pdf/to-ppt', 'pdf.toPptx');
addEngine('/pdf/to-xlsx', 'pdf.toXlsx');
addEngine('/pdf/to-csv', 'pdf.toCsv');
addEngine('/pdf/to-tiff', 'pdf.toTiff');
addEngine('/pdf/to-text', 'pdf.extractText');
for (const slug of ['from-gif', 'from-tiff', 'from-webp']) {
  addEngine('/pdf/' + slug, 'pdf.fromImageAny', { accept: IMAGE_ACCEPT });
}

// ---- converters --------------------------------------------------------
const SPREADSHEET_ACCEPT = [
  '.xlsx', '.xls', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel', 'application/octet-stream',
];
addEngine('/converter/csv-to-excel', 'data.csvToExcel', { accept: ['.csv', 'text/csv', 'text/plain'] });
addEngine('/converter/excel-to-csv', 'data.excelToCsv', { accept: SPREADSHEET_ACCEPT });
addEngine('/converter/excel-to-xml', 'data.excelToXml', { accept: SPREADSHEET_ACCEPT });
addEngine('/converter/excel-to-pdf', 'data.excelToPdf', { accept: SPREADSHEET_ACCEPT });
addEngine('/converter/xml-to-excel', 'data.xmlToExcel', { accept: ['.xml', 'application/xml', 'text/xml', 'text/plain'] });
addEngine('/converter/split-excel', 'data.splitExcel', {
  accept: SPREADSHEET_ACCEPT,
  params: [numberP('rows', 'Rows per file', 1000)],
});

// ---- utilities ---------------------------------------------------------
addEngine('/other/meme-maker', 'other.meme', {
  accept: IMAGE_ACCEPT,
  params: [
    textP('top', 'Top text', '', 'WHEN THE BUILD'),
    textP('bottom', 'Bottom text', '', 'PASSES FIRST TIME'),
    numberP('size', 'Font size (px)', 96),
  ],
});
addEngine('/other/zip', 'other.zip', {
  accept: ['*'],
  params: [textP('name', 'Archive name', 'archive')],
});

// ---- third wave: AI text, speech, OCR, document import -----------------
const WRITE_INPUT = {
  'ai-detector': 'Text to check', 'ai-rephraser': 'Text to rephrase',
  'ai-twitter-generator': 'Subject', 'article-generator': 'Subject or brief',
  'article-rewriter': 'Article to rewrite', 'article-writer': 'Article topic',
  'bill-sale-generator': 'What is being sold (item, price, parties)',
  'blog-outline': 'Blog topic', 'business-name-generator': 'What the business does',
  'business-plan-generator': 'Business idea', 'business-slogan-generator': 'Company and what it does',
  'cold-email-writer': 'Who you are writing to and why',
  'content-brief-generator': 'Content topic and goal', 'content-improver': 'Text to improve',
  'content-planner': 'Niche and channels', 'content-summarizer': 'Text to summarise',
  'essay-writer': 'Essay question or topic', 'explain-like-five': 'Concept to explain',
  'facebook-ad-headlines': 'Product, offer and audience', 'faq-generator': 'Product or topic',
  'grammar-fixer': 'Text to correct', 'humanizer-ai': 'Text to humanise',
  'instagram-caption-generator': 'What the post is about',
  'instagram-story-ideas': 'Brand or niche', 'landing-page-copy': 'Product and audience',
  'linkedin-post-generator': 'What you want to say', 'meta-description-generator': 'Page topic or summary',
  'nda-generator': 'Parties and what is being shared', 'paragraph-completer': 'Opening paragraph',
  'paragraph-rewriter': 'Paragraph to rewrite', 'paragraph-writer': 'Topic',
  'paraphrasing': 'Text to paraphrase', 'podcast-writer': 'Episode topic',
  'poll-generator': 'Poll topic', 'post-generator': 'What the post is about',
  'post-ideas': 'Niche or brand', 'post-rewriter': 'Post to rewrite',
  'post-writer': 'Post topic', 'press-release-generator': 'Announcement details',
  'privacy-policy-generator': 'Company, product and data collected',
  'purchase-agreement-generator': 'Goods, price and parties',
  'real-estate-description': 'Property details', 'sentence-rewriter': 'Sentences to rewrite',
  'shorten-content': 'Text to shorten', 'story-generator': 'Story prompt',
  'tiktok-script-writer': 'Video topic', 'title-rewriter': 'Content or current title',
  'tone-of-voice': 'Writing samples', 'translate': 'Text to translate',
  'trivia-generator': 'Trivia subject', 'word-counter': 'Text to measure',
  'youtube-script-writer': 'Video topic',
};
const WRITE_COUNT = new Set([
  'ai-twitter-generator', 'business-name-generator', 'business-slogan-generator',
  'facebook-ad-headlines', 'faq-generator', 'instagram-story-ideas', 'meta-description-generator',
  'poll-generator', 'post-ideas', 'title-rewriter', 'trivia-generator',
]);
const WRITE_AUDIENCE = new Set([
  'article-generator', 'article-writer', 'blog-outline', 'cold-email-writer',
  'content-brief-generator', 'landing-page-copy', 'press-release-generator',
  'real-estate-description', 'tiktok-script-writer', 'youtube-script-writer',
]);

const writeParams = (slug) => {
  const params = [
    param('text', WRITE_INPUT[slug] ?? 'Your text', 'textarea', '', { placeholder: 'Type or paste here…' }),
  ];
  if (slug === 'word-counter') return params;
  params.push(
    selectP('tone', 'Tone', 'neutral', [
      ['neutral', 'Neutral'], ['friendly', 'Friendly'], ['professional', 'Professional'],
      ['persuasive', 'Persuasive'], ['casual', 'Casual'], ['confident', 'Confident'],
    ]),
    selectP('length', 'Length', 'medium', [
      ['short', 'Short (~150 words)'], ['medium', 'Medium (~400 words)'], ['long', 'Long (~900 words)'],
    ]),
  );
  if (WRITE_AUDIENCE.has(slug)) params.push(textP('audience', 'Audience (optional)', ''));
  if (slug === 'translate') {
    params.push(selectP('language', 'Target language', 'English', [
      ['English', 'English'], ['Spanish', 'Spanish'], ['French', 'French'], ['German', 'German'],
      ['Hindi', 'Hindi'], ['Arabic', 'Arabic'], ['Portuguese', 'Portuguese'],
      ['Chinese', 'Chinese'], ['Japanese', 'Japanese'],
    ]));
  }
  params.push(textP('keywords', 'Keywords to include (optional)', ''));
  if (WRITE_COUNT.has(slug)) params.push(numberP('count', 'How many', 5));
  return params;
};

for (const r of routes) {
  const { category, slug } = split(r);
  if (category !== 'write' || ENGINES[r]) continue;
  if (slug === 'summarize-youtube') continue; // downloads and transcribes instead
  addEngine(r, 'ai.write', { accept: [], params: writeParams(slug), fixed: { route: slug } });
}
addEngine('/write/summarize-youtube', 'speech.youtube', {
  accept: [],
  params: [textP('url', 'YouTube URL', '', 'https://www.youtube.com/watch?v=…')],
  fixed: { route: 'summarize-youtube' },
});

// PDF: summarise and translate through the model, import Word/PPT/web pages.
addEngine('/pdf/summarizer', 'ai.pdf', { params: [], fixed: { op: 'summarize' } });
addEngine('/pdf/translate', 'ai.pdf', {
  params: [selectP('language', 'Target language', 'English', [
    ['English', 'English'], ['Spanish', 'Spanish'], ['French', 'French'], ['German', 'German'],
    ['Hindi', 'Hindi'], ['Arabic', 'Arabic'], ['Portuguese', 'Portuguese'],
    ['Chinese', 'Chinese'], ['Japanese', 'Japanese'],
  ])],
  fixed: { op: 'translate' },
});
addEngine('/pdf/from-word', 'extra.docToPdf', {
  accept: ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/octet-stream'],
  fixed: { format: 'word' },
});
addEngine('/pdf/from-ppt', 'extra.docToPdf', {
  accept: ['.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/octet-stream'],
  fixed: { format: 'ppt' },
});
addEngine('/pdf/from-url', 'extra.urlToPdf', {
  accept: [],
  params: [textP('url', 'Page URL', '', 'https://example.com/article')],
  fixed: { format: 'url' },
});

// Image: real upscale + OCR.
addEngine('/image/upscale', 'extra.upscale', {
  accept: IMAGE_ACCEPT,
  params: [
    selectP('factor', 'Scale factor', '2', [['2', '2x'], ['3', '3x'], ['4', '4x']]),
    selectP('format', 'Output format', 'png', [['png', 'PNG'], ['jpeg', 'JPG']]),
  ],
});
for (const slug of ['to-text', 'tiff-to-text']) {
  addEngine('/image/' + slug, 'extra.ocr', { accept: IMAGE_ACCEPT });
}

// Video: speech-to-text, summaries and platform downloaders.
addEngine('/video/audio-to-text', 'speech.transcribe', { accept: MEDIA_ACCEPT });
addEngine('/video/to-text', 'speech.transcribe', { accept: MEDIA_ACCEPT });
addEngine('/video/transcribe-podcast', 'speech.transcribe', { accept: MEDIA_ACCEPT });
addEngine('/video/summarize-podcast', 'speech.summarize', { accept: MEDIA_ACCEPT });
addEngine('/video/youtube-to-text', 'speech.youtube', {
  accept: [], params: [textP('url', 'YouTube URL', '', 'https://www.youtube.com/watch?v=…')], fixed: { route: 'transcript' },
});
addEngine('/video/youtube-transcript', 'speech.youtube', {
  accept: [], params: [textP('url', 'YouTube URL', '', 'https://www.youtube.com/watch?v=…')], fixed: { route: 'transcript' },
});
addEngine('/video/from-fb', 'speech.social', { accept: [], params: [textP('url', 'Video URL', '', 'https://www.facebook.com/watch/?v=…')] });
addEngine('/video/from-inst', 'speech.social', { accept: [], params: [textP('url', 'Video URL', '', 'https://www.instagram.com/reel/…')] });
addEngine('/video/from-tiktok', 'speech.social', { accept: [], params: [textP('url', 'Video URL', '', 'https://www.tiktok.com/@user/video/…')] });
addEngine('/video/from-twitter', 'speech.social', { accept: [], params: [textP('url', 'Video URL', '', 'https://x.com/user/status/…')] });
addEngine('/video/from-gif', 'media.convert', { accept: ['image/gif', '.gif'], fixed: { format: 'mp4' } });

// Normalise explicit engine keys to the slashed route form used by the inventory.
for (const [key, value] of Object.entries({ ...ENGINES })) {
  if (!key.startsWith('/')) {
    ENGINES[`/${key}`] = value;
    delete ENGINES[key];
  }
}

// Generic image format conversions: <in>-to-<out>
for (const r of routes) {
  const { category, slug } = split(r);
  if (category !== 'image') continue;
  if (ENGINES[r]) continue;
  const m = /^([a-z]+)-to-([a-z]+)$/.exec(slug);
  if (m && IMAGE_IN.has(m[1]) && IMAGE_OUT.has(m[2])) {
    ENGINES[r] = {
      engine: 'img.convert',
      accept: ['image/*'],
      params: [{
        key: 'quality', label: 'Quality (1-100)', type: 'number', default: '90',
      }],
      fixed: { format: m[2] === 'jpeg' ? 'jpeg' : m[2] },
    };
  }
}

const PLANNED = {
  video: 'Needs yt-dlp on PATH (python -m pip install yt-dlp) and outbound network access.',
  write: 'Needs an AI provider key: set OPENROUTER_API_KEY, GROQ_API_KEY, GEMINI_API_KEY or MISTRAL_API_KEY in .env.local.',
  image: 'Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).',
  pdf: 'Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.',
  converter: 'Needs Calibre for ebook formats (EPUB/MOBI/AZW3).',
  other: 'Not implemented in this build.',
};

const SUMMARY = {
  'pdf.merge': 'Combine several PDFs into one document, in the order you pick.',
  'pdf.split': 'Split a PDF into single pages or custom page ranges.',
  'pdf.compress': 'Re-save a PDF with tighter object streams to shrink the file.',
  'pdf.rotate': 'Rotate every page or selected pages by 90°, 180° or 270°.',
  'pdf.rearrange': 'Reorder or drop pages by giving the new page sequence.',
  'pdf.delete': 'Remove selected pages from a PDF.',
  'pdf.create': 'Build a clean PDF from typed or pasted text.',
  'pdf.extractText': 'Pull the text layer out of a PDF as a .txt file.',
  'pdf.toImage': 'Render each page to an image at up to 3x scale.',
  'pdf.fromImage': 'Turn one or more JPG/PNG images into a multi-page PDF.',
  'pdf.watermark': 'Stamp diagonal text across every page of a PDF.',
  'img.convert': 'Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.',
  'img.compress': 'Re-encode an image at a lower quality to cut its size.',
  'img.resize': 'Resize by width, height or a fit box while keeping quality.',
  'img.crop': 'Crop a rectangle out of any image.',
  'img.grayscale': 'Convert an image to grayscale.',
  'img.flip': 'Mirror an image horizontally, vertically or both.',
  'img.pixelate': 'Pixelate an image into blocks of a chosen size.',
  'img.border': 'Add a solid colour border around an image.',
  'img.profile': 'Square-crop and export a profile-ready avatar.',
  'img.circle': 'Crop an image to a transparent-background circle.',
  'img.combine': 'Stack several images vertically into a single file.',
  'img.split': 'Slice an image into a grid of equal tiles.',
  'other.qr': 'Generate a QR code PNG for any text or URL.',
  'other.lorem': 'Generate placeholder paragraphs.',
  'other.timestamp': 'Convert between Unix timestamps and readable dates.',
  'data.csvToJson': 'Turn a CSV table into a JSON array of objects.',
  'data.jsonToXml': 'Convert JSON into an XML document.',
  'data.xmlToJson': 'Convert an XML document into JSON.',
  'data.xmlToCsv': 'Flatten a repeated XML element into CSV rows.',
  'data.csvSplit': 'Split a large CSV into files of N rows.',
  'pdf.addText': 'Place your own text anywhere on the pages of a PDF.',
  'pdf.annotate': 'Draw a labelled highlight box over any page.',
  'pdf.stampImages': 'Stamp one or more images onto every page of a PDF.',
  'pdf.addBlank': 'Insert blank pages at any position in the document.',
  'pdf.crop': 'Trim the margins off every page by setting a crop box.',
  'pdf.extractImages': 'Pull the embedded photos and graphics out of a PDF.',
  'pdf.sign': 'Place an image of your signature on any page.',
  'pdf.toDocx': 'Turn a PDF text layer into an editable Word document.',
  'pdf.toPptx': 'Render each PDF page as a slide in a PowerPoint file.',
  'pdf.toXlsx': 'Put the text of each PDF page into an Excel sheet.',
  'pdf.toCsv': 'Export the text of each PDF page as CSV rows.',
  'pdf.toTiff': 'Render every page into one multi-page TIFF.',
  'pdf.fromImageAny': 'Turn GIF, TIFF or WebP images into a multi-page PDF.',
  'img.addImages': 'Place extra images on top of a base image at a chosen corner.',
  'img.collage': 'Arrange several images into a grid collage.',
  'img.chart': 'Turn a two-column CSV into a bar, line or pie chart PNG.',
  'img.text': 'Render typed text into a shareable PNG image.',
  'img.font': 'Preview a TTF/OTF font as a PNG sample.',
  'img.transparent': 'Remove a flat background colour and keep a transparent PNG.',
  'img.metadata': 'Read dimensions, colour profile and EXIF data as JSON.',
  'img.trace': 'Vectorise line art or logos into an SVG path file.',
  'img.svgToPng': 'Rasterise an SVG at the width you choose.',
  'img.psd': 'Export the flattened composite of a Photoshop file.',
  'img.eps': 'Wrap a raster image in a real PostScript/EPS file.',
  'media.convert': 'Transcode between video and audio formats with ffmpeg.',
  'media.compress': 'Re-encode video at a higher CRF and optional lower resolution.',
  'media.trim': 'Cut a clip between a start and end time without re-recording.',
  'media.mute': 'Strip the audio track from a video file.',
  'media.resize': 'Scale a video to a new width and height.',
  'media.gif': 'Turn a video into an animated GIF with palette dithering.',
  'media.webp': 'Turn a video into an animated WebP.',
  'media.audio': 'Extract the audio track as MP3, WAV, M4A or another format.',
  'media.subtitles': 'Burn an SRT/VTT subtitle file into the video picture.',
  'media.frame': 'Grab a single frame from a video as a JPG.',
  'other.meme': 'Add top and bottom caption text to any image.',
  'other.zip': 'Pack the uploaded files into one downloadable ZIP.',
  'data.csvToExcel': 'Convert a CSV table into a real .xlsx workbook.',
  'data.excelToCsv': 'Convert the first sheet of a workbook to CSV.',
  'data.excelToXml': 'Export sheet rows as an XML document.',
  'data.xmlToExcel': 'Turn repeated XML records into an Excel sheet.',
  'data.splitExcel': 'Split a workbook into files of N rows.',
  'data.excelToPdf': 'Print a sheet as a paginated PDF table.',
  'ai.write': 'Generate or rewrite text with a fallback chain of free AI models.',
  'ai.pdf': 'Summarise or translate a PDF with an AI model.',
  'speech.transcribe': 'Transcribe speech from audio or video into text and SRT.',
  'speech.summarize': 'Transcribe a recording and summarise the key points.',
  'speech.youtube': 'Transcribe a YouTube video by downloading its audio.',
  'speech.social': 'Download a public video from Facebook, Instagram, TikTok or X.',
  'extra.upscale': 'Enlarge an image 2-4x with a Lanczos resample and unsharp mask.',
  'extra.ocr': 'Read the text in an image with Mistral OCR and keep the layout.',
  'extra.docToPdf': 'Convert a Word file, a PowerPoint deck or a web page into a PDF.',
  'extra.urlToPdf': 'Convert a web page into a PDF.',
};

// Upload limits mirror lib/engines/index.ts so the UI can size its own dropzone.
const FILE_LIMITS = {
  'pdf.merge': [2, 30], 'pdf.fromImage': [1, 30], 'img.combine': [2, 30],
  'pdf.create': [0, 0], 'other.qr': [0, 0], 'other.lorem': [0, 0], 'other.timestamp': [0, 0],
  'img.text': [0, 0],
  'pdf.stampImages': [2, 30], 'pdf.sign': [2, 2], 'pdf.fromImageAny': [1, 30],
  'img.addImages': [2, 30], 'img.collage': [2, 30], 'media.subtitles': [2, 2],
  'other.zip': [1, 30],
  'ai.write': [0, 0], 'speech.youtube': [0, 0], 'speech.social': [0, 0],
  'extra.urlToPdf': [0, 0], 'extra.ocr': [1, 1], 'extra.upscale': [1, 1],
  'extra.docToPdf': [1, 1], 'ai.pdf': [1, 1], 'speech.transcribe': [1, 1],
  'speech.summarize': [1, 1],
};
const limitsFor = (engine) => FILE_LIMITS[engine] ?? [1, 1];

const tools = [];
for (const r of routes) {
  const { category, slug } = split(r);
  const spec = ENGINES[r] ?? null;
  const pathKey = r;
  const name =
    NAMES[r] ?? NAMES[r.slice(1)] ??
    (category === 'pdf' && PDF_VERB[slug] ? PDF_VERB[slug] : humanize(slug));
  const plannedReason = spec ? null : PLANNED[category] ?? 'Needs a processing engine that is not bundled here.';
  tools.push({
    slug,
    category,
    name,
    engine: spec?.engine ?? null,
    accept: spec?.accept ?? [],
    params: spec?.params ?? [],
    fixed: spec?.fixed ?? {},
    minFiles: spec ? limitsFor(spec.engine)[0] : 0,
    maxFiles: spec ? limitsFor(spec.engine)[1] : 0,
    summary: spec ? SUMMARY[spec.engine] ?? `${name} — processed server-side.` : plannedReason,
    plannedReason,
  });
}

const byCat = CATEGORIES.map((c) => ({ category: c, count: tools.filter((t) => t.category === c).length }));

const header = `// AUTO-GENERATED from .rea-capture/all_tools.txt (inspected route inventory).
// Regenerate with: node scripts/gen-catalog.mjs
export type Category = ${CATEGORIES.map((c) => `'${c}'`).join(' | ')};

export type ParamType = 'text' | 'textarea' | 'number' | 'select';

export interface ToolParam {
  key: string;
  label: string;
  type: ParamType;
  default?: string;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
}

export interface Tool {
  slug: string;
  category: Category;
  name: string;
  engine: string | null;
  accept: string[];
  params: ToolParam[];
  fixed: Record<string, string>;
  minFiles: number;
  maxFiles: number;
  summary: string;
  plannedReason: string | null;
}

export const CATEGORIES: Category[] = ${JSON.stringify(CATEGORIES)};

export const CATEGORY_META: Record<Category, { label: string; blurb: string }> = {
${CATEGORIES.map((c) => `  ${c}: { label: ${JSON.stringify(CATEGORY_LABEL[c])}, blurb: ${JSON.stringify({
  pdf: 'Merge, split, compress and convert PDF documents.',
  image: 'Resize, compress and convert images between formats.',
  video: 'Trim, convert, compress and pull audio out of video with ffmpeg.',
  write: 'Generate and rewrite text with an AI model.',
  converter: 'Move structured data between CSV, JSON, XML and Excel.',
  other: 'Small utility tools that just work.',
}[c])} },`).join('\n')}
};

export const CATEGORY_COUNTS: Record<Category, number> = ${JSON.stringify(Object.fromEntries(byCat.map((b) => [b.category, b.count])), null, 2).replace(/\n/g, '\n')};

export const TOOLS: Tool[] = `;

const footer = [
  ';',
  '',
  'export const TOOL_MAP = new Map(TOOLS.map((t) => [`${t.category}/${t.slug}`, t]));',
  '',
  'export const READY_TOOLS = TOOLS.filter((t) => t.engine !== null);',
  '',
  'export function getTool(category: string, slug: string): Tool | undefined {',
  '  return TOOL_MAP.get(`${category}/${slug}`);',
  '}',
  '',
].join('\n');

const out = header + JSON.stringify(tools, null, 2) + footer;

fs.mkdirSync(path.join(ROOT, 'lib'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'lib', 'catalog.ts'), out);
console.log(`wrote lib/catalog.ts — ${tools.length} tools, ${tools.filter((t) => t.engine).length} ready`);
console.log(byCat.map((b) => `${b.category}:${b.count}`).join(' '));
