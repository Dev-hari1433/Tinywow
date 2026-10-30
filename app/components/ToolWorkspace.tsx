'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { READY_TOOLS, type Tool } from '@/lib/catalog';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
}

interface Output {
  id: string;
  name: string;
  size: number;
  mime: string;
  url: string;
}

interface JobState {
  status: 'queued' | 'running' | 'done' | 'failed';
  progress: number;
  message: string | null;
  error: string | null;
  outputs: Output[];
}

type Phase = 'idle' | 'uploading' | 'processing' | 'done' | 'failed';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export default function ToolWorkspace({ tool }: { tool: Tool }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [params, setParams] = useState<Record<string, string>>(() =>
    Object.fromEntries(tool.params.map((p) => [p.key, p.default ?? ''])),
  );
  const [phase, setPhase] = useState<Phase>('idle');
  const [job, setJob] = useState<JobState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const needsFiles = tool.minFiles > 0;
  const acceptsMultiple = tool.maxFiles > 1;
  const busy = phase === 'uploading' || phase === 'processing';

  const acceptAttr = useMemo(() => tool.accept.join(','), [tool.accept]);

  async function addFiles(incoming: FileList | null) {
    if (!incoming || !incoming.length) return;
    setError(null);

    const room = acceptsMultiple ? tool.maxFiles - files.length : 1;
    if (!acceptsMultiple && files.length >= 1) {
      setFiles([]);
    }
    const picked = Array.from(incoming).slice(0, Math.max(room, acceptsMultiple ? 0 : 1));
    if (!picked.length) {
      setError(`This tool accepts at most ${tool.maxFiles} file${tool.maxFiles === 1 ? '' : 's'}.`);
      return;
    }

    setPhase('uploading');
    try {
      const body = new FormData();
      for (const file of picked) body.append('files', file);
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = (await res.json()) as { files?: UploadedFile[]; error?: string };
      if (!res.ok || !data.files) throw new Error(data.error ?? 'Upload failed.');
      setFiles((prev) => {
        const base = acceptsMultiple && files.length < tool.maxFiles ? prev : [];
        return [...base, ...data.files!].slice(0, tool.maxFiles);
      });
      setPhase('idle');
    } catch (err) {
      setError((err as Error).message);
      setPhase('failed');
    }
  }

  async function run() {
    setError(null);
    setJob(null);

    if (needsFiles && files.length < tool.minFiles) {
      setError(`Add at least ${tool.minFiles} file${tool.minFiles === 1 ? '' : 's'} first.`);
      return;
    }
    if (!needsFiles && !tool.params.some((p) => (params[p.key] ?? '').trim())) {
      setError('Fill in the fields below to run this tool.');
      return;
    }

    setPhase('processing');
    setJob({ status: 'queued', progress: 0, message: 'Queued', error: null, outputs: [] });

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: tool.category,
          slug: tool.slug,
          fileIds: files.map((f) => f.id),
          params,
        }),
      });
      const created = (await res.json()) as { jobId?: string; error?: string };
      if (!res.ok || !created.jobId) throw new Error(created.error ?? 'Could not start the job.');

      for (let attempt = 0; attempt < 300; attempt++) {
        await sleep(600);
        const poll = await fetch(`/api/jobs/${created.jobId}`, { cache: 'no-store' });
        const data = (await poll.json()) as JobState & { error?: string };
        if (!poll.ok) throw new Error(data.error ?? 'Lost track of the job.');

        setJob(data);
        if (data.status === 'done') {
          setPhase('done');
          return;
        }
        if (data.status === 'failed') {
          setError(data.error ?? 'Processing failed.');
          setPhase('failed');
          return;
        }
      }
      throw new Error('The job is taking longer than expected. Reload to check again.');
    } catch (err) {
      setError((err as Error).message);
      setPhase('failed');
    }
  }

  function reset() {
    setFiles([]);
    setJob(null);
    setError(null);
    setPhase('idle');
    setParams(Object.fromEntries(tool.params.map((p) => [p.key, p.default ?? ''])));
  }

  if (!tool.engine) {
    return (
      <div className="workspace">
        <div className="panel">
          <h2>Not available in this build</h2>
          <p className="muted-block">{tool.plannedReason}</p>
          <p className="muted-block" style={{ marginTop: 12 }}>
            The tool is in the catalog with its inspected name, URL and category, so the surface is
            faithful even where the backend engine is missing.
          </p>
          <p style={{ marginTop: 18 }}>
            <Link href="/tools" className="chip">Browse the {READY_TOOLS.length} working tools →</Link>
          </p>
        </div>
        <div className="panel">
          <h2>What it would need</h2>
          <p className="muted-block">
            Each planned tool is labelled with the concrete missing dependency rather than faked
            with a placeholder result. Nothing here silently returns the input file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace">
      <div className="panel">
        <h2>1 · Input</h2>

        {needsFiles ? (
          <>
            <div
              className={`dropzone${dragging ? ' over' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                void addFiles(e.dataTransfer.files);
              }}
            >
              <strong>{busy ? 'Working…' : 'Choose files or drop them here'}</strong>
              <span>
                {acceptsMultiple
                  ? `Up to ${tool.maxFiles} files`
                  : 'One file'}{' '}
                · max 100 MB
              </span>
              <input
                ref={inputRef}
                type="file"
                accept={acceptAttr}
                multiple={acceptsMultiple}
                onChange={(e) => {
                  void addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>

            {files.length > 0 && (
              <ul className="filelist">
                {files.map((file) => (
                  <li key={file.id}>
                    <span className="name">{file.name}</span>
                    <span className="size">{formatBytes(file.size)}</span>
                    <button
                      type="button"
                      className="icon-btn"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setFiles((prev) => prev.filter((f) => f.id !== file.id))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <p className="muted-block">This tool runs from the fields below — no upload needed.</p>
        )}

        {tool.params.length > 0 && (
          <>
            <h2 style={{ marginTop: 22 }}>2 · Options</h2>
            <div className="fields">
              {tool.params.map((param) => (
                <div className="field" key={param.key}>
                  <label htmlFor={`p-${param.key}`}>{param.label}</label>
                  {param.type === 'select' ? (
                    <select
                      id={`p-${param.key}`}
                      value={params[param.key] ?? ''}
                      onChange={(e) => setParams((p) => ({ ...p, [param.key]: e.target.value }))}
                    >
                      {param.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : param.type === 'textarea' ? (
                    <textarea
                      id={`p-${param.key}`}
                      value={params[param.key] ?? ''}
                      placeholder={param.placeholder}
                      onChange={(e) => setParams((p) => ({ ...p, [param.key]: e.target.value }))}
                    />
                  ) : (
                    <input
                      id={`p-${param.key}`}
                      type={param.type === 'number' ? 'number' : 'text'}
                      value={params[param.key] ?? ''}
                      placeholder={param.placeholder}
                      onChange={(e) => setParams((p) => ({ ...p, [param.key]: e.target.value }))}
                    />
                  )}
                  {param.help && <p className="help">{param.help}</p>}
                </div>
              ))}
            </div>
          </>
        )}

        <button className="primary" type="button" onClick={() => void run()} disabled={busy}>
          {busy ? 'Processing…' : `Run ${tool.name}`}
        </button>

        {phase === 'processing' && job && (
          <div className="progress">
            <div className="bar"><i style={{ width: `${Math.max(4, job.progress)}%` }} /></div>
            <p>{job.message ?? job.status} · {job.progress}%</p>
          </div>
        )}

        {error && <div className="alert error">{error}</div>}
      </div>

      <div className="panel">
        <h2>Result</h2>
        {phase === 'done' && job?.outputs.length ? (
          <>
            <ul className="outputs">
              {job.outputs.map((out) => (
                <li key={out.id}>
                  <div className="meta">
                    <div className="name">{out.name}</div>
                    <div className="sub">{out.mime} · {formatBytes(out.size)}</div>
                  </div>
                  <a className="dl" href={out.url}>Download</a>
                </li>
              ))}
            </ul>
            <p className="help" style={{ marginTop: 12 }}>
              Links are signed and expire in one hour. Files are removed from disk on the same
              schedule.
            </p>
            <button className="primary" type="button" onClick={reset} style={{ marginTop: 12 }}>
              Run again
            </button>
          </>
        ) : (
          <p className="muted-block">
            Your processed file appears here with a download link. Nothing is sent to a third
            party — the work happens on this server.
          </p>
        )}
      </div>
    </div>
  );
}
