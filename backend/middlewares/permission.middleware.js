import { actionRights, roleWeights } from "../config/roles.js";
import Directory from "../models/Directory.model.js";
import Document from "../models/document.model.js";
import ShareLink from "../models/ShareLink.model.js";
import ApiError from "../utils/ApiError.js";

export const permissionMiddleware = (action, isDirectory = true) => {
  return async (req, res, next) => {
    /**
     * check this middleware are use for the directory or not
     *  for the document to get this document id get find it parent id .
     */
    let directory;

    if (isDirectory) {
      // is the directory
      const dirId =
        req.params.id || req.params.parentDirId || req.user.rootDirId;
      directory = await Directory.findById(dirId);
    } else {
      // this document and find parentDirId and get also paraent dir
      const document = await Document.findById(req.params.id).populate({
        path: "parentDirId",
      });

      if (!document) {
        return res.status(404).json(new ApiError(404, "Document not found"));
      }
      directory = document.parentDirId;
      console.log(directory);

      // check if this file upload in the root direcory and also owen of this root directory than allow
      if (!directory.parentDirId && directory.userId.equals(req.user._id)) {
        return next();
      }
    }

    if (!directory) {
      return res.status(404).json(new ApiError(404, "Directory not found"));
    }

    // if folder are the anyone
    if (action === "read") {
      const isShared = await ShareLink.exists({ directoryId: directory._id });

      if (isShared) {
        return next();
      }
    }

    if (directory.userId.equals(req.user._id)) {
      return next();
    }

    // check if permission array are the empty
    if (directory.permission.length === 0) {
      return res.status(403).json(new ApiError(403, "Unauthorized"));
    }

    // get the dir document and permission
    const filePermisionOnUser = directory.permission.find((p) =>
      p.userId.equals(req.user._id),
    );

    // compar base on the number
    if (actionRights[action] <= roleWeights[filePermisionOnUser.role]) {
      return next();
    } else {
      return res
        .status(403)
        .json(
          new ApiError(
            403,
            "Unauthorized to access this resource Or not allowed This action",
          ),
        );
    }
  };
};
