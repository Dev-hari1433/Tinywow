import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import {
  faAlignLeft,
  faArrowRightArrowLeft,
  faClock,
  faClosedCaptioning,
  faCompress,
  faCropSimple,
  faDroplet,
  faEraser,
  faExpand,
  faEye,
  faFile,
  faFileCode,
  faFileCsv,
  faFileExcel,
  faFileExport,
  faFileImage,
  faFileLines,
  faFilePdf,
  faFileVideo,
  faFileWord,
  faFileZipper,
  faFingerprint,
  faFilm,
  faHashtag,
  faImage,
  faImages,
  faLanguage,
  faLayerGroup,
  faLink,
  faLockOpen,
  faMusic,
  faPaintbrush,
  faPalette,
  faQrcode,
  faRotate,
  faRuler,
  faScissors,
  faShapes,
  faShieldHalved,
  faSignature,
  faSpellCheck,
  faTable,
  faTextHeight,
  faTrash,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons';

/**
 * Font Awesome solid glyphs, rendered as a plain <svg> so this module works in
 * server components (the official React wrapper needs context and cannot).
 */
export function ToolIcon({
  icon,
  size = 20,
  className,
}: {
  icon: IconDefinition;
  size?: number;
  className?: string;
}) {
  const [width, height] = icon.icon as unknown as [number, number];
  const raw = icon.icon[4] as string | string[];
  const path = Array.isArray(raw) ? raw.join('') : raw;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={{ display: 'block', flex: 'none' }}
    >
      <path d={path} />
    </svg>
  );
}

/** Keyword → glyph. First match wins, so put the specific jobs above the formats. */
const RULES: [RegExp, IconDefinition][] = [
  [/merge|combine|join\b|append/i, faLayerGroup],
  [/split|separate|paginate|delete pages|remove pages/i, faScissors],
  [/compress|shrink|optimi[sz]e|reduce|minify/i, faCompress],
  [/resize|rescale|scale|enlarge|upscale|upsample/i, faExpand],
  [/crop/i, faCropSimple],
  [/rotate|flip|turn/i, faRotate],
  [/watermark|stamp|brand/i, faDroplet],
  [/protect|encrypt|password|unlock|decrypt|decrypt/i, faLockOpen],
  [/sign|signature/i, faSignature],
  [/ocr|extract text|scan|recogni[sz]e/i, faEye],
  [/translat|language|subtitl|caption/i, faLanguage],
  [/summar|shorten|tl;?dr|abstract/i, faAlignLeft],
  [/rewrit|rephras|paraphras|grammar|proofread|plagiaris/i, faSpellCheck],
  [/remove background|background|eraser|erase|watermark remover/i, faEraser],
  [/color|colour|palette|tint|grayscale|greyscale|sepia/i, faPalette],
  [/enhance|restore|denoise|face|upscale|beautif|cartoon|sketch|paint/i, faWandMagicSparkles],
  [/qr\b|qr code/i, faQrcode],
  [/hash|checksum|sha\d|md5|signature hash/i, faHashtag],
  [/timestamp|timezone|time zone|date|clock|epoch/i, faClock],
  [/unit|length|weight|temperature|convert unit|measure/i, faRuler],
  [/url\b|link|website|domain|html to pdf?/i, faLink],
  [/gif/i, faFilm],
  [/mute|volume|audio|mp3|wav|aac|flac|music|voice|speech/i, faMusic],
  [/subtitle|caption|srt|vtt/i, faClosedCaptioning],
  [/video|mp4|mov\b|mkv|webm|avi\b|trim|clip|frame/i, faFilm],
  [/excel|xlsx|spreadsheet|csv|numbers|pivot/i, faTable],
  [/json|xml|yaml|html|code|markdown|svg/i, faFileCode],
  [/zip|archive|rar|7z|tar\b/i, faFileZipper],
  [/image|photo|picture|png|jpe?g|webp|tiff|heic|bmp|ico/i, faImage],
  [/word|docx|document|epub|mobi|azw3|txt|text|pdf/i, faFileLines],
];

/** One accent per file family, used for icon tiles and status marks. */
export const CATEGORY_ACCENT: Record<string, string> = {
  pdf: 'var(--c-pdf)',
  image: 'var(--c-image)',
  video: 'var(--c-video)',
  write: 'var(--c-write)',
  converter: 'var(--c-converter)',
  other: 'var(--c-other)',
};

const CATEGORY_ICON: Record<string, IconDefinition> = {
  pdf: faFilePdf,
  image: faFileImage,
  video: faFileVideo,
  write: faFileWord,
  converter: faFileExport,
  other: faShapes,
};

export function iconForCategory(category: string): IconDefinition {
  return CATEGORY_ICON[category] ?? faFile;
}

export function iconFor(tool: {
  name: string;
  slug: string;
  category: string;
  engine: string | null;
}): IconDefinition {
  if (!tool.engine) return faClock;
  const haystack = `${tool.name} ${tool.slug.replace(/-/g, ' ')}`;
  for (const [pattern, icon] of RULES) {
    if (pattern.test(haystack)) return icon;
  }
  return iconForCategory(tool.category);
}

const MIME_RULES: [RegExp, IconDefinition][] = [
  [/pdf/, faFilePdf],
  [/^image\//, faFileImage],
  [/^video\//, faFileVideo],
  [/^audio\//, faMusic],
  [/csv/, faFileCsv],
  [/spreadsheet|excel/, faFileExcel],
  [/word|opendocument\.text/, faFileWord],
  [/json|xml|javascript|yaml|plain/, faFileLines],
  [/zip|compressed|archive/, faFileZipper],
];

export function iconForMime(mime: string, name = ''): IconDefinition {
  const haystack = `${mime} ${name.split('.').pop() ?? ''}`.toLowerCase();
  for (const [pattern, icon] of MIME_RULES) {
    if (pattern.test(haystack)) return icon;
  }
  return faFile;
}

/** Unused exports keep the icon set honest if a glyph is referenced later. */
export const EXTRA_ICONS = {
  images: faImages,
  trash: faTrash,
  paintbrush: faPaintbrush,
  arrowSwap: faArrowRightArrowLeft,
  shield: faShieldHalved,
  fingerprint: faFingerprint,
  textHeight: faTextHeight,
} as const;
