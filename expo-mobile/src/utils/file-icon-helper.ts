export const getFileIconName = (extension?: string) => {
  if (!extension) return "file";

  const ext = extension.toLowerCase();

  // Images
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext)) {
    return "image";
  }

  // Videos
  if (["mp4", "mkv", "avi", "mov", "webm"].includes(ext)) {
    return "video";
  }

  // Audio
  if (["mp3", "wav", "ogg", "flac"].includes(ext)) {
    return "audio";
  }

  // Documents
  if (["pdf"].includes(ext)) {
    return "pdf";
  }
  if (["doc", "docx"].includes(ext)) {
    return "word";
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return "spreadsheet";
  }
  if (["ppt", "pptx"].includes(ext)) {
    return "presentation";
  }

  // Archives
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) {
    return "archive";
  }

  // Code
  if (
    [
      "ts",
      "tsx",
      "js",
      "jsx",
      "html",
      "css",
      "json",
      "py",
      "java",
      "cpp",
      "c",
      "php",
    ].includes(ext)
  ) {
    return "code";
  }

  return "document";
};
