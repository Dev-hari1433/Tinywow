import { getJob, jobOutputs } from '@/lib/db';
import { signDownload } from '@/lib/signed';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return Response.json({ error: 'Job not found.' }, { status: 404 });

  const outputs = (await jobOutputs(id)).map((o) => ({
    id: o.id,
    name: o.name,
    mime: o.mime,
    size: o.size,
    url: signDownload(o.job_id, o.id),
  }));

  return Response.json({
    id: job.id,
    tool: `${job.category}/${job.slug}`,
    name: job.tool_name,
    status: job.status,
    progress: job.progress,
    message: job.message,
    error: job.error,
    outputs,
  });
}
