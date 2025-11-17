import cron from "node-cron";
import User from "../models/User.model.js";
import Document from "../models/document.model.js";
import { updateParentDirectorySize } from "../utils/DirectoryHelper.js";
import { rm } from "node:fs/promises";
import mongoose from "mongoose";

export const removeSubscriptionExpiryData = () => {
  // Run every day at 00:05
  cron.schedule(
    "5 0 * * *",
    async () => {
      console.log("Running daily subscription cleanup...");

      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          const users = await User.find({
            dueDeleteDate: { $lt: new Date() },
          })
            .select("maxStorageBytes rootDirId")
            .populate({
              path: "rootDirId",
              select: "metaData.size",
            })
            .lean()
            .session(session);

          if (users.length === 0) return;

          const overLimitUsers = users
            .map((u) => {
              const extra = u.rootDirId.metaData.size - u.maxStorageBytes;
              return extra > 0 ? { userId: u._id, removeSpace: extra } : null;
            })
            .filter(Boolean);

          if (overLimitUsers.length === 0) return;

          const userIds = overLimitUsers.map((u) => u.userId);

          const allDocs = await Document.find({
            userId: { $in: userIds },
          })
            .sort({ createdAt: 1 })
            .select("userId metaData.size parentDirId extension")
            .lean()
            .session(session);

          const docsByUser = {};
          for (const doc of allDocs) {
            if (!docsByUser[doc.userId]) docsByUser[doc.userId] = [];
            docsByUser[doc.userId].push(doc);
          }

          let docsToDelete = [];
          for (const user of overLimitUsers) {
            let removed = 0;
            const userDocs = docsByUser[user.userId] || [];

            for (const doc of userDocs) {
              if (removed >= user.removeSpace) break;

              docsToDelete.push({
                documentId: doc._id,
                size: doc.metaData.size,
                parentId: doc.parentDirId,
                extension: doc.extension,
              });

              removed += doc.metaData.size;
            }
          }

          if (docsToDelete.length === 0) return;

          await Document.deleteMany(
            { _id: { $in: docsToDelete.map((d) => d.documentId) } },
            { session },
          );

          await User.updateMany(
            { _id: { $in: userIds } },
            { $set: { dueDeleteDate: null } },
            { session },
          );

          for (const d of docsToDelete) {
            await updateParentDirectorySize(d.parentId, -d.size, session);
          }

          session.docsToDelete = docsToDelete;
        });

        if (session.docsToDelete) {
          await Promise.all(
            session.docsToDelete.map(async (d) => {
              try {
                await rm(
                  `${import.meta.dirname}/../storage/${d.documentId}${d.extension}`,
                );
              } catch (error) {
                console.warn("File delete failed:", d.documentId);
              }
            }),
          );
        }

        console.log("Cleanup done.");
      } catch (error) {
        console.error("Transaction failed:", error);
      } finally {
        session.endSession();
      }
    },
    {
      timezone: "Asia/Kolkata",
    },
  );
};
