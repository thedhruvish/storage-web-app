import { rm } from "node:fs/promises";
import Document from "../models/document.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// create the file
export const createDocument = async (req, res) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;
  const { id, extension } = req.customFileInfo;

  const document = new Document({
    _id: id,
    userId: req.user._id,
    name: req.file.originalname,
    extension: extension,
    parentDirId,
    metaData: {
      size: req.file.size,
    },
  });
  await document.save();

  res.status(200).json(new ApiResponse(200, "Document create Successfuly"));
};

// show or download file by id
export const getDocumentById = async (req, res) => {
  const { id } = req.params;

  const document = await Document.findById(id);
  if (!document) {
    return res.status(404).json(new ApiError(404, "Document not found"));
  }

  const filePath = `${process.cwd()}/storage/${document.id}${document.extension}`;
  // check if query are the download than file download other wise send file
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

  if (!name) {
    return res.status(400).json(new ApiError(400, "name is required"));
  }

  const document = await Document.findByIdAndUpdate(id, { name });
  // check document null than does not renme
  if (!document) {
    return res.status(404).json(new ApiError(404, "Document not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Document update Successfuly", document));
};

// delete file by id
export const deleteDocumentById = async (req, res) => {
  const { id } = req.params;

  const document = await Document.findByIdAndDelete(id);
  if (!document) {
    return res.status(404).json(new ApiError(404, "Document not found"));
  }
  await rm(`./storage/${document.id}${document.extension}`);
  res.status(200).json(new ApiResponse(200, "Document delete Successfuly"));
};
