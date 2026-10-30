import fs from 'node:fs/promises';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { EngineCtx, EngineOutput, UserError, baseName, paramInt } from './types';

// ---------- CSV ---------------------------------------------------------

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else { quoted = false; }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') { quoted = true; continue; }
    if (ch === ',') { row.push(field); field = ''; continue; }
    if (ch === '\r') continue;
    if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; continue; }
    field += ch;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function toCsv(rows: (string | number)[][]): string {
  return rows
    .map((row) =>
      row
        .map((cell) => {
          const s = String(cell ?? '');
          return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(','),
    )
    .join('\r\n');
}

async function readText(ctx: EngineCtx, i = 0): Promise<string> {
  const file = ctx.files[i];
  if (!file) throw new UserError('Add an input file.');
  return fs.readFile(file.path, 'utf8');
}

function nameOf(ctx: EngineCtx, i = 0) {
  return baseName(ctx.files[i]?.name ?? 'data');
}

export const csvToJson = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const rows = parseCsv(await readText(ctx));
  if (rows.length < 2) throw new UserError('This CSV needs a header row and at least one data row.');
  const [header, ...body] = rows;
  ctx.progress(60, `Converting ${body.length} rows`);
  const objects = body.map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((key, i) => { obj[key.trim() || `column_${i + 1}`] = r[i] ?? ''; });
    return obj;
  });
  return [{
    name: `${nameOf(ctx)}.json`,
    mime: 'application/json',
    buffer: Buffer.from(JSON.stringify(objects, null, 2) + '\n', 'utf8'),
  }];
};

export const csvSplit = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const rows = parseCsv(await readText(ctx));
  if (rows.length < 2) throw new UserError('This CSV has no data rows.');
  const perFile = Math.min(500000, Math.max(1, paramInt(ctx.params, 'rows', 1000)));
  const [header, ...body] = rows;
  const outputs: EngineOutput[] = [];
  for (let start = 0; start < body.length; start += perFile) {
    const chunk = body.slice(start, start + perFile);
    outputs.push({
      name: `${nameOf(ctx)}-part-${outputs.length + 1}.csv`,
      mime: 'text/csv; charset=utf-8',
      buffer: Buffer.from(toCsv([header, ...chunk]) + '\r\n', 'utf8'),
    });
    ctx.progress(Math.min(95, Math.round(((start + chunk.length) / body.length) * 95)), `Part ${outputs.length}`);
  }
  return outputs;
};

// ---------- JSON / XML ------------------------------------------------

function xmlEscape(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function toXml(name: string, value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  const safe = /^[A-Za-z_][\w.-]*$/.test(name) ? name : 'item';
  if (value === null || value === undefined) return `${pad}<${safe}/>`;
  if (Array.isArray(value)) return value.map((v) => toXml(safe, v, indent)).join('\n');
  if (typeof value === 'object') {
    const inner = Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => toXml(k, v, indent + 1))
      .join('\n');
    return `${pad}<${safe}>\n${inner}\n${pad}</${safe}>`;
  }
  return `${pad}<${safe}>${xmlEscape(String(value))}</${safe}>`;
}

