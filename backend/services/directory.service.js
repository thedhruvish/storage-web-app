import {
  DIRECTORY_PREVIEW_FOLDER,
  IMAGE_EXTS,
} from "../constants/s3.constants.js";
import Directory from "../models/Directory.model.js";
import Document from "../models/Document.model.js";
import ApiError from "../utils/ApiError.js";
import { bulkDeleteS3Objects, getSignedUrlForGetObject } from "./s3.service.js";

/**
 * Get directory with children
 */
export const getDirectoryWithContent = async ({ directoryId, isStarred }) => {
  const directory = await Directory.findById(directoryId).populate({
    path: "path",
    select: "name _id",
  });

  if (!directory) {
    throw new ApiError(404, "Directory not found");
  }

  const filter = {};
  if (isStarred !== undefined) {
    filter.isStarred = isStarred;
  }

  const [directories, documents] = await Promise.all([
    Directory.find({ parentDirId: directory._id, ...filter }),
    Document.find({ parentDirId: directory._id, ...filter }),
  ]);

  const documentsWithPreviewUrl = await Promise.all(
    documents.map(async (doc) => {
      if (!IMAGE_EXTS.includes(doc.extension)) {
        return doc;
      }
      const previewUrl = await getSignedUrlForGetObject(
        `${doc._id}.avif`,
        doc.name,
        false,
        DIRECTORY_PREVIEW_FOLDER,
      );
      return { ...doc.toObject(), previewUrl };
    }),
  );

  return {
    path: directory,
    directories,
    documents: documentsWithPreviewUrl,
  };
};

/**
 * Create directory
 */
export const createDirectory = async ({ parentDirId, name, userId }) => {
  const parentDir = await Directory.findById(parentDirId, { path: 1 });
  if (!parentDir) {
    throw new ApiError(404, "Parent directory not found");
  }

  const directory = new Directory({
    name: name || "New Folder",
    userId,
    parentDirId,
    metaData: { size: 0 },
    path: [...parentDir.path, parentDir._id],
  });

  await directory.save();
};

/**
 * Rename directory
 */
export const renameDirectory = async (directoryId, name) => {
  const directory = await Directory.findByIdAndUpdate(
    directoryId,
    { name },
    { new: true },
  );

  if (!directory) {
    throw new ApiError(404, "Directory not found");
  }

  return directory;
};

/**
 * Toggle star
 */
export const toggleStarDirectory = async (directoryId) => {
  await Directory.findByIdAndUpdate(directoryId, [
    { $set: { isStarred: { $not: "$isStarred" } } },
  ]);
};

/**
 * Recursively collect documents & directories
 */
const collectRecursive = async (parentDirId) => {
  let documents = await Document.find({ parentDirId }).select({
    _id: 1,
    extension: 1,
    metaData: 1,
  });

  let directories = await Directory.find({ parentDirId }).select({
    _id: 1,
  });

  for (const dir of directories) {
    const nested = await collectRecursive(dir._id);
    documents.push(...nested.documents);
    directories.push(...nested.directories);
  }

  return { documents, directories };
};

/**
 * Delete directory recursively
 */
export const deleteDirectory = async (directoryId) => {
  const directory = await Directory.findById(directoryId).select({
    metaData: 1,
    parentDirId: 1,
  });

  if (!directory) {
    throw new ApiError(404, "Directory not found");
  }

  await updateParentDirectorySize(
    directory.parentDirId,
    -directory.metaData.size,
  );

  const { documents, directories } = await collectRecursive(directoryId);

  directories.push({ _id: directoryId });

  await Promise.all([
    bulkDeleteS3Objects(
      documents.map((file) => ({
        Key: `${DIRECTORY_UPLOAD_FOLDER}${file._id}${file.extension}`,
      })),
    ),
    Document.deleteMany({ _id: { $in: documents.map((d) => d._id) } }),
    Directory.deleteMany({ _id: { $in: directories.map((d) => d._id) } }),
  ]);
};

/**
 * Update parent dir size
 */
export const updateParentDirectorySize = async (dirId, size) => {
  try {
    const directories = [];

    // Traverse up the parent chain
    while (dirId) {
      directories.push(dirId);
      const parent = await Directory.findById(dirId)
        .select({
          _id: 1,
          parentDirId: 1,
        })
        .lean();
      if (!parent) break; // stop if parent not found

      dirId = parent.parentDirId;
    }

    // Update all collected directories
    if (directories.length > 0) {
      await Directory.updateMany(
        { _id: { $in: directories } },
        { $inc: { "metaData.size": size } },
      );
    }
  } catch (error) {
    console.error("❌ Error updating parent directory size:", error);
  }
};

export const singleFindDirectory = async (dirId, select) => {
  return Directory.findById(dirId, select);
};
