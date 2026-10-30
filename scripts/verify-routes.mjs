// Sweep every catalog route and assert it renders with the right status label.
// Usage: node scripts/verify-routes.mjs   (BASE=… to point at another port)
import fs from 'node:fs/promises';

const BASE = process.env.BASE ?? 'http://127.0.0.1:3000';
const src = await fs.readFile('lib/catalog.ts', 'utf8');
const start = src.indexOf('export const TOOLS: Tool[] = ') + 'export const TOOLS: Tool[] = '.length;
const end = src.indexOf('\nexport const TOOL_MAP');
const tools = JSON.parse(src.slice(start, end).trim().replace(/;\s*$/, ''));

let bad = 0;
const failures = [];
for (const tool of tools) {
  const url = `${BASE}/${tool.category}/${tool.slug}`;
  const res = await fetch(url);
  const html = await res.text();
  const wantBadge = tool.engine ? '>Ready<' : '>Planned<';
  if (res.status !== 200 || !html.includes(wantBadge) || !html.includes(tool.name)) {
    bad++;
    failures.push(`${tool.category}/${tool.slug} status=${res.status} badge=${html.includes(wantBadge)} name=${html.includes(tool.name)}`);
  }
}
console.log(`${tools.length - bad}/${tools.length} tool pages rendered correctly`);
for (const f of failures.slice(0, 10)) console.log(' -', f);
process.exitCode = bad ? 1 : 0;
