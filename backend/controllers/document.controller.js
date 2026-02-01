import ApiResponse from "../utils/ApiResponse.js";
import {
  createPresignedDocument,
  completeUpload,
  cancelUpload,
  getDocumentSignedUrl,
  renameDocument,
  toggleStarDocument,
  hardDeleteDocument,
  softDeleteDocument,
  restoreDocument,
} from "../services/document.service.js";

export const createPresigned = async (req, res) => {
  const result = await createPresignedDocument({
    user: req.user,
    fileName: req.body.fileName,
    fileSize: req.body.fileSize,
    contentType: req.body.ContentType,
    parentDirId: req.params.parentDirId || req.user.rootDirId,
  });

  res
    .status(200)
    .json(new ApiResponse(200, "Document created successfully", result));
};

export const checkUploadedObject = async (req, res) => {
  await completeUpload(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Document upload completed successfully"));
};

export const cancelUploadController = async (req, res) => {
  await cancelUpload(req.params.id);
  res.status(200).json(new ApiResponse(200, "Upload cancelled successfully"));
};

export const getDocumentById = async (req, res) => {
  const url = await getDocumentSignedUrl(
    req.params.id,
    req.query.action === "download",
  );
  res.redirect(url);
};

export const updateDocumentById = async (req, res) => {
  const doc = await renameDocument(req.params.id, req.body.name);
  res
    .status(200)
    .json(new ApiResponse(200, "Document updated successfully", doc));
};

export const starredToggleDocument = async (req, res) => {
  await toggleStarDocument(req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, "Document star toggled successfully"));
};

export const softDeleteDocumentById = async (req, res) => {
  await softDeleteDocument(req.params.id);
  res.status(200).json(new ApiResponse(200, "Document deleted successfully"));
};

export const hardDeleteDocumentById = async (req, res) => {
  await hardDeleteDocument(req.params.id);
  res.status(200).json(new ApiResponse(200, "Document deleted successfully"));
};

export const restoreDocumentById = async (req, res) => {
  await restoreDocument(req.params.id);
  res.status(200).json(new ApiResponse(200, "Document restored successfully"));
};
