import Directory from "../models/Directory.model.js";
import Document from "../models/Document.model.js";
import ApiError from "../utils/ApiError.js";
import { getDriveClient } from "../lib/googleDrive.client.js";
import {
  downloadFiles,
  downloadSingleFile,
  getFileList,
} from "./gdrive.service.js";
import { googleOAuthClient } from "../lib/googleDrive.client.js";
import { rm } from "node:fs/promises";
import { updateParentDirectorySize } from "./directory.service.js";

export const importFromGoogleDrive = async ({
  user,
  uploadDirId,
  driveFile,
  accessToken,
}) => {
  googleOAuthClient.setCredentials({
    access_token: accessToken,
  });

  const drive = getDriveClient(googleOAuthClient);

  const directory = await Directory.findById(user.rootDirId, {
    metaData: 1,
  }).lean();

  if (driveFile.mimeType === "application/vnd.google-apps.folder") {
    const parentDir = await Directory.findById(uploadDirId, {
      path: 1,
    }).lean();

    const newFolder = await Directory.create({
      name: driveFile.name,
      parentDirId: uploadDirId,
      userId: user._id,
      path: [...parentDir.path, parentDir._id],
      metaData: { source: "google-drive", size: 0 },
    });

    const meta = await getFileList(drive, driveFile.id);

    if (directory.metaData.size + meta.totalSize > user.maxStorageBytes) {
      throw new ApiError(400, "Storage limit exceeded");
    }

    const files = await downloadFiles(drive, meta, newFolder._id, user._id);

    await Promise.all([
      Document.insertMany(files),
      updateParentDirectorySize(newFolder._id, meta.totalSize),
    ]);

    return;
  }

  // single file
  const fileData = await downloadSingleFile(
    drive,
    driveFile.id,
    driveFile.name,
    driveFile.mimeType,
    uploadDirId,
    user._id,
  );

  if (directory.metaData.size + fileData.metaData.size > user.maxStorageBytes) {
    await rm(
      `${import.meta.dirname}/../storage/${fileData._id}${fileData.extension}`,
    );
    throw new ApiError(400, "Storage limit exceeded");
  }

  await Promise.all([
    Document.create(fileData),
    updateParentDirectorySize(uploadDirId, fileData.metaData.size),
  ]);
};
