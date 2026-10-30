import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from './db';

const SECRET_FILE = path.join(DATA_DIR, 'secret.key');

function secret(): string {
  const ref = globalThis as unknown as { __tinycloneSecret?: string };
  if (ref.__tinycloneSecret) return ref.__tinycloneSecret;
  if (process.env.APP_SECRET) {
    ref.__tinycloneSecret = process.env.APP_SECRET;
    return ref.__tinycloneSecret;
  }
  if (fs.existsSync(SECRET_FILE)) {
    ref.__tinycloneSecret = fs.readFileSync(SECRET_FILE, 'utf8').trim();
    return ref.__tinycloneSecret;
  }
  const generated = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(SECRET_FILE, generated, { mode: 0o600 });
  ref.__tinycloneSecret = generated;
  return generated;
}

/** Signed, expiring download link for one output of one job. */
export function signDownload(jobId: string, outputId: string, ttlMs = 60 * 60 * 1000) {
  const exp = Date.now() + ttlMs;
  const sig = crypto.createHmac('sha256', secret()).update(`${jobId}:${outputId}:${exp}`).digest('hex').slice(0, 40);
  return `/api/download/${jobId}/${outputId}?exp=${exp}&sig=${sig}`;
}

export function verifyDownload(jobId: string, outputId: string, exp: string | null, sig: string | null): boolean {
  if (!exp || !sig) return false;
  const expNum = Number(exp);
  if (!Number.isFinite(expNum) || expNum < Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret()).update(`${jobId}:${outputId}:${expNum}`).digest('hex').slice(0, 40);
  const a = Buffer.from(expected);
  const b = Buffer.from(sig);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
