import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import {
  OUTPUT_DIR, TMP_DIR, getJob, insertOutput, jobFiles, updateJob,
} from './db';
import { engineSpec } from './engines';
import { UserError } from './engines/types';
import { getTool } from './catalog';

const globalRef = globalThis as unknown as {
  __tinycloneQueue?: { running: number; pending: string[]; max: number };
};

function state() {
  if (!globalRef.__tinycloneQueue) globalRef.__tinycloneQueue = { running: 0, pending: [], max: 2 };
  return globalRef.__tinycloneQueue;
}

export function enqueue(jobId: string) {
  const s = state();
  s.pending.push(jobId);
  pump();
}

function pump() {
  const s = state();
  while (s.running < s.max && s.pending.length) {
    const id = s.pending.shift()!;
    s.running++;
    runJob(id)
      .catch(() => { /* runJob records its own failures */ })
      .finally(() => { s.running--; pump(); });
  }
}

async function runJob(jobId: string) {
  const job = getJob(jobId);
  if (!job) return;
  updateJob(jobId, { status: 'running', progress: 2, message: 'Starting' });
  const tool = getTool(job.category, job.slug);
  const spec = engineSpec(tool?.engine ?? null);
  if (!tool || !spec) {
    updateJob(jobId, { status: 'failed', error: 'This tool has no engine attached.', progress: 0 });
    return;
  }

  const workDir = path.join(TMP_DIR, jobId);
  await fs.mkdir(workDir, { recursive: true });
  const files = jobFiles(jobId).map((f) => ({ id: f.id, name: f.name, mime: f.mime, path: f.path }));

  try {
    const outputs = await spec.fn({
      files,
      params: JSON.parse(job.params) as Record<string, string>,
      fixed: tool.fixed,
      progress: (pct, message) => updateJob(jobId, { progress: Math.min(99, Math.max(0, pct)), message: message ?? null }),
    });

    if (!outputs.length) throw new UserError('The engine produced no output.');
    const jobDir = path.join(OUTPUT_DIR, jobId);
    await fs.mkdir(jobDir, { recursive: true });
    for (const out of outputs) {
      const id = crypto.randomUUID();
      const safe = out.name.replace(/[^\w.\-() ]+/g, '_').slice(0, 120) || 'output';
      const filePath = path.join(jobDir, `${id}-${safe}`);
      await fs.writeFile(filePath, out.buffer);
      insertOutput({
        id,
        job_id: jobId,
        name: safe,
        mime: out.mime,
        size: out.buffer.length,
        path: filePath,
      });
    }
    updateJob(jobId, {
      status: 'done',
      progress: 100,
      message: `${outputs.length} file${outputs.length === 1 ? '' : 's'} ready`,
      error: null,
    });
  } catch (err) {
    const message = err instanceof UserError
      ? err.message
      : `Processing failed: ${(err as Error).message ?? 'unknown error'}`;
    updateJob(jobId, { status: 'failed', progress: 0, message: null, error: message.slice(0, 500) });
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
