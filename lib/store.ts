import { del, get, put } from '@vercel/blob';

/**
 * Storage for lessons learned on serverless: functions have a read-only app
 * directory and their /tmp is per-instance, so uploads, job metadata and
 * outputs live in Vercel Blob when a store is connected. Local development
 * keeps using .data/ and node:sqlite.
 */
export const blobMode = Boolean(process.env.BLOB_STORE_ID ?? process.env.BLOB_READ_WRITE_TOKEN);

export async function putBytes(key: string, body: Buffer, contentType: string): Promise<void> {
  await put(key, body, {
    access: 'private',
    contentType,
    addRandomSuffix: false,
    allowOverwrite: true,
  });
}

export async function putJson(key: string, value: unknown): Promise<void> {
  await putBytes(key, Buffer.from(JSON.stringify(value)), 'application/json');
}

export async function readJson<T>(key: string): Promise<T | null> {
  const result = await get(key, { access: 'private' });
  if (!result || result.statusCode !== 200) return null;
  const text = await new Response(result.stream).text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function readBytes(key: string): Promise<Buffer | null> {
  const result = await get(key, { access: 'private' });
  if (!result || result.statusCode !== 200) return null;
  return Buffer.from(await new Response(result.stream).arrayBuffer());
}

export async function removeBytes(key: string): Promise<void> {
  try {
    await del(key);
  } catch {
    /* best effort */
  }
}
