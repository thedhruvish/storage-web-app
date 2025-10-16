import Directory from "../models/Directory.model.js";

export const checkStorageLimit = async (req, res, next) => {
  const user = req.user;
  const dirctroy = await Directory.findById(user.rootDirId, {
    metaData: 1,
  });
  const remainingBytes = user.maxStorageBytes - dirctroy.metaData.size;

  // Multer hasn't processed yet, so file size not known — handle with limit
  req.remainingStorageBytes = remainingBytes;

  if (remainingBytes <= 0) {
    return res.status(400).json({ message: "Storage limit exceeded" });
  }

  next();
};
