import mongoose from "mongoose";
import { createWriteStream } from "node:fs";
import path from "node:path";

// get all the files by id
export const getFileList = async (drive, folderId) => {
  const data = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`,
    fields: "files(id, name, mimeType, size)",
  });
  return data;
};

// donwload file
export const downloadFile = async (drive, files, uploadDirId, userId) => {
  const fileDatas = [];
  for (const file of files) {
    const fileId = new mongoose.Types.ObjectId();
    const extension = path.extname(file.name);

    const dest = createWriteStream(`./storage/${fileId}${extension}`);
    const res = await drive.files.get(
      {
        fileId: file.id,
        alt: "media",
      },
      {
        responseType: "stream",
      },
    );
    await new Promise((resolve, reject) => {
      res.data
        .on("end", () => {
          console.log(`Downloaded: ${file.name}`);
          resolve();
        })
        .on("error", reject)
        .pipe(dest);
    });
    fileDatas.push({
      _id: fileId,
      name: file.name,
      extension: extension,
      parentDirId: uploadDirId,
      userId,
      metaData: {
        size: file.size,
      },
    });
  }
  return fileDatas;
};
