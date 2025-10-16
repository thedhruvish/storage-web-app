import multer from "multer";
import mongoose from "mongoose";
import path from "node:path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "storage/");
  },
  filename: function (req, file, cb) {
    const fileId = new mongoose.Types.ObjectId();
    const fileExtension = path.extname(file.originalname);
    req.customFileInfo = {
      id: fileId.toString(),
      extension: fileExtension,
    };
    cb(null, fileId.toString() + fileExtension);
  },
});

export const createUpload = (maxBytes) =>
  multer({
    storage,
    limits: { fileSize: maxBytes },
  });
