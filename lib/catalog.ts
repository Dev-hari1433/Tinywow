// AUTO-GENERATED from .rea-capture/all_tools.txt (inspected route inventory).
// Regenerate with: node scripts/gen-catalog.mjs
export type Category = 'pdf' | 'image' | 'video' | 'write' | 'converter' | 'other';

export type ParamType = 'text' | 'textarea' | 'number' | 'select';

export interface ToolParam {
  key: string;
  label: string;
  type: ParamType;
  default?: string;
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
}

export interface Tool {
  slug: string;
  category: Category;
  name: string;
  engine: string | null;
  accept: string[];
  params: ToolParam[];
  fixed: Record<string, string>;
  minFiles: number;
  maxFiles: number;
  summary: string;
  plannedReason: string | null;
}

export const CATEGORIES: Category[] = ["pdf","image","video","write","converter","other"];

export const CATEGORY_META: Record<Category, { label: string; blurb: string }> = {
  pdf: { label: "PDF", blurb: "Merge, split, compress and convert PDF documents." },
  image: { label: "Image", blurb: "Resize, compress and convert images between formats." },
  video: { label: "Video", blurb: "Trim, convert, compress and pull audio out of video with ffmpeg." },
  write: { label: "Write", blurb: "Generate and rewrite text with an AI model." },
  converter: { label: "Converters", blurb: "Move structured data between CSV, JSON, XML and Excel." },
  other: { label: "Utilities", blurb: "Small utility tools that just work." },
};

export const CATEGORY_COUNTS: Record<Category, number> = {
  "pdf": 47,
  "image": 76,
  "video": 59,
  "write": 53,
  "converter": 13,
  "other": 5
};

