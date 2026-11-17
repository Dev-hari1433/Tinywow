import fs from 'node:fs';
import { Readable } from 'node:stream';
import { getOutput, markDownloaded } from '@/lib/db';
import { blobMode, readBytes } from '@/lib/store';
import { verifyDownload } from '@/lib/signed';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string; outputId: string }> },
) {
  const { jobId, outputId } = await params;
  const url = new URL(req.url);
  if (!verifyDownload(jobId, outputId, url.searchParams.get('exp'), url.searchParams.get('sig'))) {
    return Response.json({ error: 'This download link is invalid or has expired.' }, { status: 403 });
  }
  const output = await getOutput(jobId, outputId);
  if (!output) {
    return Response.json({ error: 'That file is no longer available.' }, { status: 404 });
  }

  const headers = {
    'Content-Type': output.mime,
    'Content-Length': String(output.size),
    'Content-Disposition': `attachment; filename="${encodeURIComponent(output.name)}"; filename*=UTF-8''${encodeURIComponent(output.name)}`,
    'Cache-Control': 'private, no-store',
  };

  if (blobMode) {
    const bytes = await readBytes(output.path);
    if (!bytes) return Response.json({ error: 'That file is no longer available.' }, { status: 404 });
    await markDownloaded(jobId);
    return new Response(new Uint8Array(bytes), { headers });
  }

  if (!fs.existsSync(output.path)) {
    return Response.json({ error: 'That file is no longer available.' }, { status: 404 });
  }

  await markDownloaded(jobId);
  const stream = Readable.toWeb(fs.createReadStream(output.path)) as unknown as ReadableStream;
  return new Response(stream, { headers });
}
