import Directory from "../models/Directory.model.js";

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
      console.log("✅ Updated parent directories:", directories);
    } else {
      console.log("⚠️ No parent directories found");
    }
  } catch (error) {
    console.error("❌ Error updating parent directory size:", error);
  }
};
