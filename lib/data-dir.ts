import path from 'node:path';

/**
 * Working directory for uploads, outputs and the job database.
 * Vercel functions ship a read-only app directory, so writes go to /tmp there.
 */
export const DATA_DIR = process.env.VERCEL
  ? path.join('/tmp', 'tinyclone-data')
  : path.join(process.cwd(), '.data');
