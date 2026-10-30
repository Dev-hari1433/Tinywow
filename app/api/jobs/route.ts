import crypto from 'node:crypto';
import { getTool } from '@/lib/catalog';
import { getFile, insertJob } from '@/lib/db';
import { engineSpec } from '@/lib/engines';
import { enqueue } from '@/lib/queue';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  category?: string;
  slug?: string;
  fileIds?: string[];
  params?: Record<string, string>;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return Response.json({ error: 'Expected a JSON body.' }, { status: 400 });
  }

  const { category, slug } = body;
  if (!category || !slug) return Response.json({ error: 'category and slug are required.' }, { status: 400 });

  const tool = getTool(category, slug);
  if (!tool) return Response.json({ error: 'Unknown tool.' }, { status: 404 });
  if (!tool.engine) {
    return Response.json({ error: tool.plannedReason ?? 'This tool is not available yet.' }, { status: 422 });
  }
  const spec = engineSpec(tool.engine);
  if (!spec) return Response.json({ error: 'This tool has no engine attached.' }, { status: 422 });

  const fileIds = Array.isArray(body.fileIds) ? body.fileIds.filter((id) => typeof id === 'string') : [];
  if (fileIds.length < spec.minFiles) {
    return Response.json(
      { error: spec.minFiles === 0 ? 'No files needed.' : `Add at least ${spec.minFiles} file${spec.minFiles === 1 ? '' : 's'}.` },
      { status: 400 },
    );
  }
  if (fileIds.length > spec.maxFiles) {
    return Response.json({ error: `This tool accepts at most ${spec.maxFiles} files.` }, { status: 400 });
  }
  for (const id of fileIds) {
    if (!getFile(id)) return Response.json({ error: 'One of the uploaded files expired. Upload again.' }, { status: 410 });
  }

  // Only declared params are accepted, so nothing unknown reaches an engine.
  const cleanParams: Record<string, string> = {};
  for (const param of tool.params) {
    const raw = body.params?.[param.key];
    if (raw === undefined || raw === null || raw === '') {
      if (param.default !== undefined) cleanParams[param.key] = param.default;
      continue;
    }
    if (typeof raw !== 'string') continue;
    if (param.type === 'number' && !/^-?\d+(\.\d+)?$/.test(raw.trim())) {
      return Response.json({ error: `${param.label} must be a number.` }, { status: 400 });
    }
    if (param.type === 'select' && param.options && !param.options.some((o) => o.value === raw)) {
      return Response.json({ error: `${param.label} has an unsupported value.` }, { status: 400 });
    }
    cleanParams[param.key] = raw.slice(0, 20000);
  }

  const jobId = crypto.randomUUID();
  insertJob({
    id: jobId,
    category: tool.category,
    slug: tool.slug,
    tool_name: tool.name,
    params: JSON.stringify(cleanParams),
    fileIds,
    ttlMs: 60 * 60 * 1000,
  });
  enqueue(jobId);
  return Response.json({ jobId });
}
