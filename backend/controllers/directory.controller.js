import ApiResponse from "../utils/ApiResponse.js";
import {
  getDirectoryWithContent,
  createDirectory,
  renameDirectory,
  toggleStarDirectory,
  hardDeleteDirectory,
  softDeleteDirectory,
  emptyTrash,
  restoreDirectory,
  getAllTrash,
  getSharedWithMe,
} from "../services/directory.service.js";
import { removeFromRecent } from "../services/recent.service.js";

export const getDirectory = async (req, res) => {
  const isStarred =
    req.query.isStarred !== undefined
      ? req.query.isStarred === "true"
      : undefined;
  const isTrash =
    req.query.isTrash !== undefined ? req.query.isTrash === "true" : undefined;

  const result = await getDirectoryWithContent({
    directoryId: req.params.id || req.user.rootDirId,
    isStarred,
    isTrash,
    userId: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, "Directories list", result));
};

export const createDirectoryController = async (req, res) => {
  await createDirectory({
    parentDirId: req.params.id || req.user.rootDirId,
    name: req.body.name,
    userId: req.user._id,
  });

  res.status(200).json(new ApiResponse(200, "Directory created successfully"));
};

export const updateDirectoryById = async (req, res) => {
  await renameDirectory(req.params.id, req.body.name);
  await removeFromRecent(req.user._id, req.params.id, "directory");
  res.status(200).json(new ApiResponse(200, "Directory updated successfully"));
};

export const starredToggleDirectory = async (req, res) => {
  await toggleStarDirectory(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, "Directory star toggled successfully"));
};

export const softDeleteDirectoryById = async (req, res) => {
  await softDeleteDirectory(req.params.id);
  await removeFromRecent(req.user._id, req.params.id, "directory");
  res.status(200).json(new ApiResponse(200, "Directory deleted successfully"));
};

export const hardDeleteDirectoryById = async (req, res) => {
  await hardDeleteDirectory(req.params.id);
  await removeFromRecent(req.user._id, req.params.id, "directory");
  res.status(200).json(new ApiResponse(200, "Directory deleted successfully"));
};
export const getTrashController = async (req, res) => {
  const result = await getAllTrash(req.user._id);

  res.status(200).json(new ApiResponse(200, "Trash list", result));
};

export const emptyTrashController = async (req, res) => {
  await emptyTrash(req.user._id);

  res.status(200).json(new ApiResponse(200, "Trash emptied successfully"));
};

export const restoreDirectoryById = async (req, res) => {
  await restoreDirectory(req.params.id);

  res.status(200).json(new ApiResponse(200, "Directory restored successfully"));
};

export const getSharedWithMeController = async (req, res) => {
  const result = await getSharedWithMe(req.user._id);

  res.status(200).json(new ApiResponse(200, "Shared files list", result));
};
