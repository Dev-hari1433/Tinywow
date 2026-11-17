/**
 * Turns a tool's `accept` list (a mix of extensions, MIME types and wildcards) into
 * short labels a first-time visitor can read. The catalogue stores MIME types for
 * some tools and extensions for others, and raw MIME strings are jargon.
 */

const MIME: Record<string, string> = {
  'application/pdf': 'PDF',
  'application/json': 'JSON',
  'application/xml': 'XML',
  'application/zip': 'ZIP',
  'application/msword': 'DOC',
  'application/vnd.ms-excel': 'XLS',
  'application/vnd.ms-powerpoint': 'PPT',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PPTX',
  'application/x-subrip': 'SRT',
  'image/jpeg': 'JPG',
  'image/jpg': 'JPG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
  'image/webp': 'WEBP',
  'image/avif': 'AVIF',
  'image/tiff': 'TIFF',
  'image/svg+xml': 'SVG',
  'image/vnd.adobe.photoshop': 'PSD',
  'text/csv': 'CSV',
  'text/plain': 'TXT',
  'text/html': 'HTML',
  'text/vtt': 'VTT',
  'text/xml': 'XML',
  'video/mp4': 'MP4',
  'video/quicktime': 'MOV',
  'video/webm': 'WEBM',
  'audio/mpeg': 'MP3',
  'audio/wav': 'WAV',
  'audio/mp4': 'M4A',
  'font/ttf': 'TTF',
  'font/otf': 'OTF',
  'font/woff': 'WOFF',
  'font/woff2': 'WOFF2',
};

const WILDCARD: Record<string, string> = {
  'image/*': 'image',
  'video/*': 'video',
  'audio/*': 'audio',
  '*': 'any file',
};

export function acceptLabels(accept: string[], limit = 3): string[] {
  const out: string[] = [];
  for (const raw of accept) {
    const entry = raw.trim();
    const low = entry.toLowerCase();
    if (!entry || low === 'application/octet-stream') continue;

    let label: string;
    if (entry.startsWith('.')) {
      label = entry.slice(1).toUpperCase();
    } else if (WILDCARD[low]) {
      label = WILDCARD[low];
    } else {
      const known = MIME[low];
      label = known ?? (low.split('/').pop() ?? low).replace(/^x-/, '').toUpperCase();
    }

    if (!out.some((existing) => existing.toLowerCase() === label.toLowerCase())) out.push(label);
    if (out.length >= limit) break;
  }
  return out;
}

export function formatsLine(accept: string[], minFiles: number, limit = 3): string {
  const labels = acceptLabels(accept, limit);
  if (labels.length) return labels.join(' · ');
  return minFiles === 0 ? 'no file needed' : 'any file';
}

export function fileCountLine(minFiles: number, maxFiles: number): string {
  if (minFiles === 0 && maxFiles === 0) return 'no file needed';
  if (maxFiles > 1) return minFiles > 1 ? `${minFiles}–${maxFiles} files` : `up to ${maxFiles} files`;
  return 'one file';
}
