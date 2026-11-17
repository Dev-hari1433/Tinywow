import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { UPLOAD_DIR, insertFile, now } from '@/lib/db';
import { blobMode, putBytes } from '@/lib/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BYTES = 100 * 1024 * 1024;

const MIME_BY_EXT: Record<string, string> = {
  '.pdf': 'application/pdf',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.gif': 'image/gif', '.tiff': 'image/tiff', '.tif': 'image/tiff',
  '.csv': 'text/csv', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain',
  '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.mkv': 'video/x-matroska', '.avi': 'video/x-msvideo',
  '.webm': 'video/webm', '.mpeg': 'video/mpeg', '.mpg': 'video/mpeg', '.wmv': 'video/x-ms-wmv',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4', '.m4r': 'audio/mp4',
  '.aac': 'audio/aac', '.flac': 'audio/flac', '.ogg': 'audio/ogg', '.opus': 'audio/ogg',
  '.srt': 'application/x-subrip', '.vtt': 'text/vtt', '.ass': 'text/plain',
  '.psd': 'image/vnd.adobe.photoshop', '.svg': 'image/svg+xml', '.heic': 'image/heic',
  '.ttf': 'font/ttf', '.otf': 'font/otf', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.xls': 'application/vnd.ms-excel',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.zip': 'application/zip', '.epub': 'application/epub+zip', '.mobi': 'application/x-mobipocket-ebook',
  '.azw3': 'application/vnd.amazon.ebook', '.eps': 'application/postscript', '.vsd': 'application/vnd.visio',
};

export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: 'Expected a multipart form upload.' }, { status: 400 });
  }

  const uploads = form.getAll('files').filter((entry): entry is File => typeof entry !== 'string');
  if (!uploads.length) return Response.json({ error: 'No files received.' }, { status: 400 });

  const stored: { id: string; name: string; size: number; mime: string }[] = [];
  for (const file of uploads) {
    if (file.size > MAX_BYTES) {
      return Response.json({ error: `"${file.name}" is larger than the 100 MB limit.` }, { status: 413 });
    }
    if (file.size === 0) {
      return Response.json({ error: `"${file.name}" is empty.` }, { status: 400 });
    }
    const id = crypto.randomUUID();
    const ext = path.extname(file.name).toLowerCase().slice(0, 10);
    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = file.type && file.type !== 'application/octet-stream'
      ? file.type
      : MIME_BY_EXT[ext] ?? 'application/octet-stream';
    const diskPath = blobMode
      ? `tc/uploads/${id}${ext}`
      : path.join(UPLOAD_DIR, `${id}${ext}`);
    if (blobMode) {
      await putBytes(diskPath, buffer, mime);
    } else {
      await fs.writeFile(diskPath, buffer);
    }
    await insertFile({ id, name: path.basename(file.name), mime, size: buffer.length, path: diskPath, created_at: now() });
    stored.push({ id, name: path.basename(file.name), size: buffer.length, mime });
  }

  return Response.json({ files: stored });
}
