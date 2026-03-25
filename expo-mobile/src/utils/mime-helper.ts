export const getMimeType = (extension?: string): string => {
  if (!extension) return "application/octet-stream";

  const ext = extension.toLowerCase().replace(".", "");

  const mimeTypes: { [key: string]: string } = {
    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    bmp: "image/bmp",
    webp: "image/webp",
    svg: "image/svg+xml",

    // Videos
    mp4: "video/mp4",
    mkv: "video/x-matroska",
    avi: "video/x-msvideo",
    mov: "video/quicktime",
    webm: "video/webm",

    // Audio
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    flac: "audio/flac",

    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint",
    pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    txt: "text/plain",
    csv: "text/csv",

    // Archives
    zip: "application/zip",
    rar: "application/x-rar-compressed",
    "7z": "application/x-7z-compressed",
    tar: "application/x-tar",
    gz: "application/gzip",

    // Code
    js: "application/javascript",
    jsx: "text/javascript",
    ts: "application/x-typescript",
    tsx: "text/typescript",
    html: "text/html",
    css: "text/css",
    json: "application/json",
    py: "text/x-python",
    java: "text/x-java-source",
    cpp: "text/x-c++src",
    c: "text/x-csrc",
    php: "text/x-php",
  };

  return mimeTypes[ext] || "application/octet-stream";
};
