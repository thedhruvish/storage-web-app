export function getFileIconName(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "txt":
    case "md":
    case "rtf":
      return "document";

    case "pdf":
      return "pdf";

    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "bmp":
    case "webp":
    case "tiff":
    case "ico":
      return "image";

    case "svg":
      return "vector";

    case "mp4":
    case "mov":
    case "avi":
    case "mkv":
    case "webm":
    case "flv":
      return "video";

    case "mp3":
    case "wav":
    case "ogg":
    case "flac":
      return "audio";

    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
    case "bz2":
      return "archive";

    case "xls":
    case "xlsx":
    case "ods":
      return "spreadsheet";

    case "ppt":
    case "pptx":
    case "odp":
      return "presentation";

    case "doc":
    case "docx":
    case "odt":
      return "word";

    case "ttf":
    case "otf":
    case "woff":
    case "woff2":
      return "font";

    case "exe":
    case "msi":
    case "apk":
    case "bat":
    case "sh":
      return "executable";

    case "db":
    case "sqlite":
    case "sql":
      return "database";

    case "js":
    case "jsx":
    case "ts":
    case "tsx":
    case "html":
    case "css":
    case "scss":
    case "py":
    case "java":
    case "c":
    case "cpp":
    case "cs":
    case "rb":
    case "go":
    case "rs":
    case "php":
      return "code";

    default:
      return "alt";
  }
}
