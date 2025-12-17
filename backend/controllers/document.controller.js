import { rm } from "node:fs/promises";
import Document from "../models/Document.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import path from "node:path";
import fs from "node:fs";
import { updateParentDirectorySize } from "../utils/DirectoryHelper.js";
import Directory from "../models/Directory.model.js";
import {
  deleteS3Object,
  generatePresignedUrl,
  getSignedUrlForGetObject,
  verifyUploadedObject,
} from "../utils/s3Services.js";

// gen PresignedUrl
export const createPresigned = async (req, res) => {
  const user = req.user;
  const { ContentType, fileSize, fileName } = req.body;

  const parentDirId = req.params.parentDirId || user.rootDirId;
  const directory = await Directory.findById(user.rootDirId, {
    metaData: 1,
  }).lean();

  const newUsedSize = directory.metaData.size + fileSize;

  if (newUsedSize > user.maxStorageBytes) {
    return res
      .status(400)
      .json(new ApiError(400, " Storage limit exceeded — file removed."));
  }
  const extension = path.extname(fileName);
  const newDocument = await Document.insertOne({
    extension,
    name: fileName,
    userId: user._id,
    parentDirId,
    metaData: {
      size: fileSize,
    },
  });
  const genUrl = await generatePresignedUrl(
    `${newDocument.id}${extension}`,
    ContentType,
  );

  res.status(200).json(
    new ApiResponse(200, "Document create Successfuly", {
      genUrl,
      id: newDocument.id,
    }),
  );
};

// check completed uploading
export const checkUploadedObject = async (req, res) => {
  const uploadedDocument = await Document.findById(req.params.id);
  if (!uploadedDocument) {
    return res.status(404).json(new ApiError(404, "Document not found"));
  }
  const fileName = `${uploadedDocument.id}${uploadedDocument.extension}`;
  // when is does not same size than delete document
  if (!(await verifyUploadedObject(fileName, uploadedDocument.metaData.size))) {
    await Document.deleteOne({ _id: uploadedDocument._id });
    await deleteS3Object(`${uploadedDocument.id}${uploadedDocument.extension}`);
    return res.status(400).json(new ApiError(400, "Please, re upload file."));
  }

  uploadedDocument.isCompletedUpload = true;
  Promise.all([
    uploadedDocument.save(),
    updateParentDirectorySize(
      uploadedDocument.parentDirId,
      uploadedDocument.metaData.size,
    ),
  ]);
  res
    .status(200)
    .json(new ApiResponse(200, "Document upload completed successfully"));
};

// create the file
export const createDocument = async (req, res) => {
  const user = req.user;
  const parentDirId = req.params.parentDirId || user.rootDirId;
  const { id, extension } = req.customFileInfo;
  const fileSize = req.file.size;
  const directory = await Directory.findById(user.rootDirId, {
    metaData: 1,
  }).lean();
  const newUsedSize = directory.metaData.size + fileSize;

  if (newUsedSize > user.maxStorageBytes) {
    // Delete uploaded file immediately to avoid overflow
    await rm(`${import.meta.dirname}/../storage/${id}${extension}`);
    fs.unlinkSync(req.file.path);
    return res
      .status(400)
      .json(new ApiError(400, " Storage limit exceeded — file removed."));
  }
  const document = new Document({
    _id: id,
    userId: req.user._id,
    name: req.file.originalname,
    extension: extension,
    parentDirId,
    metaData: {
      size: fileSize,
    },
  });
  await document.save();
  await updateParentDirectorySize(parentDirId, fileSize);

  res.status(200).json(new ApiResponse(200, "Document create Successfuly"));
};

// show or download file by id
export const getDocumentById = async (req, res) => {
  const { id } = req.params;

  const document = await Document.findById(id);
  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  let filePath = null;

  if (req.query.action === "download") {
    filePath = await getSignedUrlForGetObject(
      `${document.id}${document.extension}`,
      document.name,
      true,
    );
  } else {
    filePath = await getSignedUrlForGetObject(
      `${document.id}${document.extension}`,
      document.name,
      false,
    );
  }

  res.redirect(filePath);
};

// rename file by id
export const updateDocumentById = async (req, res) => {
  // get detial in frontend
  const { id } = req.params;
  const { name } = req.body;

  const document = await Document.findByIdAndUpdate(id, { name });
  // check document null than does not renme
  if (!document) {
    return res.status(404).json(new ApiError(404, "Document not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Document update Successfuly", document));
};

export const starredToggleDocument = async (req, res) => {
  const { id } = req.params;

  await Document.findByIdAndUpdate(id, [
    { $set: { isStarred: { $not: "$isStarred" } } },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, "Document started toggle Successfuly"));
};

// delete file by id
export const deleteDocumentById = async (req, res) => {
  const { id } = req.params;

  const document = await Document.findByIdAndDelete(id);
  if (!document) {
    return res.status(404).json(new ApiError(404, "Document not found"));
  }
  Promise.all([
    deleteS3Object(`${document.id}${document.extension}`),
    updateParentDirectorySize(document.parentDirId, -document.metaData.size),
  ]);
  res.status(200).json(new ApiResponse(200, "Document delete Successfuly"));
};
