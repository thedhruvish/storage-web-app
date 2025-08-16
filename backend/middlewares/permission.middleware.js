import { actionRights, roleWeights } from "../config/roles.js";
import Directory from "../models/Directory.model.js";
import ApiError from "../utils/ApiError.js";

export const permissionMiddleware = (action) => {
  return async (req, res, next) => {
    let dirId = req.params.id || req.user.rootDirId;
    const directory = await Directory.findById(dirId);

    if (!directory) {
      return res.status(404).json(new ApiError(404, "Directory not found"));
    }

    if (directory.userId.equals(req.user._id)) {
      return next();
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
        .status(401)
        .json(new ApiError(401, "Unauthorized to access this resource"));
    }
  };
};
