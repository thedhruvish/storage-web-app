import { rm } from "node:fs/promises";
import path from "node:path";
import { createWriteStream } from "node:fs";
import Document from "../models/document.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// create the file
export const createDocument = async (req, res) => {
  const parentDirId = req.params.parentDirId || req.user.rootDirId;

  const { filename } = req.headers;

  if (!filename) {
    return res.status(400).json(new ApiError(400, "filename is required"));
  }
  const externsion = path.extname(filename);
  const document = new Document({
    userId: req.user._id,
    fileName: filename,
    extension: externsion,
    parentDirId,
  });
  const fileStream = createWriteStream(
    `${process.cwd()}/storage/${document.id}${externsion}`,
  );
  req.pipe(fileStream);
  req.on("end", async () => {
    await document.save();
    res.status(200).json(new ApiResponse(200, "Document create Successfuly"));
  });
  req.on("error", async (err) => {
    await rm(`${process.cwd()}/storage/${document.id}${externsion}`);
    document = null;
    throw new ApiError(400, err.message);
  });
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
    res.download(filePath);
    return;
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

  const document = await Document.findByIdAndUpdate(id, { fileName: name });
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
