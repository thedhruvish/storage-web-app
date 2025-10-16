import { rm } from "node:fs/promises";
import Document from "../models/document.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import path from "node:path";
import fs from "fs";
import { updateParentDirectorySize } from "../utils/DirectoryHelper.js";
import Directory from "../models/Directory.model.js";

// create the file
export const createDocument = async (req, res) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
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
    return res.status(400).json({
      message: "Storage limit exceeded — file removed.",
    });
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

  const filePath = path.resolve(
    "./storage",
    `${document.id}${document.extension}`,
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found on server" });
  }

  if (req.query.action === "download") {
    return res.download(filePath, document.name);
  }

  res.sendFile(filePath);
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
  await rm(
    `${import.meta.dirname}/../storage/${document.id}${document.extension}`,
  );
  await updateParentDirectorySize(
    document.parentDirId,
    -document.metaData.size,
  );
  res.status(200).json(new ApiResponse(200, "Document delete Successfuly"));
};
