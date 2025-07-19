import { rm } from "node:fs/promises";
import Directory from "../models/Directory.model.js";
import Document from "../models/document.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

// get Directories list or get by id
export const getDirectory = async (req, res) => {
  const directoryId = req.params.id || req.user.rootDirId;
  if (!directoryId) {
    return res.status(404).json(new ApiError(404, "Directory not found"));
  }
  const directory = await Directory.findOne({
    _id: directoryId,
    userId: req.user._id,
  });
  if (!directory) {
    return res.status(404).json(new ApiError(404, "Directory not found"));
  }
  const directories = await Directory.find({
    parentDirId: directory._id,
    userId: req.user._id,
  });
  const documents = await Document.find({ parentDirId: directory._id });
  res
    .status(200)
    .json(new ApiResponse(200, "Directories list", { directories, documents }));
};

// create the Directory
export const createDirectory = async (req, res) => {
  const parentDirId = req.params.id || req.user.rootDirId;
  const name = req.body.name || "New Folder";
  if (!name) {
    return res.status(400).json(new ApiError(400, "name is required"));
  }
  // create a directory
  const directory = new Directory({
    name,
    userId: req.user._id,
    parentDirId,
  });

  await directory.save();
  res.status(200).json(new ApiResponse(200, "Directory create Successfuly"));
};

// rename Directory by id
export const updateDirectoryById = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    return res.status(400).json(new ApiError(400, "name is required"));
  }

  const directory = await Directory.findByIdAndUpdate(id, { $set: { name } });
  // check document null than does not renme
  if (!directory) {
    return res.status(404).json(new ApiError(404, "Directory not found"));
  }
  res.status(200).json(new ApiResponse(200, "Directory update Successfuly"));
};

// delete Directory by id
export const deleteDirectoryById = async (req, res) => {
  const { id } = req.params;

  // recur
  const listDocumentAndDirectoryForDelete = async (parentDirId) => {
    let allDocuemt = await Document.find({ parentDirId }).select({
      _id: 1,
      extension: 1,
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
  Promise.all(
    allDocuemt.map(async (file) => {
      await rm(
        `${process.cwd()}/storage/${file._id.toString()}${file.extension}`,
      );
    }),
  );

  await Document.deleteMany({ _id: { $in: allDocuemt.map((doc) => doc._id) } });
  await Directory.deleteMany({
    _id: { $in: allDirectory.map((doc) => doc._id) },
  });
  res.status(200).json(new ApiResponse(200, "Directory delete Successfuly"));
};
