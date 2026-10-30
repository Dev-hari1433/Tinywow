import * as pdf from './pdf';
import * as pdf2 from './pdf2';
import * as image from './image';
import * as image2 from './image2';
import * as media from './media';
import * as other from './other';
import * as data from './data';
import * as ai from './ai';
import * as speech from './speech';
import * as extra from './extra';
import { EngineFn } from './types';

export interface EngineSpec {
  fn: EngineFn;
  minFiles: number;
  maxFiles: number;
  fileKinds: string;
}

export const ENGINES: Record<string, EngineSpec> = {
  // ---- PDF --------------------------------------------------------------
  'pdf.merge': { fn: pdf.merge, minFiles: 2, maxFiles: 30, fileKinds: 'PDF' },
  'pdf.split': { fn: pdf.split, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.compress': { fn: pdf.compress, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.rotate': { fn: pdf.rotate, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.rearrange': { fn: pdf.rearrange, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.delete': { fn: pdf.removePages, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.create': { fn: pdf.create, minFiles: 0, maxFiles: 0, fileKinds: '' },
  'pdf.extractText': { fn: pdf.extractText, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.toImage': { fn: pdf.toImage, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.fromImage': { fn: pdf.fromImage, minFiles: 1, maxFiles: 30, fileKinds: 'JPG/PNG' },
  'pdf.watermark': { fn: pdf.watermark, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.addText': { fn: pdf2.addText, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.annotate': { fn: pdf2.annotate, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.stampImages': { fn: pdf2.stampImages, minFiles: 2, maxFiles: 30, fileKinds: 'PDF + images' },
  'pdf.addBlank': { fn: pdf2.addBlank, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.crop': { fn: pdf2.crop, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.extractImages': { fn: pdf2.extractImages, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.sign': { fn: pdf2.sign, minFiles: 2, maxFiles: 2, fileKinds: 'PDF + signature image' },
  'pdf.toDocx': { fn: pdf2.toDocx, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.toPptx': { fn: pdf2.toPptx, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.toXlsx': { fn: pdf2.toXlsx, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.toCsv': { fn: pdf2.toCsv, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.toTiff': { fn: pdf2.toTiff, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },
  'pdf.fromImageAny': { fn: pdf2.fromImageAny, minFiles: 1, maxFiles: 30, fileKinds: 'image' },

  // ---- Image ------------------------------------------------------------
  'img.convert': { fn: image.convert, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.compress': { fn: image.compress, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.resize': { fn: image.resize, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.crop': { fn: image.crop, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.grayscale': { fn: image.grayscale, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.flip': { fn: image.flip, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.pixelate': { fn: image.pixelate, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.border': { fn: image.border, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.profile': { fn: image.profile, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.circle': { fn: image.circle, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.combine': { fn: image.combine, minFiles: 2, maxFiles: 30, fileKinds: 'image' },
  'img.split': { fn: image.splitImage, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.addImages': { fn: image2.addImages, minFiles: 2, maxFiles: 30, fileKinds: 'image' },
  'img.collage': { fn: image2.collage, minFiles: 2, maxFiles: 30, fileKinds: 'image' },
  'img.chart': { fn: image2.chart, minFiles: 1, maxFiles: 1, fileKinds: 'CSV' },
  'img.text': { fn: image2.textToImage, minFiles: 0, maxFiles: 0, fileKinds: '' },
  'img.font': { fn: image2.fontToPng, minFiles: 1, maxFiles: 1, fileKinds: 'font' },
  'img.transparent': { fn: image2.transparent, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.metadata': { fn: image2.metadata, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.trace': { fn: image2.toSvg, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'img.svgToPng': { fn: image2.svgToPng, minFiles: 1, maxFiles: 1, fileKinds: 'SVG' },
  'img.psd': { fn: image2.psd, minFiles: 1, maxFiles: 1, fileKinds: 'PSD' },
  'img.eps': { fn: image2.toEps, minFiles: 1, maxFiles: 1, fileKinds: 'image' },

  // ---- Video / audio ----------------------------------------------------
  'media.convert': { fn: media.convert, minFiles: 1, maxFiles: 1, fileKinds: 'media' },
  'media.compress': { fn: media.compress, minFiles: 1, maxFiles: 1, fileKinds: 'media' },
  'media.trim': { fn: media.trim, minFiles: 1, maxFiles: 1, fileKinds: 'media' },
  'media.mute': { fn: media.mute, minFiles: 1, maxFiles: 1, fileKinds: 'media' },
  'media.resize': { fn: media.resize, minFiles: 1, maxFiles: 1, fileKinds: 'media' },
  'media.gif': { fn: media.toGif, minFiles: 1, maxFiles: 1, fileKinds: 'media' },
  'media.webp': { fn: media.toWebp, minFiles: 1, maxFiles: 1, fileKinds: 'media' },
  'media.audio': { fn: media.audio, minFiles: 1, maxFiles: 1, fileKinds: 'media' },
  'media.subtitles': { fn: media.subtitles, minFiles: 2, maxFiles: 2, fileKinds: 'video + subtitles' },
  'media.frame': { fn: media.stillFrame, minFiles: 1, maxFiles: 1, fileKinds: 'media' },

  // ---- Utilities / data -------------------------------------------------
  'other.qr': { fn: other.qr, minFiles: 0, maxFiles: 0, fileKinds: '' },
  'other.lorem': { fn: other.lorem, minFiles: 0, maxFiles: 0, fileKinds: '' },
  'other.timestamp': { fn: other.timestamp, minFiles: 0, maxFiles: 0, fileKinds: '' },
  'other.meme': { fn: other.meme, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'other.zip': { fn: other.zip, minFiles: 1, maxFiles: 30, fileKinds: 'any files' },
  'data.csvToJson': { fn: data.csvToJson, minFiles: 1, maxFiles: 1, fileKinds: 'CSV' },
  'data.csvSplit': { fn: data.csvSplit, minFiles: 1, maxFiles: 1, fileKinds: 'CSV' },
  'data.jsonToXml': { fn: data.jsonToXml, minFiles: 1, maxFiles: 1, fileKinds: 'JSON' },
  'data.xmlToJson': { fn: data.xmlToJson, minFiles: 1, maxFiles: 1, fileKinds: 'XML' },
  'data.xmlToCsv': { fn: data.xmlToCsv, minFiles: 1, maxFiles: 1, fileKinds: 'XML' },
  'data.csvToExcel': { fn: data.csvToExcel, minFiles: 1, maxFiles: 1, fileKinds: 'CSV' },
  'data.excelToCsv': { fn: data.excelToCsv, minFiles: 1, maxFiles: 1, fileKinds: 'Excel' },
  'data.excelToXml': { fn: data.excelToXml, minFiles: 1, maxFiles: 1, fileKinds: 'Excel' },
  'data.xmlToExcel': { fn: data.xmlToExcel, minFiles: 1, maxFiles: 1, fileKinds: 'XML' },
  'data.splitExcel': { fn: data.splitExcel, minFiles: 1, maxFiles: 1, fileKinds: 'Excel' },
  'data.excelToPdf': { fn: data.excelToPdf, minFiles: 1, maxFiles: 1, fileKinds: 'Excel' },

  // ---- AI text -----------------------------------------------------------
  'ai.write': { fn: ai.write, minFiles: 0, maxFiles: 0, fileKinds: '' },
  'ai.pdf': { fn: ai.pdfTool, minFiles: 1, maxFiles: 1, fileKinds: 'PDF' },

  // ---- Speech / downloads ------------------------------------------------
  'speech.transcribe': { fn: speech.transcribe, minFiles: 1, maxFiles: 1, fileKinds: 'audio/video' },
  'speech.summarize': { fn: speech.summarize, minFiles: 1, maxFiles: 1, fileKinds: 'audio/video' },
  'speech.youtube': { fn: speech.youtube, minFiles: 0, maxFiles: 0, fileKinds: '' },
  'speech.social': { fn: speech.social, minFiles: 0, maxFiles: 0, fileKinds: '' },

  // ---- Extra formats -----------------------------------------------------
  'extra.upscale': { fn: extra.upscale, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'extra.ocr': { fn: extra.ocr, minFiles: 1, maxFiles: 1, fileKinds: 'image' },
  'extra.docToPdf': { fn: extra.docToPdf, minFiles: 1, maxFiles: 1, fileKinds: 'document' },
  'extra.urlToPdf': { fn: extra.docToPdf, minFiles: 0, maxFiles: 0, fileKinds: '' },
};

export function engineSpec(id: string | null): EngineSpec | undefined {
  return id ? ENGINES[id] : undefined;
}
