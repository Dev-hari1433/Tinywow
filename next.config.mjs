/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    'sharp',
    '@napi-rs/canvas',
    'pdfjs-dist',
    'ffmpeg-static',
    'ffprobe-static',
    'xlsx',
    'pptxgenjs',
    'docx',
    'jszip',
    'ag-psd',
    'potrace',
    'exifr',
  ],
  experimental: {
    serverActions: { bodySizeLimit: '100mb' },
  },
};

export default nextConfig;
