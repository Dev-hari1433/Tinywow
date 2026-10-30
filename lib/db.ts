import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export const DATA_DIR = path.join(process.cwd(), '.data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
export const OUTPUT_DIR = path.join(DATA_DIR, 'outputs');
export const TMP_DIR = path.join(DATA_DIR, 'tmp');

for (const dir of [DATA_DIR, UPLOAD_DIR, OUTPUT_DIR, TMP_DIR]) {
  fs.mkdirSync(dir, { recursive: true });
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

export function getDb(): DatabaseSync {
  if (!globalRef.__tinycloneDb) globalRef.__tinycloneDb = open();
  return globalRef.__tinycloneDb;
}

export const now = () => Date.now();

export function insertFile(f: FileRow) {
  getDb()
    .prepare('INSERT INTO files (id, name, mime, size, path, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(f.id, f.name, f.mime, f.size, f.path, f.created_at);
}

export function getFile(id: string): FileRow | undefined {
  return getDb().prepare('SELECT * FROM files WHERE id = ?').get(id) as FileRow | undefined;
}

export function insertJob(j: {
  id: string; category: string; slug: string; tool_name: string; params: string;
  fileIds: string[]; ttlMs: number;
}) {
  const db = getDb();
  const ts = now();
  db.prepare(
    `INSERT INTO jobs (id, category, slug, tool_name, status, progress, message, error, params, created_at, updated_at, expires_at)
     VALUES (?, ?, ?, ?, 'queued', 0, ?, NULL, ?, ?, ?, ?)`,
  ).run(j.id, j.category, j.slug, j.tool_name, 'Queued', j.params, ts, ts, ts + j.ttlMs);
  j.fileIds.forEach((fileId, i) => {
    db.prepare('INSERT INTO job_files (job_id, file_id, position) VALUES (?, ?, ?)').run(j.id, fileId, i);
  });
}

export function getJob(id: string): JobRow | undefined {
  return getDb().prepare('SELECT * FROM jobs WHERE id = ?').get(id) as JobRow | undefined;
}

export function jobFiles(jobId: string): FileRow[] {
  return getDb()
    .prepare(
      `SELECT f.* FROM job_files jf JOIN files f ON f.id = jf.file_id
       WHERE jf.job_id = ? ORDER BY jf.position`,
    )
    .all(jobId) as unknown as FileRow[];
}

export function updateJob(id: string, patch: { status?: JobStatus; progress?: number; message?: string | null; error?: string | null }) {
  const sets: string[] = ['updated_at = ?'];
  const values: (string | number | null)[] = [now()];
  if (patch.status !== undefined) { sets.push('status = ?'); values.push(patch.status); }
  if (patch.progress !== undefined) { sets.push('progress = ?'); values.push(patch.progress); }
  if (patch.message !== undefined) { sets.push('message = ?'); values.push(patch.message); }
  if (patch.error !== undefined) { sets.push('error = ?'); values.push(patch.error); }
  values.push(id);
  getDb().prepare(`UPDATE jobs SET ${sets.join(', ')} WHERE id = ?`).run(...values);
}

export function insertOutput(o: OutputRow) {
  getDb()
    .prepare('INSERT INTO outputs (id, job_id, name, mime, size, path) VALUES (?, ?, ?, ?, ?, ?)')
    .run(o.id, o.job_id, o.name, o.mime, o.size, o.path);
}

export function jobOutputs(jobId: string): OutputRow[] {
  return getDb().prepare('SELECT * FROM outputs WHERE job_id = ? ORDER BY rowid').all(jobId) as unknown as OutputRow[];
}

export function getOutput(jobId: string, outputId: string): OutputRow | undefined {
  return getDb()
    .prepare('SELECT * FROM outputs WHERE job_id = ? AND id = ?')
    .get(jobId, outputId) as OutputRow | undefined;
}

export function markDownloaded(jobId: string) {
  getDb().prepare("UPDATE jobs SET message = 'Downloaded', updated_at = ? WHERE id = ?").run(now(), jobId);
}

/** Deletes files and outputs of jobs older than their expiry. */
export function sweepExpired() {
  const db = getDb();
  const expired = db.prepare('SELECT id, expires_at FROM jobs WHERE expires_at < ?').all(now()) as unknown as {
    id: string; expires_at: number;
  }[];
  for (const job of expired) {
    for (const f of jobFiles(job.id)) removeQuietly(f.path);
    for (const o of jobOutputs(job.id)) removeQuietly(o.path);
    db.prepare('DELETE FROM outputs WHERE job_id = ?').run(job.id);
    db.prepare('DELETE FROM job_files WHERE job_id = ?').run(job.id);
    db.prepare('DELETE FROM jobs WHERE id = ?').run(job.id);
  }
  return expired.length;
}

function removeQuietly(p: string) {
  try { fs.rmSync(p, { force: true }); } catch { /* best effort */ }
}
