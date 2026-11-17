'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { READY_TOOLS, type Tool } from '@/lib/catalog';
import { formatsLine } from '@/lib/format-label';
import { ToolIcon, iconFor, iconForMime } from '@/lib/tool-icon';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  preview?: string;
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

const CELLS = 24;

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const MIME_LABEL: Record<string, string> = {
  'application/pdf': 'PDF document',
  'application/zip': 'ZIP archive',
  'application/json': 'JSON',
  'application/xml': 'XML',
  'text/csv': 'CSV',
  'text/plain': 'Text',
  'text/html': 'HTML',
  'text/markdown': 'Markdown',
  'image/jpeg': 'JPEG image',
  'image/png': 'PNG image',
  'image/webp': 'WebP image',
  'image/gif': 'GIF image',
  'image/tiff': 'TIFF image',
  'image/avif': 'AVIF image',
  'video/mp4': 'MP4 video',
  'video/webm': 'WebM video',
  'video/quicktime': 'MOV video',
  'audio/mpeg': 'MP3 audio',
  'audio/wav': 'WAV audio',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel workbook',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint deck',
};

function prettyMime(mime: string) {
  const clean = mime.split(';')[0].trim().toLowerCase();
  if (MIME_LABEL[clean]) return MIME_LABEL[clean];
  const [type, sub] = clean.split('/');
  if (type === 'image') return `${sub.toUpperCase()} image`;
  if (type === 'video') return `${sub.toUpperCase()} video`;
  if (type === 'audio') return `${sub.toUpperCase()} audio`;
  if (type === 'text') return `${sub.toUpperCase()} text`;
  return clean;
}

type Kind = 'image' | 'video' | 'audio' | 'pdf' | 'text' | 'archive' | 'other';

function kindOf(mime: string, name: string): Kind {
  const m = mime.toLowerCase();
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (m.includes('pdf') || ext === 'pdf') return 'pdf';
  if (m.startsWith('image/')) return 'image';
  if (m.startsWith('video/')) return 'video';
  if (m.startsWith('audio/')) return 'audio';
  if (/zip|compressed|archive/.test(m) || ['zip', 'gz', 'tar', '7z', 'rar'].includes(ext))
    return 'archive';
  if (
    m.startsWith('text/') ||
    /json|xml|javascript|yaml|csv|plain/.test(m) ||
    ['txt', 'csv', 'json', 'xml', 'md', 'html', 'srt', 'vtt', 'log'].includes(ext)
  )
    return 'text';
  return 'other';
}

