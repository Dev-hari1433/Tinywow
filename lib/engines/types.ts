export interface EngineFile {
  id: string;
  name: string;
  mime: string;
  path: string;
}

export interface EngineCtx {
  files: EngineFile[];
  params: Record<string, string>;
  fixed: Record<string, string>;
  progress: (pct: number, message?: string) => void;
}

export interface EngineOutput {
  name: string;
  mime: string;
  buffer: Buffer;
}

export type EngineFn = (ctx: EngineCtx) => Promise<EngineOutput[]>;

export class UserError extends Error {}

export function baseName(name: string) {
  return name.replace(/\.[^.]+$/, '') || 'file';
}

export function paramInt(params: Record<string, string>, key: string, fallback: number) {
  const raw = params[key];
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

/** Parses "1,3-5" into zero-based page indices (deduplicated, in given order). */
export function parsePages(spec: string, pageCount: number): number[] {
  const out: number[] = [];
  for (const chunk of spec.split(',').map((c) => c.trim()).filter(Boolean)) {
    const range = /^(\d+)\s*-\s*(\d+)$/.exec(chunk);
    if (range) {
      const a = Number(range[1]);
      const b = Number(range[2]);
      for (let p = Math.min(a, b); p <= Math.max(a, b); p++) out.push(p - 1);
    } else if (/^\d+$/.test(chunk)) {
      out.push(Number(chunk) - 1);
    } else {
      throw new UserError(`"${chunk}" is not a page or range.`);
    }
  }
  const valid = out.filter((p) => p >= 0 && p < pageCount);
  if (!valid.length) throw new UserError(`Those pages do not exist in a ${pageCount}-page document.`);
  return [...new Set(valid)];
}

/** Splits "1-3,4-6" into groups, each group becoming its own file. */
export function parsePageGroups(spec: string, pageCount: number): number[][] {
  return spec
    .split(',').map((c) => c.trim()).filter(Boolean)
    .map((chunk) => parsePages(chunk, pageCount));
}
