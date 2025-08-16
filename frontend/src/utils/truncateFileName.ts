export const truncateFileName = (name: string, maxLength = 55) => {
  const ext = name.substring(name.lastIndexOf("."));
  const base = name.substring(0, name.lastIndexOf(".")).trim();

  return base.length + ext.length > maxLength
    ? `${base.slice(0, maxLength - ext.length - 4).trim()}..${ext}`
    : name;
};

export const truncateName = (name: string, maxLength = 20) => {
  if (typeof name !== "string") return "";
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + "...";
};
