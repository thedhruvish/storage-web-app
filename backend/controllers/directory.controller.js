import ApiResponse from "../utils/ApiResponse.js";
import {
  getDirectoryWithContent,
  createDirectory,
  renameDirectory,
  toggleStarDirectory,
  deleteDirectory,
} from "../services/directory.service.js";

export const getDirectory = async (req, res) => {
  const result = await getDirectoryWithContent({
    directoryId: req.params.id || req.user.rootDirId,
    isStarred:
      req.query.isStarred !== undefined
        ? req.query.isStarred === "true"
        : undefined,
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

  res.status(200).json(new ApiResponse(200, "Directory updated successfully"));
};

export const starredToggleDirectory = async (req, res) => {
  await toggleStarDirectory(req.params.id);

  res
    .status(200)
    .json(new ApiResponse(200, "Directory star toggled successfully"));
};

export const deleteDirectoryById = async (req, res) => {
  await deleteDirectory(req.params.id);

  res.status(200).json(new ApiResponse(200, "Directory deleted successfully"));
};
