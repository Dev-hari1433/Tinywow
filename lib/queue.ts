import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { waitUntil } from '@vercel/functions';
import { OUTPUT_DIR, TMP_DIR, getJob, insertOutput, jobFiles, updateJob } from './db';
import { blobMode, putBytes, readBytes } from './store';
import { engineSpec } from './engines';
import { UserError } from './engines/types';
import { getTool } from './catalog';

export function enqueue(jobId: string) {
  const task = runJob(jobId).catch(() => {
    /* runJob records its own failures */
  });
  // On Vercel the response is sent before processing ends; keep the invocation alive.
  if (process.env.VERCEL) waitUntil(task);
}

async function runJob(jobId: string) {
  const job = await getJob(jobId);
  if (!job) return;
  await updateJob(jobId, { status: 'running', progress: 2, message: 'Starting' });
  const tool = getTool(job.category, job.slug);
  const spec = engineSpec(tool?.engine ?? null);
  if (!tool || !spec) {
    await updateJob(jobId, { status: 'failed', error: 'This tool has no engine attached.', progress: 0 });
    return;
  }

  const workDir = path.join(TMP_DIR, jobId);
  await fs.mkdir(workDir, { recursive: true });
  const files = await jobFiles(jobId);

  // Blob inputs have to be staged on disk before an engine can read them.
  const staged = [] as { id: string; name: string; mime: string; path: string }[];
  for (const f of files) {
    if (!blobMode) {
      staged.push({ id: f.id, name: f.name, mime: f.mime, path: f.path });
      continue;
    }
    const bytes = await readBytes(f.path);
    if (!bytes) throw new UserError('One of the uploaded files expired. Upload again.');
    const local = path.join(workDir, `${f.id}-${path.basename(f.path)}`);
    await fs.writeFile(local, bytes);
    staged.push({ id: f.id, name: f.name, mime: f.mime, path: local });
  }

  let lastProgressWrite = 0;
  try {
    const outputs = await spec.fn({
      files: staged,
      params: JSON.parse(job.params) as Record<string, string>,
      fixed: tool.fixed,
      progress: (pct, message) => {
        const at = Date.now();
        if (blobMode && at - lastProgressWrite < 1200) return;
        lastProgressWrite = at;
        void updateJob(jobId, { progress: Math.min(99, Math.max(0, pct)), message: message ?? null });
      },
    });

    if (!outputs.length) throw new UserError('The engine produced no output.');
    const jobDir = path.join(OUTPUT_DIR, jobId);
    if (!blobMode) await fs.mkdir(jobDir, { recursive: true });
    for (const out of outputs) {
      const id = crypto.randomUUID();
      const safe = out.name.replace(/[^\w.\-() ]+/g, '_').slice(0, 120) || 'output';
      const storedPath = blobMode
        ? `tc/outputs/${jobId}/${id}-${safe}`
        : path.join(jobDir, `${id}-${safe}`);
      if (blobMode) {
        await putBytes(storedPath, out.buffer, out.mime);
      } else {
        await fs.writeFile(storedPath, out.buffer);
      }
      await insertOutput({
        id,
        job_id: jobId,
        name: safe,
        mime: out.mime,
        size: out.buffer.length,
        path: storedPath,
      });
    }
    await updateJob(jobId, {
      status: 'done',
      progress: 100,
      message: `${outputs.length} file${outputs.length === 1 ? '' : 's'} ready`,
      error: null,
    });
  } catch (err) {
    const message = err instanceof UserError
      ? err.message
      : `Processing failed: ${(err as Error).message ?? 'unknown error'}`;
    await updateJob(jobId, { status: 'failed', progress: 0, message: null, error: message.slice(0, 500) });
  } finally {
    await fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
  }
}
