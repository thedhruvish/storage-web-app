import redisClient from "../config/redis-client.js";
import Directory from "../models/Directory.model.js";
import Document from "../models/Document.model.js";
import {
  DIRECTORY_PREVIEW_FOLDER,
  IMAGE_EXTS,
} from "../constants/s3.constants.js";
import { getSignedUrlForGetObject } from "./s3.service.js";

const RECENT_KEY_PREFIX = "recent:files:";
const MAX_RECENT_ITEMS = 50;
const RECENT_TTL = 7 * 24 * 60 * 60; // 7 days

/**
 * Add item to recent list
 */
export const addToRecent = async (userId, itemId, type) => {
  if (!userId || !itemId) return;

  const key = `${RECENT_KEY_PREFIX}${userId}`;
  const member = `${type}:${itemId}`; // Store type with ID to distinguish

  const now = Date.now();

  try {
    const multi = redisClient.multi();

    // Add to sorted set with current timestamp as score
    multi.zAdd(key, { score: now, value: member });

    // Set expiration for the whole key (sliding window)
    multi.expire(key, RECENT_TTL);

    multi.zRemRangeByRank(key, 0, -(MAX_RECENT_ITEMS + 1));

    await multi.exec();
  } catch (error) {
    console.error("Redis Error (addToRecent):", error);
  }
};

/**
 * Remove item from recent list
 *
 */
export const removeFromRecent = async (userId, itemId, type) => {
  if (!userId || !itemId) return;

  const key = `${RECENT_KEY_PREFIX}${userId}`;
  const member = `${type}:${itemId}`;

  try {
    await redisClient.zRem(key, member);
  } catch (error) {
    console.error("Redis Error (removeFromRecent):", error);
  }
};

/**
 * Get recent items
 * @param {string} userId
 */
export const getRecent = async (userId) => {
  const key = `${RECENT_KEY_PREFIX}${userId}`;

  try {
    const members = await redisClient.zRange(key, 0, -1, { REV: true });

    if (!members.length) return { directories: [], documents: [] };

    const directoryIds = [];
    const documentIds = [];

    members.forEach((member) => {
      const [type, id] = member.split(":");
      if (type === "directory") directoryIds.push(id);
      else if (type === "document") documentIds.push(id);
    });

    // Fetch details in parallel
    const [directories, documents] = await Promise.all([
      Directory.find({
        _id: { $in: directoryIds },
        trashAt: null,
        parentDirId: { $ne: null },
      }),
      Document.find({ _id: { $in: documentIds }, trashAt: null }),
    ]);

    // Map for sorting order preservation
    const dirMap = new Map(directories.map((d) => [d._id.toString(), d]));
    const docMap = new Map(documents.map((d) => [d._id.toString(), d]));

    const recentDirectories = [];
    const recentDocuments = [];

    // Iterate original members to preserve Sort Order (Recent first)
    for (const member of members) {
      const [type, id] = member.split(":");
      if (type === "directory") {
        const dir = dirMap.get(id);
        if (dir) recentDirectories.push(dir);
      } else {
        const doc = docMap.get(id);
        if (doc) recentDocuments.push(doc);
      }
    }

    // Process previews for documents
    const documentsWithPreview = await Promise.all(
      recentDocuments.map(async (doc) => {
        if (!IMAGE_EXTS.includes(doc.extension)) {
          return doc;
        }
        try {
          const previewUrl = await getSignedUrlForGetObject(
            `${doc._id}.avif`,
            doc.name,
            false,
            DIRECTORY_PREVIEW_FOLDER,
          );
          return { ...doc.toObject(), previewUrl };
        } catch (e) {
          return doc;
        }
      }),
    );

    return {
      directories: recentDirectories,
      documents: documentsWithPreview,
    };
  } catch (error) {
    console.error("Redis Error (getRecent):", error);
    return { directories: [], documents: [] };
  }
};
