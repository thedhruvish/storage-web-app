import Directory from "../models/Directory.model.js";
import User from "../models/User.model.js";
import ShareLink from "../models/ShareLink.model.js";
import Document from "../models/Document.model.js";
import ApiError from "../utils/ApiError.js";

// permissions
export const getDirectoryPermissionUsersService = async (dirId) => {
  const directory = await Directory.findById(dirId)
    .populate({
      path: "permission.userId",
      select: "name email _id picture",
    })
    .select({ permission: 1, _id: 1 });

  if (!directory) {
    throw new ApiError(404, "Directory not found");
  }

  const shareLink = await ShareLink.findOne({ directoryId: dirId });

  return { directory, shareLink };
};

export const addDirectoryPermissionService = async (
  dirId,
  email,
  role = "viewer",
) => {
  const directory = await Directory.findById(dirId);
  if (!directory) throw new ApiError(404, "Directory not found");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  directory.permission.push({
    userId: user._id,
    role,
  });

  await directory.save();
};

export const changeDirectoryPermissionService = async (
  dirId,
  permissionId,
  role,
) => {
  const result = await Directory.updateOne(
    {
      _id: dirId,
      "permission._id": permissionId,
    },
    {
      $set: { "permission.$.role": role },
    },
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, "Directory or permission not found");
  }

  return result;
};

export const removeDirectoryPermissionService = async (dirId, userId) => {
  const directory = await Directory.findById(dirId);
  if (!directory) throw new ApiError(404, "Directory not found");

  directory.permission.pull({ userId });
  await directory.save();
};

// share links
export const createShareLinkService = async (dirId, link, userId) => {
  const exists = await ShareLink.exists({ link });
  if (exists) {
    throw new ApiError(400, "Link already exists. Try new link");
  }

  return ShareLink.findOneAndUpdate(
    { directoryId: dirId },
    {
      $set: {
        link,
        directoryId: dirId,
        userId,
      },
    },
    { upsert: true, new: true },
  );
};

export const getShareLinkService = async (link) => {
  const shareLink = await ShareLink.findOne({ link });
  if (!shareLink) {
    throw new ApiError(404, "This Resource not found");
  }

  const documents = await Document.find({
    parentDirId: shareLink.directoryId,
  });

  return { documents };
};

export const deleteShareLinkService = async (directoryId) => {
  await ShareLink.deleteOne({ directoryId });
};
