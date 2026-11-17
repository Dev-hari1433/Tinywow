import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR as DATA_ROOT } from './data-dir';
import { blobMode, putJson, readJson, removeBytes } from './store';

export const DATA_DIR = DATA_ROOT;
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
export const OUTPUT_DIR = path.join(DATA_DIR, 'outputs');
export const TMP_DIR = path.join(DATA_DIR, 'tmp');

if (!blobMode) {
  for (const dir of [DATA_DIR, UPLOAD_DIR, OUTPUT_DIR, TMP_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export interface JobRow {
  id: string;
  category: string;
  slug: string;
  tool_name: string;
  status: JobStatus;
  progress: number;
  message: string | null;
  error: string | null;
  params: string;
  created_at: number;
  updated_at: number;
  expires_at: number;
}

export interface FileRow {
  id: string;
  name: string;
  mime: string;
  size: number;
  path: string;
  created_at: number;
}

export interface OutputRow {
  id: string;
  job_id: string;
  name: string;
  mime: string;
  size: number;
  path: string;
}

interface JobRecord {
  row: JobRow;
  fileIds: string[];
  outputs: OutputRow[];
}

const fileKey = (id: string) => `tc/files/${id}.json`;
const jobKey = (id: string) => `tc/jobs/${id}.json`;

export const now = () => Date.now();

// --- local sqlite backing -------------------------------------------------

const globalRef = globalThis as unknown as { __tinycloneDb?: DatabaseSync };

function open(): DatabaseSync {
  const db = new DatabaseSync(path.join(DATA_DIR, 'app.db'));
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, mime TEXT NOT NULL, size INTEGER NOT NULL,
      path TEXT NOT NULL, created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY, category TEXT NOT NULL, slug TEXT NOT NULL, tool_name TEXT NOT NULL,
      status TEXT NOT NULL, progress INTEGER NOT NULL DEFAULT 0, message TEXT, error TEXT,
      params TEXT NOT NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS job_files (
      job_id TEXT NOT NULL, file_id TEXT NOT NULL, position INTEGER NOT NULL,
      PRIMARY KEY (job_id, position)
    );
    CREATE TABLE IF NOT EXISTS outputs (
      id TEXT PRIMARY KEY, job_id TEXT NOT NULL, name TEXT NOT NULL, mime TEXT NOT NULL,
      size INTEGER NOT NULL, path TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_outputs_job ON outputs(job_id);
    CREATE INDEX IF NOT EXISTS idx_job_files_job ON job_files(job_id);
  `);
  return db;
}

function getDb(): DatabaseSync {
  if (!globalRef.__tinycloneDb) globalRef.__tinycloneDb = open();
  return globalRef.__tinycloneDb;
}

// --- files ----------------------------------------------------------------

export async function insertFile(f: FileRow): Promise<void> {
  if (blobMode) {
    await putJson(fileKey(f.id), f);
    return;
  }
  getDb()
    .prepare('INSERT INTO files (id, name, mime, size, path, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(f.id, f.name, f.mime, f.size, f.path, f.created_at);
}

export async function getFile(id: string): Promise<FileRow | undefined> {
  if (blobMode) return (await readJson<FileRow>(fileKey(id))) ?? undefined;
  return getDb().prepare('SELECT * FROM files WHERE id = ?').get(id) as FileRow | undefined;
}

// --- jobs -----------------------------------------------------------------

async function readJobRecord(id: string): Promise<JobRecord | null> {
  return readJson<JobRecord>(jobKey(id));
}

async function writeJobRecord(record: JobRecord): Promise<void> {
  await putJson(jobKey(record.row.id), record);
}

export async function insertJob(j: {
  id: string; category: string; slug: string; tool_name: string; params: string;
  fileIds: string[]; ttlMs: number;
}): Promise<void> {
  const ts = now();
  const row: JobRow = {
    id: j.id,
    category: j.category,
    slug: j.slug,
    tool_name: j.tool_name,
    status: 'queued',
    progress: 0,
    message: 'Queued',
    error: null,
    params: j.params,
    created_at: ts,
    updated_at: ts,
    expires_at: ts + j.ttlMs,
  };

  if (blobMode) {
    await writeJobRecord({ row, fileIds: j.fileIds, outputs: [] });
    return;
  }

  const db = getDb();
  db.prepare(
    `INSERT INTO jobs (id, category, slug, tool_name, status, progress, message, error, params, created_at, updated_at, expires_at)
     VALUES (?, ?, ?, ?, 'queued', 0, ?, NULL, ?, ?, ?, ?)`,
  ).run(j.id, j.category, j.slug, j.tool_name, 'Queued', j.params, ts, ts, ts + j.ttlMs);
  j.fileIds.forEach((fileId, i) => {
    db.prepare('INSERT INTO job_files (job_id, file_id, position) VALUES (?, ?, ?)').run(j.id, fileId, i);
  });
}

export async function getJob(id: string): Promise<JobRow | undefined> {
  if (blobMode) return (await readJobRecord(id))?.row;
  return getDb().prepare('SELECT * FROM jobs WHERE id = ?').get(id) as JobRow | undefined;
}

export async function jobFiles(jobId: string): Promise<FileRow[]> {
  if (blobMode) {
    const record = await readJobRecord(jobId);
    if (!record) return [];
    const files = await Promise.all(record.fileIds.map((id) => getFile(id)));
    return files.filter((f): f is FileRow => Boolean(f));
  }
  return getDb()
    .prepare(
      `SELECT f.* FROM job_files jf JOIN files f ON f.id = jf.file_id
       WHERE jf.job_id = ? ORDER BY jf.position`,
    )
    .all(jobId) as unknown as FileRow[];
}

export async function updateJob(
  id: string,
  patch: { status?: JobStatus; progress?: number; message?: string | null; error?: string | null },
): Promise<void> {
  if (blobMode) {
    const record = await readJobRecord(id);
    if (!record) return;
    if (patch.status !== undefined) record.row.status = patch.status;
    if (patch.progress !== undefined) record.row.progress = patch.progress;
    if (patch.message !== undefined) record.row.message = patch.message;
    if (patch.error !== undefined) record.row.error = patch.error;
    record.row.updated_at = now();
    await writeJobRecord(record);
    return;
  }

  const sets: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [now()];
  if (patch.status !== undefined) { sets.push('status = ?'); values.push(patch.status); }
  if (patch.progress !== undefined) { sets.push('progress = ?'); values.push(patch.progress); }
  if (patch.message !== undefined) { sets.push('message = ?'); values.push(patch.message); }
  if (patch.error !== undefined) { sets.push('error = ?'); values.push(patch.error); }
  values.push(id);
  getDb().prepare(`UPDATE jobs SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

export async function insertOutput(o: OutputRow): Promise<void> {
  if (blobMode) {
    const record = await readJobRecord(o.job_id);
    if (!record) return;
    record.outputs.push(o);
    await writeJobRecord(record);
    return;
  }
  getDb()
    .prepare('INSERT INTO outputs (id, job_id, name, mime, size, path) VALUES (?, ?, ?, ?, ?, ?)')
    .run(o.id, o.job_id, o.name, o.mime, o.size, o.path);
}

export async function jobOutputs(jobId: string): Promise<OutputRow[]> {
  if (blobMode) return (await readJobRecord(jobId))?.outputs ?? [];
  return getDb().prepare('SELECT * FROM outputs WHERE job_id = ? ORDER BY rowid').all(jobId) as unknown as OutputRow[];
}

export async function getOutput(jobId: string, outputId: string): Promise<OutputRow | undefined> {
  if (blobMode) {
    const record = await readJobRecord(jobId);
    return record?.outputs.find((o) => o.id === outputId);
  }
  return getDb()
    .prepare('SELECT * FROM outputs WHERE job_id = ? AND id = ?')
    .get(jobId, outputId) as OutputRow | undefined;
}

export async function markDownloaded(jobId: string): Promise<void> {
  if (blobMode) {
    await updateJob(jobId, { message: 'Downloaded' });
    return;
  }
  getDb().prepare("UPDATE jobs SET message = 'Downloaded', updated_at = ? WHERE id = ?").run(now(), jobId);
}

/** Deletes files and outputs of jobs older than their expiry. Blob stores expire on their own. */
export async function sweepExpired(): Promise<number> {
  if (blobMode) return 0;
  const db = getDb();
  const expired = db.prepare('SELECT id, expires_at FROM jobs WHERE expires_at < ?').all(now()) as unknown as {
    id: string; expires_at: number;
  }[];
  for (const job of expired) {
    for (const f of await jobFiles(job.id)) await removeQuietly(f.path);
    for (const o of await jobOutputs(job.id)) await removeQuietly(o.path);
    db.prepare('DELETE FROM outputs WHERE job_id = ?').run(job.id);
    db.prepare('DELETE FROM job_files WHERE job_id = ?').run(job.id);
    db.prepare('DELETE FROM jobs WHERE id = ?').run(job.id);
  }
  return expired.length;
}

async function removeQuietly(p: string) {
  if (blobMode) {
    await removeBytes(p);
    return;
  }
  try { fs.rmSync(p, { force: true }); } catch { /* best effort */ }
}