export const jsonToXml = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const raw = await readText(ctx);
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch (e) {
    throw new UserError(`That is not valid JSON (${(e as Error).message}).`);
  }
  const body = toXml('root', parsed);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${body}\n`;
  return [{ name: `${nameOf(ctx)}.xml`, mime: 'application/xml', buffer: Buffer.from(xml, 'utf8') }];
};

interface XmlNode { name: string; attrs: Record<string, string>; children: XmlNode[]; text: string }

export function parseXml(xml: string): XmlNode {
  const src = xml.replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '');
  const root: XmlNode = { name: '#root', attrs: {}, children: [], text: '' };
  const stack: XmlNode[] = [root];
  const re = /<(\/?)([A-Za-z_][\w.:-]*)((?:\s+[\w.:-]+\s*=\s*"[^"]*"|\s+[\w.:-]+\s*=\s*'[^']*')*)\s*(\/?)>|([^<]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const [, closing, name, attrs, selfClose, text] = m;
    if (text !== undefined) {
      const trimmed = text.trim();
      if (trimmed) stack[stack.length - 1].text += trimmed;
      continue;
    }
    if (closing) {
      if (stack.length > 1) stack.pop();
      continue;
    }
    const node: XmlNode = { name, attrs: {}, children: [], text: '' };
    const attrRe = /([\w.:-]+)\s*=\s*["']([^"']*)["']/g;
    let a: RegExpExecArray | null;
    while ((a = attrRe.exec(attrs ?? ''))) node.attrs[a[1]] = a[2];
    stack[stack.length - 1].children.push(node);
    if (!selfClose) stack.push(node);
  }
  if (!root.children.length) throw new UserError('No XML elements found in that file.');
  return root.children[0];
}

function nodeToValue(node: XmlNode): unknown {
  const base: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(node.attrs)) base[`@${k}`] = v;
  const grouped = new Map<string, XmlNode[]>();
  for (const child of node.children) {
    const list = grouped.get(child.name) ?? [];
    list.push(child);
    grouped.set(child.name, list);
  }
  for (const [name, list] of grouped) {
    const values = list.map((child) => nodeToValue(child));
    base[name] = values.length === 1 ? values[0] : values;
  }
  const text = node.text.trim();
  if (!Object.keys(base).length) return text;
  if (text) base['#text'] = text;
  return base;
}

export const xmlToJson = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const root = parseXml(await readText(ctx));
  const out = { [root.name]: nodeToValue(root) };
  return [{
    name: `${nameOf(ctx)}.json`,
    mime: 'application/json',
    buffer: Buffer.from(JSON.stringify(out, null, 2) + '\n', 'utf8'),
  }];
};

export const xmlToCsv = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const root = parseXml(await readText(ctx));
  // Pick the deepest element name that repeats most often: that is the record.
  const counts = new Map<string, XmlNode[]>();
  const walk = (node: XmlNode) => {
    if (node.children.length) {
      const list = counts.get(node.name) ?? [];
      list.push(node);
      counts.set(node.name, list);
      node.children.forEach(walk);
    }
  };
  walk(root);
  const ranked = [...counts.entries()].sort((a, b) => b[1].length - a[1].length);
  if (!ranked.length) throw new UserError('No repeated XML records were found to flatten.');
  const [recordName, records] = ranked[0];

  const columns = new Set<string>();
  records.forEach((r) => Object.keys(nodeToValue(r) as Record<string, unknown>).forEach((k) => columns.add(k)));
  const header = [...columns];
  const rows = records.map((r) => {
    const value = nodeToValue(r) as Record<string, unknown>;
    return header.map((k) => {
      const cell = value[k];
      if (cell === undefined || cell === null) return '';
      return typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
    });
  });
  return [{
    name: `${nameOf(ctx)}-${recordName}.csv`,
    mime: 'text/csv; charset=utf-8',
    buffer: Buffer.from(toCsv([header, ...rows]) + '\r\n', 'utf8'),
  }];
};

// ---------- Spreadsheets ------------------------------------------------

/** SheetJS ships CommonJS; resolve the namespace or its default interop. */
export async function xlsxModule(): Promise<typeof import('xlsx')> {
  const ns = (await import('xlsx')) as unknown as { default?: typeof import('xlsx') };
  return ns.default ?? (ns as unknown as typeof import('xlsx'));
}

interface SheetData { rows: string[][]; sheets: string[]; name: string }

async function readWorkbook(ctx: EngineCtx): Promise<SheetData> {
  const file = ctx.files[0];
  if (!file) throw new UserError('Add a spreadsheet first.');
  const XLSX = await xlsxModule();
  let workbook: Awaited<ReturnType<typeof XLSX.read>>;
  try {
    workbook = XLSX.read(await fs.readFile(file.path), { type: 'buffer' });
  } catch (err) {
    throw new UserError(`That workbook could not be opened (${(err as Error).message}).`);
  }
  if (!workbook.SheetNames.length) throw new UserError('That workbook has no sheets.');
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = (XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as unknown as unknown[][])
    .map((row) => (Array.isArray(row) ? row : [row]).map((cell) => String(cell ?? '')));
  if (!rows.length || rows.every((r) => r.every((c) => !c.trim()))) {
    throw new UserError('The first sheet has no data rows.');
  }
  return { rows, sheets: workbook.SheetNames, name: baseName(file.name) };
}

function widthsFor(rows: string[][]) {
  const columns = Math.max(...rows.map((r) => r.length));
  return Array.from({ length: columns }, (_, i) =>
    Math.max(10, Math.min(60, ...rows.map((r) => String(r[i] ?? '').length + 2))));
}

async function writeWorkbook(rows: string[][], sheetName = 'Sheet1'): Promise<Buffer> {
  const XLSX = await xlsxModule();
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.aoa_to_sheet(rows.map((row) => row.map((cell) => cell)));
  sheet['!cols'] = widthsFor(rows).map((wch) => ({ wch }));
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName.slice(0, 31));
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}

export const csvToExcel = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const rows = parseCsv(await readText(ctx));
  if (rows.length < 2) throw new UserError('This CSV needs a header row and at least one data row.');
  ctx.progress(60, `Building ${rows.length - 1} rows`);
  const buffer = await writeWorkbook(rows);
  return [{
    name: `${nameOf(ctx)}.xlsx`,
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer,
  }];
};

export const excelToCsv = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { rows, sheets, name } = await readWorkbook(ctx);
  const csv = toCsv(rows);
  ctx.progress(70, `Sheet 1 of ${sheets.length}`);
  return [{
    name: `${name}.csv`,
    mime: 'text/csv; charset=utf-8',
    buffer: Buffer.from(csv + '\r\n', 'utf8'),
  }];
};

export const excelToXml = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { rows, name } = await readWorkbook(ctx);
  const columns = Math.max(...rows.map((r) => r.length));
  const letters = Array.from({ length: columns }, (_, i) => columnLetter(i));
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>', '<sheet>'];
  lines.push('  <header>');
  letters.forEach((letter, i) => {
    lines.push(`    <column index="${letter}">${xmlEscape(rows[0]?.[i] ?? '')}</column>`);
  });
  lines.push('  </header>');
  for (const row of rows.slice(1)) {
    lines.push('  <row>');
    for (let i = 0; i < columns; i++) {
      const value = row[i] ?? '';
      if (!value) continue;
      lines.push(`    <cell column="${letters[i]}">${xmlEscape(value)}</cell>`);
    }
    lines.push('  </row>');
  }
  lines.push('</sheet>');
  return [{
    name: `${name}.xml`,
    mime: 'application/xml',
    buffer: Buffer.from(lines.join('\n') + '\n', 'utf8'),
  }];
};

function columnLetter(index: number) {
  let n = index;
  let label = '';
  do {
    label = String.fromCharCode(65 + (n % 26)) + label;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return label;
}

export const xmlToExcel = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const root = parseXml(await readText(ctx));
  const counts = new Map<string, XmlNode[]>();
  const walk = (node: XmlNode) => {
    if (node.children.length) {
      const list = counts.get(node.name) ?? [];
      list.push(node);
      counts.set(node.name, list);
      node.children.forEach(walk);
    }
  };
  walk(root);
  const ranked = [...counts.entries()].sort((a, b) => b[1].length - a[1].length);
  if (!ranked.length) throw new UserError('No repeated XML records were found.');
  const [, records] = ranked[0];
  const columns = new Set<string>();
  records.forEach((r) => Object.keys(nodeToValue(r) as Record<string, unknown>).forEach((k) => columns.add(k)));
  const header = [...columns];
  const rows = [header, ...records.map((record) => {
    const value = nodeToValue(record) as Record<string, unknown>;
    return header.map((key) => {
      const cell = value[key];
      if (cell === undefined || cell === null) return '';
      return typeof cell === 'object' ? JSON.stringify(cell) : String(cell);
    });
  })];
  ctx.progress(70, `${records.length} records`);
  return [{
    name: `${nameOf(ctx)}.xlsx`,
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: await writeWorkbook(rows),
  }];
};

export const splitExcel = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { rows, name } = await readWorkbook(ctx);
  if (rows.length < 3) throw new UserError('This sheet is too small to split.');
  const perFile = Math.min(100000, Math.max(1, paramInt(ctx.params, 'rows', 1000)));
  const [header, ...body] = rows;
  const outputs: EngineOutput[] = [];
  for (let start = 0; start < body.length; start += perFile) {
    const chunk = body.slice(start, start + perFile);
    outputs.push({
      name: `${name}-part-${outputs.length + 1}.xlsx`,
      mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      buffer: await writeWorkbook([header, ...chunk]),
    });
    ctx.progress(Math.min(95, Math.round(((start + chunk.length) / body.length) * 95)), `Part ${outputs.length}`);
  }
  return outputs;
};

export const excelToPdf = async (ctx: EngineCtx): Promise<EngineOutput[]> => {
  const { rows, name } = await readWorkbook(ctx);
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Courier);
  const size = 8;
  const lineHeight = size * 1.5;
  const margin = 28;
  const width = 841.89;
  const height = 595.28;
  const maxWidth = width - margin * 2;
  const columns = Math.max(...rows.map((r) => r.length));
  const natural = Array.from({ length: columns }, (_, i) =>
    Math.max(6, Math.min(48, ...rows.map((r) => String(r[i] ?? '').length))));
  const totalChars = natural.reduce((a, b) => a + b, 0) || 1;
  const widths = natural.map((chars) => (chars / totalChars) * maxWidth);
  const charWidth = font.widthOfTextAtSize('0', size);

  const clip = (value: string, available: number) => {
    const limit = Math.max(1, Math.floor(available / charWidth) - 1);
    return value.length > limit ? value.slice(0, Math.max(1, limit - 1)) + '…' : value;
  };

  const perPage = Math.floor((height - margin * 2 - lineHeight) / lineHeight);
  const pageCount = Math.max(1, Math.ceil(rows.length / perPage));
  for (let p = 0; p < pageCount; p++) {
    const page = doc.addPage([width, height]);
    let y = height - margin;
    const slice = rows.slice(p * perPage, (p + 1) * perPage);
    slice.forEach((row) => {
      let x = margin;
      for (let c = 0; c < columns; c++) {
        const cell = clip(String(row[c] ?? ''), widths[c]);
        page.drawText(cell, { x, y, size, font, color: rgb(0.1, 0.12, 0.16) });
        x += widths[c];
      }
      y -= lineHeight;
    });
    ctx.progress(Math.round(((p + 1) / pageCount) * 90), `Page ${p + 1} of ${pageCount}`);
  }
  return [{ name: `${name}.pdf`, mime: 'application/pdf', buffer: Buffer.from(await doc.save()) }];
};