function TextPreview({ url }: { url: string }) {
  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setText(null);
    setFailed(false);
    fetch(url)
      .then((res) => res.text())
      .then((body) => {
        if (alive) setText(body.slice(0, 2000));
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [url]);

  if (failed) return <div className="pv pv-loading">Preview unavailable — download to open it.</div>;
  if (text === null) return <div className="pv pv-loading">Loading preview…</div>;
  return <pre className="pv pv-text">{text || '(empty file)'}</pre>;
}

function OutputPreview({ out }: { out: Output }) {
  const kind = kindOf(out.mime, out.name);

  if (kind === 'image') {
    return (
      <div className="pv">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={out.url} alt={`Preview of ${out.name}`} loading="lazy" />
      </div>
    );
  }
  if (kind === 'video') {
    return (
      <div className="pv">
        <video src={out.url} controls preload="metadata" />
      </div>
    );
  }
  if (kind === 'audio') {
    return (
      <div className="pv pv-audio">
        <audio src={out.url} controls preload="metadata" />
      </div>
    );
  }
  if (kind === 'pdf') {
    return (
      <div className="pv pv-pdf">
        <iframe src={`${out.url}#view=FitH`} title={`Preview of ${out.name}`} loading="lazy" />
      </div>
    );
  }
  if (kind === 'text') return <TextPreview url={out.url} />;
  return null;
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
  const [copied, setCopied] = useState<string | null>(null);
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

      const uploaded = data.files.map((file, i) => {
        const source = picked[i];
        const isImage = source?.type.startsWith('image/') ?? false;
        return { ...file, preview: isImage ? URL.createObjectURL(source) : undefined };
      });

      setFiles((prev) => {
        const base = acceptsMultiple && files.length < tool.maxFiles ? prev : [];
        return [...base, ...uploaded].slice(0, tool.maxFiles);
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
    setCopied(null);
    setParams(Object.fromEntries(tool.params.map((p) => [p.key, p.default ?? ''])));
  }

  function downloadAll() {
    if (!job?.outputs.length) return;
    job.outputs.forEach((out, i) => {
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = out.url;
        a.download = out.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, i * 350);
    });
  }

  async function copyLink(out: Output) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${out.url}`);
      setCopied(out.id);
      setTimeout(() => setCopied((id) => (id === out.id ? null : id)), 2200);
    } catch {
      setError('Could not copy the link — right-click the preview and copy the address instead.');
    }
  }

  if (!tool.engine) {
    return (
      <>
        <div className="notice">
          <h2>Not built yet</h2>
          <p>
            {tool.plannedReason ??
              'This tool is catalogued with its real name and URL but has no engine behind it.'}
          </p>
        </div>
        <div className="workspace" style={{ marginTop: 18 }}>
          <div className="sheet">
            <div className="sheet-head">
              <h2>What it needs</h2>
              <span>Planned</span>
            </div>
            <div className="sheet-body">
              <p className="muted-block">
                Every planned tool names the dependency it is waiting on rather than faking a
                result. Nothing here silently hands your file back unchanged.
              </p>
            </div>
          </div>
          <div className="sheet">
            <div className="sheet-head">
              <h2>What to use instead</h2>
              <span>{READY_TOOLS.length} options</span>
            </div>
            <div className="sheet-body">
              <p className="muted-block">
                {READY_TOOLS.length} tools do work in this build, across the same six categories.
              </p>
              <Link
                href="/tools"
                className="action ghost"
                style={{ display: 'block', textAlign: 'center' }}
              >
                Browse the directory →
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  const lit = Math.round((Math.min(100, Math.max(0, job?.progress ?? 0)) / 100) * CELLS);
  const friendlyFormats = formatsLine(tool.accept, tool.minFiles, 4);
  const done = phase === 'done' && Boolean(job?.outputs.length);

  return (
    <div className="workspace">
      <div className="sheet">
        <div className="sheet-head">
          <h2>1 · File</h2>
          <span>{needsFiles ? 'max 100 MB' : 'no upload needed'}</span>
        </div>
        <div className="sheet-body">
          {needsFiles ? (
            <>
              <div
                className={`dropzone${dragging ? ' over' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    inputRef.current?.click();
                  }
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
                <strong>{busy ? 'Working…' : 'Choose a file or drop it here'}</strong>
                <small>
                  {acceptsMultiple ? `Up to ${tool.maxFiles} files` : 'One file'}
                  {tool.minFiles > 0 ? ` · ${friendlyFormats}` : ''}
                </small>
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
                      {file.preview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img className="file-thumb" src={file.preview} alt="" />
                      ) : (
                        <span className="icon-tile sm" aria-hidden="true">
                          <ToolIcon icon={iconFor(tool)} size={14} />
                        </span>
                      )}
                      <span className="file-meta">
                        <span className="name">{file.name}</span>
                        <span className="size">{formatBytes(file.size)}</span>
                      </span>
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
            <p className="muted-block">
              This one runs from the options below — there is no file to upload.
            </p>
          )}

          {tool.params.length > 0 && (
            <>
              <div className="group-row">
                <h3>2 · Options</h3>
                <span>{tool.params.length} fields</span>
              </div>
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
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
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

          <button
            className="action"
            type="button"
            data-testid="run"
            onClick={() => void run()}
            disabled={busy}
          >
            {busy ? 'Working…' : `Run ${tool.name}`}
          </button>

          {phase === 'processing' && job && (
            <div className="progress" role="status" aria-live="polite">
              <div className="cells" aria-hidden="true">
                {Array.from({ length: CELLS }, (_, i) => (
                  <i key={i} className={i < lit ? 'on' : ''} />
                ))}
              </div>
              <p>
                {job.message ?? job.status} · {job.progress}%
              </p>
            </div>
          )}

          {error && <div className="alert error">{error}</div>}
        </div>
      </div>

      <div className="sheet">
        <div className="sheet-head">
          <h2>Result</h2>
          <span>{done ? `${job!.outputs.length} ready` : 'signed · 1 hour'}</span>
        </div>
        <div className="sheet-body">
          {done ? (
            <>
              <div className="out-bar">
                <span>
                  {job!.outputs.length} file{job!.outputs.length === 1 ? '' : 's'} ready — check the
                  preview, then take it.
                </span>
                {job!.outputs.length > 1 && (
                  <button className="btn-sm primary" type="button" onClick={downloadAll}>
                    Download all
                  </button>
                )}
              </div>

              <ul className="outputs">
                {job!.outputs.map((out) => (
                  <li key={out.id}>
                    <div className="out-top">
                      <span className="icon-tile sm" aria-hidden="true">
                        <ToolIcon icon={iconForMime(out.mime, out.name)} size={15} />
                      </span>
                      <div className="meta">
                        <div className="name">{out.name}</div>
                        <div className="sub">
                          {prettyMime(out.mime)} · {formatBytes(out.size)}
                        </div>
                      </div>
                      <a className="dl" href={out.url} download={out.name}>
                        Download
                      </a>
                    </div>

                    <OutputPreview out={out} />

                    <div className="out-actions">
                      <a
                        className="btn-sm"
                        href={out.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Open the finished file in a new tab"
                      >
                        Open
                      </a>
                      <button className="btn-sm" type="button" onClick={() => void copyLink(out)}>
                        {copied === out.id ? 'Link copied' : 'Copy link'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="smallprint">
                Links are signed and expire in one hour. The files are removed from disk on the same
                schedule.
              </p>

              <button className="action ghost" type="button" onClick={reset}>
                Start over with another file
              </button>
              <Link
                href={`/tools?category=${tool.category}`}
                className="smallprint"
                style={{ display: 'inline-block', marginTop: 10, borderBottom: '1px solid currentColor' }}
              >
                Try a different tool in {tool.category}
              </Link>
            </>
          ) : (
            <>
              <p className="muted-block">
                The finished file lands here with a preview and a download link. It is processed on
                this server — nothing is sent to a third party.
              </p>
              <p className="smallprint">Links and files both disappear after one hour.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
