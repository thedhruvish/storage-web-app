export const truncateFileName = (name: string, maxLength = 55) => {
  const ext = name.substring(name.lastIndexOf("."));
  const base = name.substring(0, name.lastIndexOf(".")).trim();

  return base.length + ext.length > maxLength
    ? `${base.slice(0, maxLength - ext.length - 4).trim()}..${ext}`
    : name;
};
