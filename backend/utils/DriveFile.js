import mongoose from "mongoose";
import { createWriteStream } from "node:fs";
import path from "node:path";
import fs from "node:fs/promises";

export const getFileList = async (drive, folderId) => {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data } = await drive.files.list({
        q: `'${folderId}' in parents`,
        fields: "files(id, name, mimeType, size)",
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
      });
      return {
        files:
          data.files.filter(
            (file) => file.mimeType !== "application/vnd.google-apps.folder",
          ) || [],
      };
    } catch (error) {
      console.error(
        `❌ getFileList error (Attempt ${attempt}/${maxRetries}):`,
        error.response?.data || error.message,
      );

      lastError = error;

      if (attempt < maxRetries) {
        await delay(1000 * attempt);
      }
    }
  }
  console.error("❌ getFileList failed after all retries.");
  throw new Error(`Failed to fetch file list: ${lastError.message}`);
};

export const downloadFiles = async (drive, data, id, uploadDirId, userId) => {
  return Promise.all(
    data.files.map((f) =>
      downloadSingleFile(drive, f.id, f.name, f.mimeType, uploadDirId, userId),
    ),
  );
};

// download single file
export const downloadSingleFile = async (
  drive,
  fileId,
  fileName,
  mimeType,
  uploadDirId,
  userId,
) => {
  try {
    let finalFileName = fileName;
    let downloadStream;
    let extension;
    let totalBytes = 0;

    if (mimeType.startsWith("application/vnd.google-apps")) {
      const exportInfo = GOOGLE_EXPORT_MIMES[mimeType];
      if (!exportInfo) {
        throw new Error(`Unsupported Google native mimeType: ${mimeType}`);
      }

      const { mime } = exportInfo;
      extension = exportInfo.ext;

      finalFileName = fileName + extension;

      const exportRes = await drive.files.export(
        {
          fileId,
          mimeType: mime,
        },
        { responseType: "stream" },
      );

      exportRes.data.on("data", (chunk) => {
        totalBytes += chunk.length;
      });
      downloadStream = exportRes.data;
    } else {
      const { data } = await drive.files.get({
        fileId,
        fields: "id, name, mimeType, size",
      });

      finalFileName = data.name;

      const res = await drive.files.get(
        { fileId: data.id, alt: "media" },
        { responseType: "stream" },
      );

      downloadStream = res.data;

      totalBytes = data.size;
      extension = path.extname(finalFileName);
    }

    const newFileId = new mongoose.Types.ObjectId();
    const filePath = path.resolve(`./storage/${newFileId}${extension}`);

    await fs.mkdir(path.dirname(filePath), { recursive: true });

    const dest = createWriteStream(filePath);

    await new Promise((resolve, reject) => {
      downloadStream.on("end", resolve).on("error", reject).pipe(dest);
    });

    return {
      _id: newFileId,
      name: finalFileName,
      extension,
      parentDirId: uploadDirId,
      userId,
      metaData: {
        size: +totalBytes,
        mimeType,
        source: "google-drive",
      },
    };
  } catch (error) {
    console.error("❌ downloadSingleFile error:", error.message);
    throw new Error("Failed to download file from Google Drive");
  }
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const GOOGLE_EXPORT_MIMES = {
  "application/vnd.google-apps.document": {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ext: ".dcox",
  },
  "application/vnd.google-apps.spreadsheet": {
    mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ext: ".xlsx",
  },
  "application/vnd.google-apps.presentation": {
    mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ext: ".pptx",
  },
  "application/vnd.google-apps.drawing": {
    mime: "image/png",
    ext: ".png",
  },
};
