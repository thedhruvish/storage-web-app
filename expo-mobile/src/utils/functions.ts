export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const truncateFileName = (fileName: string, maxLength: number = 20) => {
  if (fileName.length <= maxLength) return fileName;
  const ext = fileName.split(".").pop();
  if (!ext || ext === fileName) {
    return fileName.substring(0, maxLength) + "...";
  }
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf("."));
  const truncatedName = nameWithoutExt.substring(0, maxLength - ext.length - 3) + "...";
  return truncatedName + "." + ext;
};
