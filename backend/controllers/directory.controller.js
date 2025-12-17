import { rm } from "node:fs/promises";
import Directory from "../models/Directory.model.js";
import Document from "../models/Document.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { updateParentDirectorySize } from "../utils/DirectoryHelper.js";
import { bulkDeleteS3Objects } from "../utils/s3Services.js";

// get Directories list or get by id
export const getDirectory = async (req, res) => {
  const directoryId = req.params.id || req.user.rootDirId;
  const { isStarred } = req.query;
  if (!directoryId) {
    return res.status(404).json(new ApiError(404, "Directory not found"));
  }
  const directory = await Directory.findById(directoryId).populate({
    path: "path",
    select: "name _id",
  });
  if (!directory) {
    return res.status(404).json(new ApiError(404, "Directory not found"));
  }
  let filter = {};
  if (isStarred) {
    filter.isStarred = isStarred === "true";
  }

  const directories = await Directory.find({
    parentDirId: directory._id,
    ...filter,
  });
  const documents = await Document.find({
    parentDirId: directory._id,
    ...filter,
  });
  res.status(200).json(
    new ApiResponse(200, "Directories list", {
      directories,
      documents,
      path: directory,
    }),
  );
};

// create the Directory
export const createDirectory = async (req, res) => {
  const parentDirId = req.params.id || req.user.rootDirId;
  const name = req.body.name || "New Folder";
  const parentDir = await Directory.findById(parentDirId, { path: 1 });
  // create a directory
  const directory = new Directory({
    name,
    userId: req.user._id,
    parentDirId,
    metaData: { size: 0 },
    path: [...parentDir.path, parentDir._id],
  });

  await directory.save();
  res.status(200).json(new ApiResponse(200, "Directory create Successfuly"));
};

// rename Directory by id
export const updateDirectoryById = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const directory = await Directory.findByIdAndUpdate(id, { $set: { name } });
  // check document null than does not renme
  if (!directory) {
    return res.status(404).json(new ApiError(404, "Directory not found"));
  }
  res.status(200).json(new ApiResponse(200, "Directory update Successfuly"));
};

export const starredToggleDirectory = async (req, res) => {
  const { id } = req.params;

  await Directory.findByIdAndUpdate(id, [
    { $set: { isStarred: { $not: "$isStarred" } } },
  ]);

  res
    .status(200)
    .json(new ApiResponse(200, "Directory started toggle Successfuly"));
};

// delete Directory by id
export const deleteDirectoryById = async (req, res) => {
  const { id } = req.params;
  const deleteDirectory = await Directory.findById(id).select({
    _id: 1,
    metaData: 1,
    parentDirId: 1,
  });

  await updateParentDirectorySize(
    deleteDirectory.parentDirId,
    -deleteDirectory.metaData.size,
  );
  // recur
  const listDocumentAndDirectoryForDelete = async (parentDirId) => {
    let allDocuemt = await Document.find({ parentDirId }).select({
      _id: 1,
      extension: 1,
      metaData: 1,
    });

    let allDirectory = await Directory.find({ parentDirId }).select({
      _id: 1,
    });

    for (const { _id } of allDirectory) {
      const nested = await listDocumentAndDirectoryForDelete(_id);
      allDocuemt.push(...nested.allDocuemt);
      allDirectory.push(...nested.allDirectory);
    }
    return { allDocuemt, allDirectory };
  };
  let { allDocuemt, allDirectory } =
    await listDocumentAndDirectoryForDelete(id);

  allDirectory.push({ _id: id });
  // first delete s3 , than document and directory
  Promise.all([
    bulkDeleteS3Objects(
      allDocuemt.map((file) => ({
        Key: `${file._id.toString()}${file.extension}`,
      })),
    ),

    Document.deleteMany({ _id: { $in: allDocuemt.map((doc) => doc._id) } }),
    Directory.deleteMany({
      _id: { $in: allDirectory.map((doc) => doc._id) },
    }),
  ]);
  res.status(200).json(new ApiResponse(200, "Directory delete Successfuly"));
};
