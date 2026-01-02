import ApiResponse from "../utils/ApiResponse.js";
import {
  getDirectoryPermissionUsersService,
  addDirectoryPermissionService,
  changeDirectoryPermissionService,
  removeDirectoryPermissionService,
  createShareLinkService,
  getShareLinkService,
} from "../services/share.service.js";

// get directory permission users
export const getDirectoryPermissionUsers = async (req, res) => {
  const data = await getDirectoryPermissionUsersService(req.params.id);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "List out All Directory share Users Successfully",
        data,
      ),
    );
};

// add directory permission
export const addDirectoryPermision = async (req, res) => {
  await addDirectoryPermissionService(
    req.params.id,
    req.body.email,
    req.body.role,
  );

  res
    .status(200)
    .json(new ApiResponse(200, "Add Directory Permission Successfully"));
};

// change permission
export const changeDirectoryPermision = async (req, res) => {
  const result = await changeDirectoryPermissionService(
    req.params.id,
    req.body.userId,
    req.body.role,
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, "Directory Permission update Successfully", result),
    );
};

// remove permission
export const removeDirectoryPermision = async (req, res) => {
  await removeDirectoryPermissionService(req.params.id, req.body.userId);

  res
    .status(200)
    .json(new ApiResponse(200, "Directory Permission Remove Successfully"));
};

// create share link
export const createShareLink = async (req, res) => {
  const shareLink = await createShareLinkService(
    req.params.id,
    req.body.shareLink,
    req.user._id,
  );

  res
    .status(200)
    .json(
      new ApiResponse(200, "Share link was created Successfully", shareLink),
    );
};

// access via share link
export const getShareLink = async (req, res) => {
  const data = await getShareLinkService(req.params.id);

  res.status(200).json(new ApiResponse(200, "Share Directory data send", data));
};