export const TOOLS: Tool[] = [
  {
    "slug": "csv-to-excel",
    "category": "converter",
    "name": "CSV To Excel",
    "engine": "data.csvToExcel",
    "accept": [
      ".csv",
      "text/csv",
      "text/plain"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert a CSV table into a real .xlsx workbook.",
    "plannedReason": null
  },
  {
    "slug": "csv-to-json",
    "category": "converter",
    "name": "CSV to JSON",
    "engine": "data.csvToJson",
    "accept": [
      ".csv",
      "text/csv",
      "text/plain"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Turn a CSV table into a JSON array of objects.",
    "plannedReason": null
  },
  {
    "slug": "epub-to-azw3",
    "category": "converter",
    "name": "EPUB To AZW3",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Calibre for ebook formats (EPUB/MOBI/AZW3).",
    "plannedReason": "Needs Calibre for ebook formats (EPUB/MOBI/AZW3)."
  },
  {
    "slug": "epub-to-mobi",
    "category": "converter",
    "name": "EPUB To MOBI",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Calibre for ebook formats (EPUB/MOBI/AZW3).",
    "plannedReason": "Needs Calibre for ebook formats (EPUB/MOBI/AZW3)."
  },
  {
    "slug": "excel-to-csv",
    "category": "converter",
    "name": "Excel To CSV",
    "engine": "data.excelToCsv",
    "accept": [
      ".xlsx",
      ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert the first sheet of a workbook to CSV.",
    "plannedReason": null
  },
  {
    "slug": "excel-to-pdf",
    "category": "converter",
    "name": "Excel To PDF",
    "engine": "data.excelToPdf",
    "accept": [
      ".xlsx",
      ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Print a sheet as a paginated PDF table.",
    "plannedReason": null
  },
  {
    "slug": "excel-to-xml",
    "category": "converter",
    "name": "Excel To XML",
    "engine": "data.excelToXml",
    "accept": [
      ".xlsx",
      ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Export sheet rows as an XML document.",
    "plannedReason": null
  },
  {
    "slug": "json-to-xml",
    "category": "converter",
    "name": "JSON to XML",
    "engine": "data.jsonToXml",
    "accept": [
      ".json",
      "application/json",
      "text/plain"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert JSON into an XML document.",
    "plannedReason": null
  },
  {
    "slug": "split-csv",
    "category": "converter",
    "name": "Split CSV",
    "engine": "data.csvSplit",
    "accept": [
      ".csv",
      "text/csv",
      "text/plain"
    ],
    "params": [
      {
        "key": "rows",
        "label": "Rows per file",
        "type": "number",
        "default": "1000"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Split a large CSV into files of N rows.",
    "plannedReason": null
  },
  {
    "slug": "split-excel",
    "category": "converter",
    "name": "Split Excel",
    "engine": "data.splitExcel",
    "accept": [
      ".xlsx",
      ".xls",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/octet-stream"
    ],
    "params": [
      {
        "key": "rows",
        "label": "Rows per file",
        "type": "number",
        "default": "1000"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Split a workbook into files of N rows.",
    "plannedReason": null
  },
  {
    "slug": "xml-to-csv",
    "category": "converter",
    "name": "XML to CSV",
    "engine": "data.xmlToCsv",
    "accept": [
      ".xml",
      "application/xml",
      "text/xml",
      "text/plain"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Flatten a repeated XML element into CSV rows.",
    "plannedReason": null
  },
  {
    "slug": "xml-to-excel",
    "category": "converter",
    "name": "XML To Excel",
    "engine": "data.xmlToExcel",
    "accept": [
      ".xml",
      "application/xml",
      "text/xml",
      "text/plain"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Turn repeated XML records into an Excel sheet.",
    "plannedReason": null
  },
  {
    "slug": "xml-to-json",
    "category": "converter",
    "name": "XML to JSON",
    "engine": "data.xmlToJson",
    "accept": [
      ".xml",
      "application/xml",
      "text/xml",
      "text/plain"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an XML document into JSON.",
    "plannedReason": null
  },
  {
    "slug": "add-images",
    "category": "image",
    "name": "Add Images",
    "engine": "img.addImages",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [
      {
        "key": "position",
        "label": "Placement",
        "type": "select",
        "default": "bottom-right",
        "options": [
          {
            "value": "bottom-right",
            "label": "Bottom right"
          },
          {
            "value": "bottom-left",
            "label": "Bottom left"
          },
          {
            "value": "top-right",
            "label": "Top right"
          },
          {
            "value": "top-left",
            "label": "Top left"
          },
          {
            "value": "center",
            "label": "Centre"
          },
          {
            "value": "stack",
            "label": "Stack down the left"
          }
        ]
      },
      {
        "key": "scale",
        "label": "Overlay width (% of base)",
        "type": "number",
        "default": "25"
      },
      {
        "key": "margin",
        "label": "Margin (px)",
        "type": "number",
        "default": "16"
      }
    ],
    "fixed": {},
    "minFiles": 2,
    "maxFiles": 30,
    "summary": "Place extra images on top of a base image at a chosen corner.",
    "plannedReason": null
  },
  {
    "slug": "ai-image-generator",
    "category": "image",
    "name": "AI Image Generator",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "blur-background",
    "category": "image",
    "name": "Blur Background",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "border",
    "category": "image",
    "name": "Add Border to Image",
    "engine": "img.border",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "width",
        "label": "Border width (px)",
        "type": "number",
        "default": "16"
      },
      {
        "key": "color",
        "label": "Colour (hex)",
        "type": "text",
        "default": "#111827"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Add a solid colour border around an image.",
    "plannedReason": null
  },
  {
    "slug": "change-bg-photo",
    "category": "image",
    "name": "Change Photo Background",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "chart-maker",
    "category": "image",
    "name": "Chart Maker",
    "engine": "img.chart",
    "accept": [
      ".csv",
      "text/csv",
      "text/plain"
    ],
    "params": [
      {
        "key": "type",
        "label": "Chart type",
        "type": "select",
        "default": "bar",
        "options": [
          {
            "value": "bar",
            "label": "Bar"
          },
          {
            "value": "line",
            "label": "Line"
          },
          {
            "value": "pie",
            "label": "Pie"
          }
        ]
      },
      {
        "key": "title",
        "label": "Chart title",
        "type": "text",
        "default": "",
        "placeholder": "Quarterly revenue"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Turn a two-column CSV into a bar, line or pie chart PNG.",
    "plannedReason": null
  },
  {
    "slug": "cleanup-picture",
    "category": "image",
    "name": "Cleanup Picture",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "collage-maker",
    "category": "image",
    "name": "Collage Maker",
    "engine": "img.collage",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [
      {
        "key": "columns",
        "label": "Columns",
        "type": "number",
        "default": "2"
      },
      {
        "key": "cell",
        "label": "Tile size (px)",
        "type": "number",
        "default": "480"
      },
      {
        "key": "gap",
        "label": "Gap (px)",
        "type": "number",
        "default": "12"
      },
      {
        "key": "background",
        "label": "Background (hex)",
        "type": "text",
        "default": "#ffffff"
      }
    ],
    "fixed": {},
    "minFiles": 2,
    "maxFiles": 30,
    "summary": "Arrange several images into a grid collage.",
    "plannedReason": null
  },
  {
    "slug": "colorize-photo",
    "category": "image",
    "name": "Colorize Photo",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "combine-maker",
    "category": "image",
    "name": "Combine Images",
    "engine": "img.combine",
    "accept": [
      "image/*"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 2,
    "maxFiles": 30,
    "summary": "Stack several images vertically into a single file.",
    "plannedReason": null
  },
  {
    "slug": "compress",
    "category": "image",
    "name": "Compress Image",
    "engine": "img.compress",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "72"
      },
      {
        "key": "format",
        "label": "Output format",
        "type": "select",
        "default": "keep",
        "options": [
          {
            "value": "keep",
            "label": "Keep original"
          },
          {
            "value": "jpeg",
            "label": "JPG"
          },
          {
            "value": "webp",
            "label": "WebP"
          },
          {
            "value": "png",
            "label": "PNG"
          }
        ]
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Re-encode an image at a lower quality to cut its size.",
    "plannedReason": null
  },
  {
    "slug": "crop",
    "category": "image",
    "name": "Crop Image",
    "engine": "img.crop",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "left",
        "label": "Left (px)",
        "type": "number",
        "default": "0"
      },
      {
        "key": "top",
        "label": "Top (px)",
        "type": "number",
        "default": "0"
      },
      {
        "key": "width",
        "label": "Width (px)",
        "type": "number"
      },
      {
        "key": "height",
        "label": "Height (px)",
        "type": "number"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Crop a rectangle out of any image.",
    "plannedReason": null
  },
  {
    "slug": "crop-circle",
    "category": "image",
    "name": "Crop Image to Circle",
    "engine": "img.circle",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "size",
        "label": "Output size",
        "type": "number",
        "default": "512"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Crop an image to a transparent-background circle.",
    "plannedReason": null
  },
  {
    "slug": "eps-to-jpg",
    "category": "image",
    "name": "EPS To JPG",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "eps-to-png",
    "category": "image",
    "name": "EPS To PNG",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "eps-to-svg",
    "category": "image",
    "name": "EPS To SVG",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "flip",
    "category": "image",
    "name": "Flip Image",
    "engine": "img.flip",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "axis",
        "label": "Flip",
        "type": "select",
        "default": "horizontal",
        "options": [
          {
            "value": "horizontal",
            "label": "Horizontal"
          },
          {
            "value": "vertical",
            "label": "Vertical"
          },
          {
            "value": "both",
            "label": "Both"
          }
        ]
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Mirror an image horizontally, vertically or both.",
    "plannedReason": null
  },
  {
    "slug": "font-to-png",
    "category": "image",
    "name": "Font To PNG",
    "engine": "img.font",
    "accept": [
      ".ttf",
      ".otf",
      ".woff",
      ".woff2",
      "font/ttf",
      "font/otf",
      "font/woff",
      "font/woff2"
    ],
    "params": [
      {
        "key": "text",
        "label": "Sample text",
        "type": "text",
        "default": "The quick brown fox jumps over the lazy dog"
      },
      {
        "key": "size",
        "label": "Font size (px)",
        "type": "number",
        "default": "72"
      },
      {
        "key": "color",
        "label": "Text colour (hex)",
        "type": "text",
        "default": "#111827"
      },
      {
        "key": "background",
        "label": "Background (hex)",
        "type": "text",
        "default": "#ffffff"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Preview a TTF/OTF font as a PNG sample.",
    "plannedReason": null
  },
  {
    "slug": "gif-to-apng",
    "category": "image",
    "name": "GIF To APNG",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "gif-to-avif",
    "category": "image",
    "name": "GIF To AVIF",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "avif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "gif-to-jpg",
    "category": "image",
    "name": "GIF To JPG",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "jpg"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "gif-to-png",
    "category": "image",
    "name": "GIF To PNG",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "png"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "grayscale",
    "category": "image",
    "name": "Grayscale Image",
    "engine": "img.grayscale",
    "accept": [
      "image/*"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image to grayscale.",
    "plannedReason": null
  },
  {
    "slug": "heic-to-avif",
    "category": "image",
    "name": "HEIC To AVIF",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "heic-to-jpg",
    "category": "image",
    "name": "HEIC To JPG",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "heic-to-png",
    "category": "image",
    "name": "HEIC To PNG",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "jpg-to-avif",
    "category": "image",
    "name": "JPG To AVIF",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "avif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "jpg-to-gif",
    "category": "image",
    "name": "JPG To GIF",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "gif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "jpg-to-png",
    "category": "image",
    "name": "JPG To PNG",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "png"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "jpg-to-svg",
    "category": "image",
    "name": "JPG To SVG",
    "engine": "img.trace",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [
      {
        "key": "threshold",
        "label": "Threshold (1-255)",
        "type": "number",
        "default": "160"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Vectorise line art or logos into an SVG path file.",
    "plannedReason": null
  },
  {
    "slug": "jpg-to-tiff",
    "category": "image",
    "name": "JPG To TIFF",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "tiff"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "jpg-to-webp",
    "category": "image",
    "name": "JPG To WebP",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "webp"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "make-background-transparent",
    "category": "image",
    "name": "Make Background Transparent",
    "engine": "img.transparent",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [
      {
        "key": "tolerance",
        "label": "Colour tolerance (0-100)",
        "type": "number",
        "default": "24"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Remove a flat background colour and keep a transparent PNG.",
    "plannedReason": null
  },
  {
    "slug": "metadata",
    "category": "image",
    "name": "Metadata",
    "engine": "img.metadata",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Read dimensions, colour profile and EXIF data as JSON.",
    "plannedReason": null
  },
  {
    "slug": "pixelate",
    "category": "image",
    "name": "Pixelate Image",
    "engine": "img.pixelate",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "size",
        "label": "Pixel size",
        "type": "number",
        "default": "12"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Pixelate an image into blocks of a chosen size.",
    "plannedReason": null
  },
  {
    "slug": "png-to-avif",
    "category": "image",
    "name": "PNG To AVIF",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "avif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "png-to-eps",
    "category": "image",
    "name": "PNG To EPS",
    "engine": "img.eps",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Wrap a raster image in a real PostScript/EPS file.",
    "plannedReason": null
  },
  {
    "slug": "png-to-gif",
    "category": "image",
    "name": "PNG To GIF",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "gif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "png-to-jpg",
    "category": "image",
    "name": "PNG To JPG",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "jpg"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "png-to-svg",
    "category": "image",
    "name": "PNG To SVG",
    "engine": "img.trace",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [
      {
        "key": "threshold",
        "label": "Threshold (1-255)",
        "type": "number",
        "default": "160"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Vectorise line art or logos into an SVG path file.",
    "plannedReason": null
  },
  {
    "slug": "png-to-tiff",
    "category": "image",
    "name": "PNG To TIFF",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "tiff"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "png-to-webp",
    "category": "image",
    "name": "PNG To WebP",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "webp"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "profile-photo",
    "category": "image",
    "name": "Profile Photo Maker",
    "engine": "img.profile",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "size",
        "label": "Output size",
        "type": "select",
        "default": "512",
        "options": [
          {
            "value": "256",
            "label": "256 × 256"
          },
          {
            "value": "512",
            "label": "512 × 512"
          },
          {
            "value": "1024",
            "label": "1024 × 1024"
          }
        ]
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Square-crop and export a profile-ready avatar.",
    "plannedReason": null
  },
  {
    "slug": "psd-to-ai",
    "category": "image",
    "name": "PSD To AI",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "psd-to-jpg",
    "category": "image",
    "name": "PSD To JPG",
    "engine": "img.psd",
    "accept": [
      ".psd",
      "image/vnd.adobe.photoshop"
    ],
    "params": [],
    "fixed": {
      "format": "jpeg"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Export the flattened composite of a Photoshop file.",
    "plannedReason": null
  },
  {
    "slug": "psd-to-png",
    "category": "image",
    "name": "PSD To PNG",
    "engine": "img.psd",
    "accept": [
      ".psd",
      "image/vnd.adobe.photoshop"
    ],
    "params": [],
    "fixed": {
      "format": "png"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Export the flattened composite of a Photoshop file.",
    "plannedReason": null
  },
  {
    "slug": "psd-to-svg",
    "category": "image",
    "name": "PSD To SVG",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "remove-bg",
    "category": "image",
    "name": "Remove Background",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "remove-objects",
    "category": "image",
    "name": "Remove Objects from Photo",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "remove-person",
    "category": "image",
    "name": "Remove Person from Photo",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "remove-text-photo",
    "category": "image",
    "name": "Remove Text from Photo",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "remove-watermark-photo",
    "category": "image",
    "name": "Remove Watermark from Photo",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "resize",
    "category": "image",
    "name": "Resize Image",
    "engine": "img.resize",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "width",
        "label": "Width (px)",
        "type": "number",
        "placeholder": "auto"
      },
      {
        "key": "height",
        "label": "Height (px)",
        "type": "number",
        "placeholder": "auto"
      },
      {
        "key": "fit",
        "label": "Fit",
        "type": "select",
        "default": "inside",
        "options": [
          {
            "value": "inside",
            "label": "Inside (keep ratio)"
          },
          {
            "value": "cover",
            "label": "Cover (crop)"
          },
          {
            "value": "fill",
            "label": "Stretch"
          }
        ]
      },
      {
        "key": "format",
        "label": "Output format",
        "type": "select",
        "default": "keep",
        "options": [
          {
            "value": "keep",
            "label": "Keep original"
          },
          {
            "value": "jpeg",
            "label": "JPG"
          },
          {
            "value": "png",
            "label": "PNG"
          },
          {
            "value": "webp",
            "label": "WebP"
          }
        ]
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Resize by width, height or a fit box while keeping quality.",
    "plannedReason": null
  },
  {
    "slug": "split",
    "category": "image",
    "name": "Split Image",
    "engine": "img.split",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "columns",
        "label": "Columns",
        "type": "number",
        "default": "2"
      },
      {
        "key": "rows",
        "label": "Rows",
        "type": "number",
        "default": "2"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Slice an image into a grid of equal tiles.",
    "plannedReason": null
  },
  {
    "slug": "svg-to-png",
    "category": "image",
    "name": "SVG To PNG",
    "engine": "img.svgToPng",
    "accept": [
      ".svg",
      "image/svg+xml"
    ],
    "params": [
      {
        "key": "width",
        "label": "Width (px)",
        "type": "number",
        "default": "1024"
      },
      {
        "key": "background",
        "label": "Background",
        "type": "select",
        "default": "white",
        "options": [
          {
            "value": "white",
            "label": "White"
          },
          {
            "value": "transparent",
            "label": "Transparent"
          }
        ]
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Rasterise an SVG at the width you choose.",
    "plannedReason": null
  },
  {
    "slug": "text-to-image",
    "category": "image",
    "name": "Text To Image",
    "engine": "img.text",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text",
        "type": "textarea",
        "default": "Hello from TinyClone"
      },
      {
        "key": "width",
        "label": "Width (px)",
        "type": "number",
        "default": "1000"
      },
      {
        "key": "size",
        "label": "Font size (px)",
        "type": "number",
        "default": "48"
      },
      {
        "key": "color",
        "label": "Text colour (hex)",
        "type": "text",
        "default": "#ffffff"
      },
      {
        "key": "background",
        "label": "Background (hex)",
        "type": "text",
        "default": "#0b1020"
      },
      {
        "key": "bold",
        "label": "Bold",
        "type": "select",
        "default": "no",
        "options": [
          {
            "value": "no",
            "label": "No"
          },
          {
            "value": "yes",
            "label": "Yes"
          }
        ]
      }
    ],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Render typed text into a shareable PNG image.",
    "plannedReason": null
  },
  {
    "slug": "tiff-to-jpg",
    "category": "image",
    "name": "TIFF To JPG",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "jpg"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "tiff-to-png",
    "category": "image",
    "name": "TIFF To PNG",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "png"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "tiff-to-svg",
    "category": "image",
    "name": "TIFF To SVG",
    "engine": "img.trace",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [
      {
        "key": "threshold",
        "label": "Threshold (1-255)",
        "type": "number",
        "default": "160"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Vectorise line art or logos into an SVG path file.",
    "plannedReason": null
  },
  {
    "slug": "tiff-to-text",
    "category": "image",
    "name": "TIFF to Text (OCR)",
    "engine": "extra.ocr",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Read the text in an image with Mistral OCR and keep the layout.",
    "plannedReason": null
  },
  {
    "slug": "to-text",
    "category": "image",
    "name": "Image to Text (OCR)",
    "engine": "extra.ocr",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Read the text in an image with Mistral OCR and keep the layout.",
    "plannedReason": null
  },
  {
    "slug": "translate",
    "category": "image",
    "name": "Translate Image Text",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "unblur",
    "category": "image",
    "name": "Unblur",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "upscale",
    "category": "image",
    "name": "Upscale Image",
    "engine": "extra.upscale",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [
      {
        "key": "factor",
        "label": "Scale factor",
        "type": "select",
        "default": "2",
        "options": [
          {
            "value": "2",
            "label": "2x"
          },
          {
            "value": "3",
            "label": "3x"
          },
          {
            "value": "4",
            "label": "4x"
          }
        ]
      },
      {
        "key": "format",
        "label": "Output format",
        "type": "select",
        "default": "png",
        "options": [
          {
            "value": "png",
            "label": "PNG"
          },
          {
            "value": "jpeg",
            "label": "JPG"
          }
        ]
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Enlarge an image 2-4x with a Lanczos resample and unsharp mask.",
    "plannedReason": null
  },
  {
    "slug": "vsd-to-docx",
    "category": "image",
    "name": "VSD To DOCX",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "vsd-to-jpg",
    "category": "image",
    "name": "VSD To JPG",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "vsd-to-pdf",
    "category": "image",
    "name": "VSD To PDF",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "vsd-to-pptx",
    "category": "image",
    "name": "VSD To PPTX",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "vsdx-to-docx",
    "category": "image",
    "name": "VSDX To DOCX",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "vsdx-to-jpg",
    "category": "image",
    "name": "VSDX To JPG",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "vsdx-to-pdf",
    "category": "image",
    "name": "VSDX To PDF",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "vsdx-to-pptx",
    "category": "image",
    "name": "VSDX To PPTX",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder).",
    "plannedReason": "Needs an AI segmentation/inpainting model (remove-bg, colorize, object removal) or a proprietary decoder (EPS needs Ghostscript, Visio needs a Visio reader, HEIC needs an HEVC decoder)."
  },
  {
    "slug": "webp-to-avif",
    "category": "image",
    "name": "WebP To AVIF",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "avif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "webp-to-gif",
    "category": "image",
    "name": "WebP To GIF",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "gif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "webp-to-jpg",
    "category": "image",
    "name": "WebP To JPG",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "jpg"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "webp-to-png",
    "category": "image",
    "name": "WebP To PNG",
    "engine": "img.convert",
    "accept": [
      "image/*"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality (1-100)",
        "type": "number",
        "default": "90"
      }
    ],
    "fixed": {
      "format": "png"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert an image between JPG, PNG, WebP, AVIF, GIF and TIFF.",
    "plannedReason": null
  },
  {
    "slug": "lorem-ipsum-generator",
    "category": "other",
    "name": "Lorem Ipsum Generator",
    "engine": "other.lorem",
    "accept": [],
    "params": [
      {
        "key": "paragraphs",
        "label": "Paragraphs",
        "type": "number",
        "default": "3"
      }
    ],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate placeholder paragraphs.",
    "plannedReason": null
  },
  {
    "slug": "meme-maker",
    "category": "other",
    "name": "Meme Maker",
    "engine": "other.meme",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [
      {
        "key": "top",
        "label": "Top text",
        "type": "text",
        "default": "",
        "placeholder": "WHEN THE BUILD"
      },
      {
        "key": "bottom",
        "label": "Bottom text",
        "type": "text",
        "default": "",
        "placeholder": "PASSES FIRST TIME"
      },
      {
        "key": "size",
        "label": "Font size (px)",
        "type": "number",
        "default": "96"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Add top and bottom caption text to any image.",
    "plannedReason": null
  },
  {
    "slug": "qr-code",
    "category": "other",
    "name": "QR Code Generator",
    "engine": "other.qr",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Content",
        "type": "textarea",
        "placeholder": "https://example.com"
      },
      {
        "key": "size",
        "label": "Size (px)",
        "type": "number",
        "default": "512"
      }
    ],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate a QR code PNG for any text or URL.",
    "plannedReason": null
  },
  {
    "slug": "unix-timestamp",
    "category": "other",
    "name": "Unix Timestamp Converter",
    "engine": "other.timestamp",
    "accept": [],
    "params": [
      {
        "key": "value",
        "label": "Timestamp or date",
        "type": "text",
        "placeholder": "1700000000 or 2026-10-29"
      }
    ],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Convert between Unix timestamps and readable dates.",
    "plannedReason": null
  },
  {
    "slug": "zip",
    "category": "other",
    "name": "Zip",
    "engine": "other.zip",
    "accept": [
      "*"
    ],
    "params": [
      {
        "key": "name",
        "label": "Archive name",
        "type": "text",
        "default": "archive"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 30,
    "summary": "Pack the uploaded files into one downloadable ZIP.",
    "plannedReason": null
  },
  {
    "slug": "add-images",
    "category": "pdf",
    "name": "Add Images",
    "engine": "pdf.stampImages",
    "accept": [
      "application/pdf",
      "image/*"
    ],
    "params": [
      {
        "key": "position",
        "label": "Placement",
        "type": "select",
        "default": "bottom-right",
        "options": [
          {
            "value": "bottom-right",
            "label": "Bottom right"
          },
          {
            "value": "bottom-left",
            "label": "Bottom left"
          },
          {
            "value": "top-right",
            "label": "Top right"
          },
          {
            "value": "top-left",
            "label": "Top left"
          },
          {
            "value": "center",
            "label": "Centre"
          }
        ]
      },
      {
        "key": "width",
        "label": "Image width (% of page)",
        "type": "number",
        "default": "25"
      },
      {
        "key": "opacity",
        "label": "Opacity (%)",
        "type": "number",
        "default": "100"
      },
      {
        "key": "margin",
        "label": "Margin (points)",
        "type": "number",
        "default": "18"
      }
    ],
    "fixed": {},
    "minFiles": 2,
    "maxFiles": 30,
    "summary": "Stamp one or more images onto every page of a PDF.",
    "plannedReason": null
  },
  {
    "slug": "add-pages",
    "category": "pdf",
    "name": "Add Pages to PDF",
    "engine": "pdf.addBlank",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "count",
        "label": "Blank pages",
        "type": "number",
        "default": "1"
      },
      {
        "key": "after",
        "label": "Insert after page (or end)",
        "type": "text",
        "default": "end",
        "placeholder": "end"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Insert blank pages at any position in the document.",
    "plannedReason": null
  },
  {
    "slug": "add-text",
    "category": "pdf",
    "name": "Add Text to PDF",
    "engine": "pdf.addText",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "pages",
        "label": "Pages (blank = all)",
        "type": "text",
        "default": "",
        "placeholder": "1-3"
      },
      {
        "key": "text",
        "label": "Text",
        "type": "textarea",
        "default": "DRAFT"
      },
      {
        "key": "size",
        "label": "Font size",
        "type": "number",
        "default": "18"
      },
      {
        "key": "color",
        "label": "Colour (hex)",
        "type": "text",
        "default": "#dc2626"
      },
      {
        "key": "x",
        "label": "From left (% of page)",
        "type": "number",
        "default": "8"
      },
      {
        "key": "y",
        "label": "From top (% of page)",
        "type": "number",
        "default": "8"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Place your own text anywhere on the pages of a PDF.",
    "plannedReason": null
  },
  {
    "slug": "annotate",
    "category": "pdf",
    "name": "Annotate",
    "engine": "pdf.annotate",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "pages",
        "label": "Pages (blank = first page)",
        "type": "text",
        "default": "",
        "placeholder": "1"
      },
      {
        "key": "x",
        "label": "Left (% of page)",
        "type": "number",
        "default": "10"
      },
      {
        "key": "y",
        "label": "Top (% of page)",
        "type": "number",
        "default": "10"
      },
      {
        "key": "width",
        "label": "Width (% of page)",
        "type": "number",
        "default": "40"
      },
      {
        "key": "height",
        "label": "Height (% of page)",
        "type": "number",
        "default": "8"
      },
      {
        "key": "color",
        "label": "Highlight colour (hex)",
        "type": "text",
        "default": "#f59e0b"
      },
      {
        "key": "opacity",
        "label": "Opacity (%)",
        "type": "number",
        "default": "35"
      },
      {
        "key": "note",
        "label": "Label",
        "type": "text",
        "default": "",
        "placeholder": "Check this"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Draw a labelled highlight box over any page.",
    "plannedReason": null
  },
  {
    "slug": "compress",
    "category": "pdf",
    "name": "Compress PDF",
    "engine": "pdf.compress",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "level",
        "label": "Compression",
        "type": "select",
        "default": "balanced",
        "options": [
          {
            "value": "light",
            "label": "Light"
          },
          {
            "value": "balanced",
            "label": "Balanced"
          },
          {
            "value": "strong",
            "label": "Strong (drops metadata)"
          }
        ]
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Re-save a PDF with tighter object streams to shrink the file.",
    "plannedReason": null
  },
  {
    "slug": "create",
    "category": "pdf",
    "name": "Create PDF",
    "engine": "pdf.create",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Document text",
        "type": "textarea",
        "placeholder": "Type or paste text…"
      },
      {
        "key": "size",
        "label": "Page size",
        "type": "select",
        "default": "a4",
        "options": [
          {
            "value": "a4",
            "label": "A4"
          },
          {
            "value": "letter",
            "label": "Letter"
          }
        ]
      }
    ],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Build a clean PDF from typed or pasted text.",
    "plannedReason": null
  },
  {
    "slug": "crop",
    "category": "pdf",
    "name": "Crop PDF",
    "engine": "pdf.crop",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "top",
        "label": "Top margin (%)",
        "type": "number",
        "default": "5"
      },
      {
        "key": "bottom",
        "label": "Bottom margin (%)",
        "type": "number",
        "default": "5"
      },
      {
        "key": "left",
        "label": "Left margin (%)",
        "type": "number",
        "default": "5"
      },
      {
        "key": "right",
        "label": "Right margin (%)",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Trim the margins off every page by setting a crop box.",
    "plannedReason": null
  },
  {
    "slug": "delete",
    "category": "pdf",
    "name": "Delete PDF Pages",
    "engine": "pdf.delete",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "pages",
        "label": "Pages to delete",
        "type": "text",
        "placeholder": "2,4-6"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Remove selected pages from a PDF.",
    "plannedReason": null
  },
  {
    "slug": "edit",
    "category": "pdf",
    "name": "Edit",
    "engine": "pdf.addText",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "pages",
        "label": "Pages (blank = all)",
        "type": "text",
        "default": "",
        "placeholder": "1-3"
      },
      {
        "key": "text",
        "label": "Text",
        "type": "textarea",
        "default": "DRAFT"
      },
      {
        "key": "size",
        "label": "Font size",
        "type": "number",
        "default": "18"
      },
      {
        "key": "color",
        "label": "Colour (hex)",
        "type": "text",
        "default": "#dc2626"
      },
      {
        "key": "x",
        "label": "From left (% of page)",
        "type": "number",
        "default": "8"
      },
      {
        "key": "y",
        "label": "From top (% of page)",
        "type": "number",
        "default": "8"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Place your own text anywhere on the pages of a PDF.",
    "plannedReason": null
  },
  {
    "slug": "extract-img",
    "category": "pdf",
    "name": "Extract Images from PDF",
    "engine": "pdf.extractImages",
    "accept": [
      "application/pdf"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Pull the embedded photos and graphics out of a PDF.",
    "plannedReason": null
  },
  {
    "slug": "extract-text",
    "category": "pdf",
    "name": "Extract Text from PDF",
    "engine": "pdf.extractText",
    "accept": [
      "application/pdf"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Pull the text layer out of a PDF as a .txt file.",
    "plannedReason": null
  },
  {
    "slug": "from-azw3",
    "category": "pdf",
    "name": "AZW3 from",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "from-eps",
    "category": "pdf",
    "name": "EPS from",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "from-epub",
    "category": "pdf",
    "name": "EPUB from",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "from-gif",
    "category": "pdf",
    "name": "GIF from",
    "engine": "pdf.fromImageAny",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 30,
    "summary": "Turn GIF, TIFF or WebP images into a multi-page PDF.",
    "plannedReason": null
  },
  {
    "slug": "from-heic",
    "category": "pdf",
    "name": "HEIC from",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "from-jpg",
    "category": "pdf",
    "name": "JPG to PDF",
    "engine": "pdf.fromImage",
    "accept": [
      "image/jpeg",
      "image/png"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 30,
    "summary": "Turn one or more JPG/PNG images into a multi-page PDF.",
    "plannedReason": null
  },
  {
    "slug": "from-mobi",
    "category": "pdf",
    "name": "MOBI from",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "from-msg",
    "category": "pdf",
    "name": "MSG from",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "from-png",
    "category": "pdf",
    "name": "PNG to PDF",
    "engine": "pdf.fromImage",
    "accept": [
      "image/jpeg",
      "image/png"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 30,
    "summary": "Turn one or more JPG/PNG images into a multi-page PDF.",
    "plannedReason": null
  },
  {
    "slug": "from-ppt",
    "category": "pdf",
    "name": "PowerPoint to PDF",
    "engine": "extra.docToPdf",
    "accept": [
      ".pptx",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/octet-stream"
    ],
    "params": [],
    "fixed": {
      "format": "ppt"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert a Word file, a PowerPoint deck or a web page into a PDF.",
    "plannedReason": null
  },
  {
    "slug": "from-tiff",
    "category": "pdf",
    "name": "TIFF from",
    "engine": "pdf.fromImageAny",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 30,
    "summary": "Turn GIF, TIFF or WebP images into a multi-page PDF.",
    "plannedReason": null
  },
  {
    "slug": "from-url",
    "category": "pdf",
    "name": "URL to PDF",
    "engine": "extra.urlToPdf",
    "accept": [],
    "params": [
      {
        "key": "url",
        "label": "Page URL",
        "type": "text",
        "default": "",
        "placeholder": "https://example.com/article"
      }
    ],
    "fixed": {
      "format": "url"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Convert a web page into a PDF.",
    "plannedReason": null
  },
  {
    "slug": "from-webp",
    "category": "pdf",
    "name": "WebP from",
    "engine": "pdf.fromImageAny",
    "accept": [
      "image/*",
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".avif",
      ".gif",
      ".tiff",
      ".svg",
      ".psd"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 30,
    "summary": "Turn GIF, TIFF or WebP images into a multi-page PDF.",
    "plannedReason": null
  },
  {
    "slug": "from-word",
    "category": "pdf",
    "name": "Word to PDF",
    "engine": "extra.docToPdf",
    "accept": [
      ".docx",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream"
    ],
    "params": [],
    "fixed": {
      "format": "word"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Convert a Word file, a PowerPoint deck or a web page into a PDF.",
    "plannedReason": null
  },
  {
    "slug": "merge",
    "category": "pdf",
    "name": "Merge PDF",
    "engine": "pdf.merge",
    "accept": [
      "application/pdf"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 2,
    "maxFiles": 30,
    "summary": "Combine several PDFs into one document, in the order you pick.",
    "plannedReason": null
  },
  {
    "slug": "protect",
    "category": "pdf",
    "name": "Protect",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "rearrange",
    "category": "pdf",
    "name": "Rearrange PDF",
    "engine": "pdf.rearrange",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "order",
        "label": "New page order",
        "type": "text",
        "placeholder": "3,1,2",
        "help": "Comma separated page numbers. Omit pages to drop them."
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Reorder or drop pages by giving the new page sequence.",
    "plannedReason": null
  },
  {
    "slug": "remove-watermark",
    "category": "pdf",
    "name": "Remove PDF Watermark",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "rotate",
    "category": "pdf",
    "name": "Rotate PDF",
    "engine": "pdf.rotate",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "angle",
        "label": "Rotation",
        "type": "select",
        "default": "90",
        "options": [
          {
            "value": "90",
            "label": "90° clockwise"
          },
          {
            "value": "180",
            "label": "180°"
          },
          {
            "value": "270",
            "label": "90° counter-clockwise"
          }
        ]
      },
      {
        "key": "pages",
        "label": "Pages (blank = all)",
        "type": "text",
        "placeholder": "all"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Rotate every page or selected pages by 90°, 180° or 270°.",
    "plannedReason": null
  },
  {
    "slug": "sign",
    "category": "pdf",
    "name": "Sign",
    "engine": "pdf.sign",
    "accept": [
      "application/pdf",
      "image/*"
    ],
    "params": [
      {
        "key": "page",
        "label": "Page (1, last)",
        "type": "text",
        "default": "1"
      },
      {
        "key": "width",
        "label": "Signature width (% of page)",
        "type": "number",
        "default": "25"
      },
      {
        "key": "x",
        "label": "From left (%)",
        "type": "number",
        "default": "65"
      },
      {
        "key": "y",
        "label": "From top (%)",
        "type": "number",
        "default": "78"
      }
    ],
    "fixed": {},
    "minFiles": 2,
    "maxFiles": 2,
    "summary": "Place an image of your signature on any page.",
    "plannedReason": null
  },
  {
    "slug": "split",
    "category": "pdf",
    "name": "Split PDF",
    "engine": "pdf.split",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "mode",
        "label": "Split mode",
        "type": "select",
        "default": "each",
        "options": [
          {
            "value": "each",
            "label": "One file per page"
          },
          {
            "value": "ranges",
            "label": "Custom ranges"
          }
        ]
      },
      {
        "key": "ranges",
        "label": "Ranges (e.g. 1-3,4-6)",
        "type": "text",
        "placeholder": "1-3,4-6"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Split a PDF into single pages or custom page ranges.",
    "plannedReason": null
  },
  {
    "slug": "summarizer",
    "category": "pdf",
    "name": "PDF Summarizer",
    "engine": "ai.pdf",
    "accept": [
      "application/pdf"
    ],
    "params": [],
    "fixed": {
      "op": "summarize"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Summarise or translate a PDF with an AI model.",
    "plannedReason": null
  },
  {
    "slug": "to-azw3",
    "category": "pdf",
    "name": "to AZW3",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "to-csv",
    "category": "pdf",
    "name": "to CSV",
    "engine": "pdf.toCsv",
    "accept": [
      "application/pdf"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Export the text of each PDF page as CSV rows.",
    "plannedReason": null
  },
  {
    "slug": "to-epub",
    "category": "pdf",
    "name": "to EPUB",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "to-jpg",
    "category": "pdf",
    "name": "PDF to JPG",
    "engine": "pdf.toImage",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "scale",
        "label": "Scale",
        "type": "select",
        "default": "2",
        "options": [
          {
            "value": "1",
            "label": "1x"
          },
          {
            "value": "2",
            "label": "2x"
          },
          {
            "value": "3",
            "label": "3x"
          }
        ]
      }
    ],
    "fixed": {
      "format": "jpeg"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Render each page to an image at up to 3x scale.",
    "plannedReason": null
  },
  {
    "slug": "to-mobi",
    "category": "pdf",
    "name": "to MOBI",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "to-png",
    "category": "pdf",
    "name": "PDF to PNG",
    "engine": "pdf.toImage",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "scale",
        "label": "Scale",
        "type": "select",
        "default": "2",
        "options": [
          {
            "value": "1",
            "label": "1x"
          },
          {
            "value": "2",
            "label": "2x"
          },
          {
            "value": "3",
            "label": "3x"
          }
        ]
      }
    ],
    "fixed": {
      "format": "png"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Render each page to an image at up to 3x scale.",
    "plannedReason": null
  },
  {
    "slug": "to-ppt",
    "category": "pdf",
    "name": "to PPT",
    "engine": "pdf.toPptx",
    "accept": [
      "application/pdf"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Render each PDF page as a slide in a PowerPoint file.",
    "plannedReason": null
  },
  {
    "slug": "to-text",
    "category": "pdf",
    "name": "PDF to Text",
    "engine": "pdf.extractText",
    "accept": [
      "application/pdf"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Pull the text layer out of a PDF as a .txt file.",
    "plannedReason": null
  },
  {
    "slug": "to-tiff",
    "category": "pdf",
    "name": "to TIFF",
    "engine": "pdf.toTiff",
    "accept": [
      "application/pdf"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Render every page into one multi-page TIFF.",
    "plannedReason": null
  },
  {
    "slug": "to-word",
    "category": "pdf",
    "name": "to Word",
    "engine": "pdf.toDocx",
    "accept": [
      "application/pdf"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Turn a PDF text layer into an editable Word document.",
    "plannedReason": null
  },
  {
    "slug": "to-xlsx",
    "category": "pdf",
    "name": "to XLSX",
    "engine": "pdf.toXlsx",
    "accept": [
      "application/pdf"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Put the text of each PDF page into an Excel sheet.",
    "plannedReason": null
  },
  {
    "slug": "translate",
    "category": "pdf",
    "name": "Translate PDF",
    "engine": "ai.pdf",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "language",
        "label": "Target language",
        "type": "select",
        "default": "English",
        "options": [
          {
            "value": "English",
            "label": "English"
          },
          {
            "value": "Spanish",
            "label": "Spanish"
          },
          {
            "value": "French",
            "label": "French"
          },
          {
            "value": "German",
            "label": "German"
          },
          {
            "value": "Hindi",
            "label": "Hindi"
          },
          {
            "value": "Arabic",
            "label": "Arabic"
          },
          {
            "value": "Portuguese",
            "label": "Portuguese"
          },
          {
            "value": "Chinese",
            "label": "Chinese"
          },
          {
            "value": "Japanese",
            "label": "Japanese"
          }
        ]
      }
    ],
    "fixed": {
      "op": "translate"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Summarise or translate a PDF with an AI model.",
    "plannedReason": null
  },
  {
    "slug": "unlock",
    "category": "pdf",
    "name": "Unlock",
    "engine": null,
    "accept": [],
    "params": [],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder.",
    "plannedReason": "Needs Ghostscript or qpdf (protect/unlock), Calibre (EPUB/MOBI/AZW3) or a HEIC decoder."
  },
  {
    "slug": "watermark",
    "category": "pdf",
    "name": "Watermark PDF",
    "engine": "pdf.watermark",
    "accept": [
      "application/pdf"
    ],
    "params": [
      {
        "key": "text",
        "label": "Watermark text",
        "type": "text",
        "default": "CONFIDENTIAL"
      },
      {
        "key": "opacity",
        "label": "Opacity (%)",
        "type": "number",
        "default": "18"
      },
      {
        "key": "angle",
        "label": "Angle (degrees)",
        "type": "number",
        "default": "45"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Stamp diagonal text across every page of a PDF.",
    "plannedReason": null
  },
  {
    "slug": "aac-to-flac",
    "category": "video",
    "name": "Aac To Flac",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "flac"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "aac-to-m4r",
    "category": "video",
    "name": "Aac To M4r",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "m4r"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "aac-to-mp3",
    "category": "video",
    "name": "Aac To MP3",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp3"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "aac-to-mp4",
    "category": "video",
    "name": "Aac To MP4",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp4"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "aac-to-wav",
    "category": "video",
    "name": "Aac To WAV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "wav"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "add-subtitles",
    "category": "video",
    "name": "Add Subtitles",
    "engine": "media.subtitles",
    "accept": [
      "video/*",
      ".srt",
      ".vtt",
      ".ass",
      "application/x-subrip",
      "text/vtt",
      "text/plain"
    ],
    "params": [
      {
        "key": "fontSize",
        "label": "Subtitle font size",
        "type": "number",
        "default": "22"
      }
    ],
    "fixed": {},
    "minFiles": 2,
    "maxFiles": 2,
    "summary": "Burn an SRT/VTT subtitle file into the video picture.",
    "plannedReason": null
  },
  {
    "slug": "audio-to-text",
    "category": "video",
    "name": "Audio to Text",
    "engine": "speech.transcribe",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcribe speech from audio or video into text and SRT.",
    "plannedReason": null
  },
  {
    "slug": "avi-to-gif",
    "category": "video",
    "name": "Avi To GIF",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "gif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "avi-to-mkv",
    "category": "video",
    "name": "Avi To MKV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mkv"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "avi-to-mov",
    "category": "video",
    "name": "Avi To MOV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mov"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "avi-to-mp3",
    "category": "video",
    "name": "Avi To MP3",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp3"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "avi-to-mp4",
    "category": "video",
    "name": "Avi To MP4",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp4"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "compress",
    "category": "video",
    "name": "Compress",
    "engine": "media.compress",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality",
        "type": "select",
        "default": "balanced",
        "options": [
          {
            "value": "high",
            "label": "High"
          },
          {
            "value": "balanced",
            "label": "Balanced"
          },
          {
            "value": "small",
            "label": "Smallest file"
          }
        ]
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "type": "select",
        "default": "keep",
        "options": [
          {
            "value": "keep",
            "label": "Keep original"
          },
          {
            "value": "1080",
            "label": "1080p"
          },
          {
            "value": "720",
            "label": "720p"
          },
          {
            "value": "480",
            "label": "480p"
          }
        ]
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Re-encode video at a higher CRF and optional lower resolution.",
    "plannedReason": null
  },
  {
    "slug": "compress-avi",
    "category": "video",
    "name": "Compress Avi",
    "engine": "media.compress",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality",
        "type": "select",
        "default": "balanced",
        "options": [
          {
            "value": "high",
            "label": "High"
          },
          {
            "value": "balanced",
            "label": "Balanced"
          },
          {
            "value": "small",
            "label": "Smallest file"
          }
        ]
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "type": "select",
        "default": "keep",
        "options": [
          {
            "value": "keep",
            "label": "Keep original"
          },
          {
            "value": "1080",
            "label": "1080p"
          },
          {
            "value": "720",
            "label": "720p"
          },
          {
            "value": "480",
            "label": "480p"
          }
        ]
      }
    ],
    "fixed": {
      "format": "avi"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Re-encode video at a higher CRF and optional lower resolution.",
    "plannedReason": null
  },
  {
    "slug": "compress-mkv",
    "category": "video",
    "name": "Compress MKV",
    "engine": "media.compress",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality",
        "type": "select",
        "default": "balanced",
        "options": [
          {
            "value": "high",
            "label": "High"
          },
          {
            "value": "balanced",
            "label": "Balanced"
          },
          {
            "value": "small",
            "label": "Smallest file"
          }
        ]
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "type": "select",
        "default": "keep",
        "options": [
          {
            "value": "keep",
            "label": "Keep original"
          },
          {
            "value": "1080",
            "label": "1080p"
          },
          {
            "value": "720",
            "label": "720p"
          },
          {
            "value": "480",
            "label": "480p"
          }
        ]
      }
    ],
    "fixed": {
      "format": "mkv"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Re-encode video at a higher CRF and optional lower resolution.",
    "plannedReason": null
  },
  {
    "slug": "compress-mov",
    "category": "video",
    "name": "Compress MOV",
    "engine": "media.compress",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [
      {
        "key": "quality",
        "label": "Quality",
        "type": "select",
        "default": "balanced",
        "options": [
          {
            "value": "high",
            "label": "High"
          },
          {
            "value": "balanced",
            "label": "Balanced"
          },
          {
            "value": "small",
            "label": "Smallest file"
          }
        ]
      },
      {
        "key": "resolution",
        "label": "Resolution",
        "type": "select",
        "default": "keep",
        "options": [
          {
            "value": "keep",
            "label": "Keep original"
          },
          {
            "value": "1080",
            "label": "1080p"
          },
          {
            "value": "720",
            "label": "720p"
          },
          {
            "value": "480",
            "label": "480p"
          }
        ]
      }
    ],
    "fixed": {
      "format": "mov"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Re-encode video at a higher CRF and optional lower resolution.",
    "plannedReason": null
  },
  {
    "slug": "cutter",
    "category": "video",
    "name": "Cutter",
    "engine": "media.trim",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [
      {
        "key": "start",
        "label": "Start (mm:ss or seconds)",
        "type": "text",
        "default": "0",
        "placeholder": "00:05"
      },
      {
        "key": "end",
        "label": "End (mm:ss or seconds)",
        "type": "text",
        "default": "",
        "placeholder": "00:20"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Cut a clip between a start and end time without re-recording.",
    "plannedReason": null
  },
  {
    "slug": "extract-audio",
    "category": "video",
    "name": "Extract Audio",
    "engine": "media.audio",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp3"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Extract the audio track as MP3, WAV, M4A or another format.",
    "plannedReason": null
  },
  {
    "slug": "from-fb",
    "category": "video",
    "name": "Download Facebook Video",
    "engine": "speech.social",
    "accept": [],
    "params": [
      {
        "key": "url",
        "label": "Video URL",
        "type": "text",
        "default": "",
        "placeholder": "https://www.facebook.com/watch/?v=…"
      }
    ],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Download a public video from Facebook, Instagram, TikTok or X.",
    "plannedReason": null
  },
  {
    "slug": "from-gif",
    "category": "video",
    "name": "GIF to MP4",
    "engine": "media.convert",
    "accept": [
      "image/gif",
      ".gif"
    ],
    "params": [],
    "fixed": {
      "format": "mp4"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "from-inst",
    "category": "video",
    "name": "Download Instagram Video",
    "engine": "speech.social",
    "accept": [],
    "params": [
      {
        "key": "url",
        "label": "Video URL",
        "type": "text",
        "default": "",
        "placeholder": "https://www.instagram.com/reel/…"
      }
    ],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Download a public video from Facebook, Instagram, TikTok or X.",
    "plannedReason": null
  },
  {
    "slug": "from-tiktok",
    "category": "video",
    "name": "Download TikTok Video",
    "engine": "speech.social",
    "accept": [],
    "params": [
      {
        "key": "url",
        "label": "Video URL",
        "type": "text",
        "default": "",
        "placeholder": "https://www.tiktok.com/@user/video/…"
      }
    ],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Download a public video from Facebook, Instagram, TikTok or X.",
    "plannedReason": null
  },
  {
    "slug": "from-twitter",
    "category": "video",
    "name": "Download X Video",
    "engine": "speech.social",
    "accept": [],
    "params": [
      {
        "key": "url",
        "label": "Video URL",
        "type": "text",
        "default": "",
        "placeholder": "https://x.com/user/status/…"
      }
    ],
    "fixed": {},
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Download a public video from Facebook, Instagram, TikTok or X.",
    "plannedReason": null
  },
  {
    "slug": "gif-to-mov",
    "category": "video",
    "name": "GIF To MOV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mov"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "gif-to-webm",
    "category": "video",
    "name": "GIF To WebM",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "webm"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "m4a-to-mp3",
    "category": "video",
    "name": "M4A To MP3",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp3"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "m4a-to-mp4",
    "category": "video",
    "name": "M4A To MP4",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp4"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "m4a-to-wav",
    "category": "video",
    "name": "M4A To WAV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "wav"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mkv-to-avi",
    "category": "video",
    "name": "MKV To Avi",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "avi"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mkv-to-gif",
    "category": "video",
    "name": "MKV To GIF",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "gif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mkv-to-mov",
    "category": "video",
    "name": "MKV To MOV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mov"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mkv-to-mp3",
    "category": "video",
    "name": "MKV To MP3",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp3"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mkv-to-mp4",
    "category": "video",
    "name": "MKV To MP4",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp4"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mov-to-avi",
    "category": "video",
    "name": "MOV To Avi",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "avi"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mov-to-gif",
    "category": "video",
    "name": "MOV To GIF",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "gif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mov-to-mp3",
    "category": "video",
    "name": "MOV To MP3",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp3"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mov-to-mp4",
    "category": "video",
    "name": "MOV To MP4",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp4"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mov-to-wav",
    "category": "video",
    "name": "MOV To WAV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "wav"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mp4-to-avi",
    "category": "video",
    "name": "MP4 To Avi",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "avi"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mp4-to-gif",
    "category": "video",
    "name": "MP4 To GIF",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "gif"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mp4-to-mov",
    "category": "video",
    "name": "MP4 To MOV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mov"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mp4-to-mp3",
    "category": "video",
    "name": "MP4 To MP3",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp3"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mp4-to-ogg",
    "category": "video",
    "name": "MP4 To Ogg",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "ogg"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mp4-to-wav",
    "category": "video",
    "name": "MP4 To WAV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "wav"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mp4-to-webm",
    "category": "video",
    "name": "MP4 To WebM",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "webm"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "mute",
    "category": "video",
    "name": "Mute",
    "engine": "media.mute",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Strip the audio track from a video file.",
    "plannedReason": null
  },
  {
    "slug": "ogg-to-mp3",
    "category": "video",
    "name": "Ogg To MP3",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp3"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "ogg-to-wav",
    "category": "video",
    "name": "Ogg To WAV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "wav"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "resize",
    "category": "video",
    "name": "Resize",
    "engine": "media.resize",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [
      {
        "key": "width",
        "label": "Width (px)",
        "type": "number",
        "default": "1280"
      },
      {
        "key": "height",
        "label": "Height (px)",
        "type": "number",
        "default": ""
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Scale a video to a new width and height.",
    "plannedReason": null
  },
  {
    "slug": "summarize-podcast",
    "category": "video",
    "name": "Summarize Podcast",
    "engine": "speech.summarize",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcribe a recording and summarise the key points.",
    "plannedReason": null
  },
  {
    "slug": "to-gif",
    "category": "video",
    "name": "to GIF",
    "engine": "media.gif",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [
      {
        "key": "fps",
        "label": "Frames per second",
        "type": "number",
        "default": "10"
      },
      {
        "key": "width",
        "label": "Width (px)",
        "type": "number",
        "default": "480"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Turn a video into an animated GIF with palette dithering.",
    "plannedReason": null
  },
  {
    "slug": "to-text",
    "category": "video",
    "name": "Video to Text",
    "engine": "speech.transcribe",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcribe speech from audio or video into text and SRT.",
    "plannedReason": null
  },
  {
    "slug": "to-webp",
    "category": "video",
    "name": "to WebP",
    "engine": "media.webp",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [
      {
        "key": "fps",
        "label": "Frames per second",
        "type": "number",
        "default": "12"
      },
      {
        "key": "width",
        "label": "Width (px)",
        "type": "number",
        "default": "640"
      }
    ],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Turn a video into an animated WebP.",
    "plannedReason": null
  },
  {
    "slug": "transcribe-podcast",
    "category": "video",
    "name": "Transcribe Podcast",
    "engine": "speech.transcribe",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {},
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcribe speech from audio or video into text and SRT.",
    "plannedReason": null
  },
  {
    "slug": "webm-to-mov",
    "category": "video",
    "name": "WebM To MOV",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mov"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "webm-to-mp3",
    "category": "video",
    "name": "WebM To MP3",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp3"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "webm-to-mp4",
    "category": "video",
    "name": "WebM To MP4",
    "engine": "media.convert",
    "accept": [
      "video/*",
      "audio/*",
      ".mp4",
      ".mov",
      ".mkv",
      ".avi",
      ".webm",
      ".mp3",
      ".wav",
      ".m4a",
      ".aac",
      ".flac",
      ".ogg"
    ],
    "params": [],
    "fixed": {
      "format": "mp4"
    },
    "minFiles": 1,
    "maxFiles": 1,
    "summary": "Transcode between video and audio formats with ffmpeg.",
    "plannedReason": null
  },
  {
    "slug": "youtube-to-text",
    "category": "video",
    "name": "YouTube to Text",
    "engine": "speech.youtube",
    "accept": [],
    "params": [
      {
        "key": "url",
        "label": "YouTube URL",
        "type": "text",
        "default": "",
        "placeholder": "https://www.youtube.com/watch?v=…"
      }
    ],
    "fixed": {
      "route": "transcript"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Transcribe a YouTube video by downloading its audio.",
    "plannedReason": null
  },
  {
    "slug": "youtube-transcript",
    "category": "video",
    "name": "YouTube Transcript",
    "engine": "speech.youtube",
    "accept": [],
    "params": [
      {
        "key": "url",
        "label": "YouTube URL",
        "type": "text",
        "default": "",
        "placeholder": "https://www.youtube.com/watch?v=…"
      }
    ],
    "fixed": {
      "route": "transcript"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Transcribe a YouTube video by downloading its audio.",
    "plannedReason": null
  },
  {
    "slug": "ai-detector",
    "category": "write",
    "name": "AI Detector",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text to check",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "ai-detector"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "ai-rephraser",
    "category": "write",
    "name": "AI Rephraser",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text to rephrase",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "ai-rephraser"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "ai-twitter-generator",
    "category": "write",
    "name": "AI X Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Subject",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "ai-twitter-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "article-generator",
    "category": "write",
    "name": "Article Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Subject or brief",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "audience",
        "label": "Audience (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "article-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "article-rewriter",
    "category": "write",
    "name": "Article Rewriter",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Article to rewrite",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "article-rewriter"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "article-writer",
    "category": "write",
    "name": "Article Writer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Article topic",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "audience",
        "label": "Audience (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "article-writer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "bill-sale-generator",
    "category": "write",
    "name": "Bill Sale Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "What is being sold (item, price, parties)",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "bill-sale-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "blog-outline",
    "category": "write",
    "name": "Blog Outline",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Blog topic",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "audience",
        "label": "Audience (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "blog-outline"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "business-name-generator",
    "category": "write",
    "name": "Business Name Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "What the business does",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "business-name-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "business-plan-generator",
    "category": "write",
    "name": "Business Plan Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Business idea",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "business-plan-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "business-slogan-generator",
    "category": "write",
    "name": "Business Slogan Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Company and what it does",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "business-slogan-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "cold-email-writer",
    "category": "write",
    "name": "Cold Email Writer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Who you are writing to and why",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "audience",
        "label": "Audience (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "cold-email-writer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "content-brief-generator",
    "category": "write",
    "name": "Content Brief Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Content topic and goal",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "audience",
        "label": "Audience (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "content-brief-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "content-improver",
    "category": "write",
    "name": "Content Improver",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text to improve",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "content-improver"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "content-planner",
    "category": "write",
    "name": "Content Planner",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Niche and channels",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "content-planner"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "content-summarizer",
    "category": "write",
    "name": "Content Summarizer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text to summarise",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "content-summarizer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "essay-writer",
    "category": "write",
    "name": "Essay Writer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Essay question or topic",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "essay-writer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "explain-like-five",
    "category": "write",
    "name": "Explain Like Five",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Concept to explain",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "explain-like-five"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "facebook-ad-headlines",
    "category": "write",
    "name": "Facebook Ad Headlines",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Product, offer and audience",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "facebook-ad-headlines"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "faq-generator",
    "category": "write",
    "name": "Faq Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Product or topic",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "faq-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "grammar-fixer",
    "category": "write",
    "name": "Grammar Fixer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text to correct",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "grammar-fixer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "humanizer-ai",
    "category": "write",
    "name": "Humanizer AI",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text to humanise",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "humanizer-ai"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "instagram-caption-generator",
    "category": "write",
    "name": "Instagram Caption Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "What the post is about",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "instagram-caption-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "instagram-story-ideas",
    "category": "write",
    "name": "Instagram Story Ideas",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Brand or niche",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "instagram-story-ideas"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "landing-page-copy",
    "category": "write",
    "name": "Landing Page Copy",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Product and audience",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "audience",
        "label": "Audience (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "landing-page-copy"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "linkedin-post-generator",
    "category": "write",
    "name": "Linkedin Post Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "What you want to say",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "linkedin-post-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "meta-description-generator",
    "category": "write",
    "name": "Meta Description Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Page topic or summary",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "meta-description-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "nda-generator",
    "category": "write",
    "name": "Nda Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Parties and what is being shared",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "nda-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "paragraph-completer",
    "category": "write",
    "name": "Paragraph Completer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Opening paragraph",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "paragraph-completer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "paragraph-rewriter",
    "category": "write",
    "name": "Paragraph Rewriter",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Paragraph to rewrite",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "paragraph-rewriter"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "paragraph-writer",
    "category": "write",
    "name": "Paragraph Writer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Topic",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "paragraph-writer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "paraphrasing",
    "category": "write",
    "name": "Paraphrasing",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text to paraphrase",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "paraphrasing"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "podcast-writer",
    "category": "write",
    "name": "Podcast Writer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Episode topic",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "podcast-writer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "poll-generator",
    "category": "write",
    "name": "Poll Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Poll topic",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "poll-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "post-generator",
    "category": "write",
    "name": "Post Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "What the post is about",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "post-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "post-ideas",
    "category": "write",
    "name": "Post Ideas",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Niche or brand",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "post-ideas"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "post-rewriter",
    "category": "write",
    "name": "Post Rewriter",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Post to rewrite",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "post-rewriter"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "post-writer",
    "category": "write",
    "name": "Post Writer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Post topic",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "post-writer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "press-release-generator",
    "category": "write",
    "name": "Press Release Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Announcement details",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "audience",
        "label": "Audience (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "press-release-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "privacy-policy-generator",
    "category": "write",
    "name": "Privacy Policy Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Company, product and data collected",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "privacy-policy-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "purchase-agreement-generator",
    "category": "write",
    "name": "Purchase Agreement Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Goods, price and parties",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "purchase-agreement-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "real-estate-description",
    "category": "write",
    "name": "Real Estate Description",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Property details",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "audience",
        "label": "Audience (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "real-estate-description"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "sentence-rewriter",
    "category": "write",
    "name": "Sentence Rewriter",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Sentences to rewrite",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "sentence-rewriter"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "shorten-content",
    "category": "write",
    "name": "Shorten Content",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text to shorten",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "shorten-content"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "story-generator",
    "category": "write",
    "name": "Story Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Story prompt",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "story-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "summarize-youtube",
    "category": "write",
    "name": "Summarize YouTube Video",
    "engine": "speech.youtube",
    "accept": [],
    "params": [
      {
        "key": "url",
        "label": "YouTube URL",
        "type": "text",
        "default": "",
        "placeholder": "https://www.youtube.com/watch?v=…"
      }
    ],
    "fixed": {
      "route": "summarize-youtube"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Transcribe a YouTube video by downloading its audio.",
    "plannedReason": null
  },
  {
    "slug": "tiktok-script-writer",
    "category": "write",
    "name": "TikTok Script Writer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Video topic",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "audience",
        "label": "Audience (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "tiktok-script-writer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "title-rewriter",
    "category": "write",
    "name": "Title Rewriter",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Content or current title",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "title-rewriter"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "tone-of-voice",
    "category": "write",
    "name": "Tone Of Voice",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Writing samples",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "tone-of-voice"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "translate",
    "category": "write",
    "name": "Translate",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text to translate",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "language",
        "label": "Target language",
        "type": "select",
        "default": "English",
        "options": [
          {
            "value": "English",
            "label": "English"
          },
          {
            "value": "Spanish",
            "label": "Spanish"
          },
          {
            "value": "French",
            "label": "French"
          },
          {
            "value": "German",
            "label": "German"
          },
          {
            "value": "Hindi",
            "label": "Hindi"
          },
          {
            "value": "Arabic",
            "label": "Arabic"
          },
          {
            "value": "Portuguese",
            "label": "Portuguese"
          },
          {
            "value": "Chinese",
            "label": "Chinese"
          },
          {
            "value": "Japanese",
            "label": "Japanese"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "translate"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "trivia-generator",
    "category": "write",
    "name": "Trivia Generator",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Trivia subject",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "count",
        "label": "How many",
        "type": "number",
        "default": "5"
      }
    ],
    "fixed": {
      "route": "trivia-generator"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "word-counter",
    "category": "write",
    "name": "Word Counter",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Text to measure",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      }
    ],
    "fixed": {
      "route": "word-counter"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  },
  {
    "slug": "youtube-script-writer",
    "category": "write",
    "name": "YouTube Script Writer",
    "engine": "ai.write",
    "accept": [],
    "params": [
      {
        "key": "text",
        "label": "Video topic",
        "type": "textarea",
        "default": "",
        "placeholder": "Type or paste here…"
      },
      {
        "key": "tone",
        "label": "Tone",
        "type": "select",
        "default": "neutral",
        "options": [
          {
            "value": "neutral",
            "label": "Neutral"
          },
          {
            "value": "friendly",
            "label": "Friendly"
          },
          {
            "value": "professional",
            "label": "Professional"
          },
          {
            "value": "persuasive",
            "label": "Persuasive"
          },
          {
            "value": "casual",
            "label": "Casual"
          },
          {
            "value": "confident",
            "label": "Confident"
          }
        ]
      },
      {
        "key": "length",
        "label": "Length",
        "type": "select",
        "default": "medium",
        "options": [
          {
            "value": "short",
            "label": "Short (~150 words)"
          },
          {
            "value": "medium",
            "label": "Medium (~400 words)"
          },
          {
            "value": "long",
            "label": "Long (~900 words)"
          }
        ]
      },
      {
        "key": "audience",
        "label": "Audience (optional)",
        "type": "text",
        "default": ""
      },
      {
        "key": "keywords",
        "label": "Keywords to include (optional)",
        "type": "text",
        "default": ""
      }
    ],
    "fixed": {
      "route": "youtube-script-writer"
    },
    "minFiles": 0,
    "maxFiles": 0,
    "summary": "Generate or rewrite text with a fallback chain of free AI models.",
    "plannedReason": null
  }
];

export const TOOL_MAP = new Map(TOOLS.map((t) => [`${t.category}/${t.slug}`, t]));

export const READY_TOOLS = TOOLS.filter((t) => t.engine !== null);

export function getTool(category: string, slug: string): Tool | undefined {
  return TOOL_MAP.get(`${category}/${slug}`);
}
