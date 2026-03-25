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
  batchSoftDeletedocument,
} from "../services/document.service.js";
import {
  removeFromRecent,
  removeFromRecents,
} from "../services/recent.service.js";

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
    req.user?._id,
  );
  if (req.query.action === "download") {
    if (req.isMobile) {
      return res.status(200).json(new ApiResponse(200, "Download link", url));
    }
    return res.redirect(url);
  }
  res.status(200).json(new ApiResponse(200, "Preview link", url));
};

export const updateDocumentById = async (req, res) => {
  const doc = await renameDocument(req.params.id, req.body.name);
  await removeFromRecent(req.user._id, req.params.id, "document");
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
  const { message } = await softDeleteDocument(req.params.id);
  await removeFromRecent(req.user._id, req.params.id, "document");
  res.status(200).json(new ApiResponse(200, message));
};

export const hardDeleteDocumentById = async (req, res) => {
  await hardDeleteDocument(req.params.id);
  await removeFromRecent(req.user._id, req.params.id, "document");
  res.status(200).json(new ApiResponse(200, "Document deleted successfully"));
};

export const restoreDocumentById = async (req, res) => {
  await restoreDocument(req.params.id);
  res.status(200).json(new ApiResponse(200, "Document restored successfully"));
};

// batch oprations
export const softDeleteBatchDocumentController = async (req, res) => {
  const { ids } = req.body;
  await Promise.all([
    Promise.all(ids.map((id) => batchSoftDeletedocument(id))),
    removeFromRecents(req.user._id, ids, "document"),
  ]);
  res.status(200).json(new ApiResponse(200, "Document deleted successfully"));
};

export const hardDeleteBatchDocumentController = async (req, res) => {
  const { ids } = req.body;
  await Promise.all([
    Promise.all(ids.map((id) => hardDeleteDocument(id))),
    removeFromRecents(req.user._id, ids, "document"),
  ]);

  res.status(200).json(new ApiResponse(200, "Document deleted successfully"));
};
export const restoreDeleteBatchDocumentController = async (req, res) => {
  const { ids } = req.body;
  await Promise.all([
    Promise.all(ids.map((id) => restoreDocument(id))),
    removeFromRecents(req.user._id, ids, "document"),
  ]);
  res.status(200).json(new ApiResponse(200, "Document restore successfully"));
};
