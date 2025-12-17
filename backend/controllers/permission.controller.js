import Directory from "../models/Directory.model.js";
import User from "../models/User.model.js";
import ShareLink from "../models/ShareLink.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import Document from "../models/Document.model.js";

// get dirctory permission Users list
export const getDirectoryPermissionUsers = async (req, res) => {
  const dirId = req.params.id;
  const directory = await Directory.findById(dirId)
    .populate({
      path: "permission.userId",
      select: "name email _id picture", // only name & email from User
    })
    .select({
      permission: 1,
      _id: 1,
    });

  // directory user fetch after get link
  const shareLink = await ShareLink.findOne({ directoryId: dirId });

  if (!directory) {
    return res.status(404).json(new ApiError(404, "Directory not found"));
  }
  res.status(200).json(
    new ApiResponse(200, "List out All Direcory share Users Successfuly", {
      directory,
      shareLink,
    }),
  );
};

// add Directory permision
export const addDirectoryPermision = async (req, res) => {
  // get the parent dir
  const dirId = req.params.id;

  const { email, role = "viewer" } = req.body;
  // find directory
  const directory = await Directory.findById(dirId);

  if (!directory) {
    return res.status(404).json(new ApiError(404, "Directory not found"));
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json(new ApiError(404, "User not found"));
  }

  const newPermision = {
    userId: user._id,
    role,
  };
  // push the permision array
  directory.permission.push(newPermision);
  await directory.save();
  res
    .status(200)
    .json(new ApiResponse(200, "Add Directory Permision Successfuly"));
};

// change user permission
export const changeDirectoryPermision = async (req, res) => {
  const dirId = req.params.id;
  const { userId, role } = req.body;

  const directory = await Directory.updateOne(
    {
      _id: dirId,
      "permission._id": userId,
    },
    {
      $set: { "permission.$.role": role },
    },
  );
  if (!directory) {
    return res.status(404).json(new ApiError(404, "Directory not found"));
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, "Directory Permision update Successfuly", directory),
    );
};

// remove directory permission
export const removeDirectoryPermision = async (req, res) => {
  const dirId = req.params.id;
  const { userId } = req.body;

  const directory = await Directory.findById(dirId);
  if (!directory) {
    return res.status(404).json(new ApiError(404, "Directory not found"));
  }
  directory.permission.pull({ userId });
  await directory.save();
  res
    .status(200)
    .json(new ApiResponse(200, "Directory Permision Remove Successfuly"));
};

// create share Link
export const createShareLink = async (req, res) => {
  const dirId = req.params.id;
  const { shareLink: link } = req.body;

  const exstingLink = await ShareLink.exists({ link });

  if (exstingLink) {
    return res
      .status(400)
      .json(new ApiError(400, "Link already exists. Try New Link"));
  }

  // upsert link
  const shareLink = await ShareLink.findOneAndUpdate(
    { directoryId: dirId },
    {
      $set: { link, directoryId: dirId, userId: req.user._id },
    },
    { upsert: true, new: true },
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, "Share link was created Successfuly", shareLink),
    );
};

// provieder link to get all files
export const getShareLink = async (req, res) => {
  const link = req.params.id;
  // find the link
  const shareLink = await ShareLink.findOne({ link });

  if (!shareLink) {
    return res.status(404).json(new ApiError(404, "This Resource not found"));
  }

  // get directory thorw the document list
  const documents = await Document.find({ parentDirId: shareLink.directoryId });
  if (!documents) {
    return res.status(404).json(new ApiError(404, "Documents not found"));
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Share Directory data send", { documents }));
};
