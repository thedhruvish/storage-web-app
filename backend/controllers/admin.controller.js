import { rm } from "node:fs/promises";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/User.model.js";
import Directory from "../models/Directory.model.js";
import Document from "../models/document.model.js";
import { createAndCheckLimitSession } from "../utils/redisHelper.js";

// get all users
export const getAllUser = async (req, res) => {
  const users = await User.find({});
  res.status(200).json(new ApiResponse(200, "User list", { users }));
};

// logout All Devices
export const logoutAllDevices = async (req, res) => {
  const userId = req.params.userId;

  await createAndCheckLimitSession(userId, 0);

  res.status(200).json(new ApiResponse(200, "All device logout Successfuly"));
};

// soft delete and recover user
export const userDeleteChange = async (req, res) => {
  const userId = req.params.userId;

  const { isDeleted = false } = req.body;
  // delete user
  await User.findByIdAndUpdate(userId, { isDeleted: !!isDeleted });
  res.status(200).json(new ApiResponse(200, "User delete change Successfuly"));
};

// hard delete
export const userHardDelete = async (req, res) => {
  const userId = req.params.userId;

  await Session.deleteMany({ userId });
  const allDocument = await Document.find({ userId }).select({
    _id: 1,
    extension: 1,
  });

  // delete all the files
  for (const document of allDocument) {
    await rm(`./storage/${document._id}${document.extension}`);
  }

  // delete all Document
  await Document.deleteMany({ userId });

  // delete all directory
  await Directory.deleteMany({ userId });

  // user delete
  await User.findByIdAndDelete(userId);

  res.status(200).json(new ApiResponse(200, "User hard delete Successfuly"));
};

// user role change
export const userRoleChange = async (req, res) => {
  const userId = req.params.userId;
  const { role } = req.body;
  await User.findByIdAndUpdate(userId, { role });
  res.status(200).json(new ApiResponse(200, "User role change Successfuly"));
};
