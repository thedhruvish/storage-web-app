import ApiResponse from "../utils/ApiResponse.js";
import {
  getAllUsersService,
  logoutAllDevicesService,
  softDeleteOrRecoverUserService,
  hardDeleteUserService,
  changeUserRoleService,
} from "../services/admin.service.js";

// get all users
export const getAllUser = async (req, res) => {
  const users = await getAllUsersService();

  res.status(200).json(new ApiResponse(200, "User list", { users }));
};

// logout all devices
export const logoutAllDevices = async (req, res) => {
  await logoutAllDevicesService(req.params.userId);

  res.status(200).json(new ApiResponse(200, "All device logout Successfully"));
};

// soft delete / recover user
export const userDeleteChange = async (req, res) => {
  await softDeleteOrRecoverUserService(req.params.userId, req.body.isDeleted);

  res.status(200).json(new ApiResponse(200, "User delete change Successfully"));
};

// hard delete user
export const userHardDelete = async (req, res) => {
  await hardDeleteUserService(req.params.userId);

  res.status(200).json(new ApiResponse(200, "User hard delete Successfully"));
};

// change user role
export const userRoleChange = async (req, res) => {
  await changeUserRoleService(req.params.userId, req.body.role);

  res.status(200).json(new ApiResponse(200, "User role change Successfully"));
};
