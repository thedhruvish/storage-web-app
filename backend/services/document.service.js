import path from "node:path";
import Document from "../models/Document.model.js";
import Directory from "../models/Directory.model.js";
import ApiError from "../utils/ApiError.js";
import {
  deleteS3Object,
  generatePresignedUrl,
  getSignedUrlForGetObject,
  verifyUploadedObject,
} from "./s3.service.js";
import { updateParentDirectorySize } from "./directory.service.js";

/**
 * Create document + generate presigned URL
 */
export const createPresignedDocument = async ({
  user,
  fileName,
  fileSize,
  contentType,
  parentDirId,
}) => {
  const directory = await Directory.findById(parentDirId, {
    metaData: 1,
  }).lean();

  const newUsedSize = directory.metaData.size + fileSize;
  if (newUsedSize > user.maxStorageBytes) {
    throw new ApiError(400, "Storage limit exceeded");
  }

  const extension = path.extname(fileName);

  const document = await Document.create({
    extension,
    name: fileName,
    userId: user._id,
    parentDirId,
    metaData: { size: fileSize },
  });

  const presignedUrl = await generatePresignedUrl(
    `${document.id}${extension}`,
    contentType,
  );

  return {
    id: document.id,
    presignedUrl,
  };
};

/**
 * Verify upload completion
 */
export const completeUpload = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  const fileKey = `${document.id}${document.extension}`;
  const isValid = await verifyUploadedObject(fileKey, document.metaData.size);

  if (!isValid) {
    await Promise.all([
      Document.deleteOne({ _id: document._id }),
      deleteS3Object(fileKey),
    ]);
    throw new ApiError(400, "Please re-upload file");
  }

  document.isCompletedUpload = true;

  await Promise.all([
    document.save(),
    updateParentDirectorySize(document.parentDirId, document.metaData.size),
  ]);
};

/**
 * Cancel upload
 */
export const cancelUpload = async (documentId) => {
  await Document.findByIdAndDelete(documentId);
};

/**
 * Get signed URL for view/download
 */
export const getDocumentSignedUrl = async (documentId, isDownload) => {
  const document = await Document.findById(documentId);
  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  return getSignedUrlForGetObject(
    `${document.id}${document.extension}`,
    document.name,
    isDownload,
  );
};

/**
 * Rename document
 */
export const renameDocument = async (documentId, name) => {
  const document = await Document.findByIdAndUpdate(
    documentId,
    { name },
    { new: true },
  );

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  return document;
};

/**
 * Toggle star
 */
export const toggleStarDocument = async (documentId) => {
  await Document.findByIdAndUpdate(documentId, [
    { $set: { isStarred: { $not: "$isStarred" } } },
  ]);
};

/**
 * Delete document
 */
export const deleteDocument = async (documentId) => {
  const document = await Document.findByIdAndDelete(documentId);
  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  await Promise.all([
    deleteS3Object(`${document.id}${document.extension}`),
    updateParentDirectorySize(document.parentDirId, -document.metaData.size),
  ]);
};
