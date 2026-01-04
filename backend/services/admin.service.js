import User from "../models/User.model.js";
import { deleteAllUserSessions } from "../services/redis.service.js";

export const getAllUsersService = async () => {
  return await User.find({});
};

export const changeRole = async ({ userId, role }) => {
  await User.updateOne({ _id: userId }, { role });
};

export const logoutAllDevicesService = async (userId) => {
  await deleteAllUserSessions(userId, 0);
};

export const softDeleteOrRecoverUserService = async ({ userId, isDeleted }) => {
  await User.updateOne({ _id: userId }, { isDeleted: !!isDeleted });
};
export const hardDeleteUserService = async (userId) => {
  await deleteAllUserSessions(userId);

  const documents = await Document.find({ userId }).select({
    _id: 1,
    extension: 1,
  });

  // delete physical files
  for (const doc of documents) {
    await rm(`./storage/${doc._id}${doc.extension}`, {
      force: true,
    });
  }

  await Document.deleteMany({ userId });
  await Directory.deleteMany({ userId });

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
};

// change role
export const changeUserRoleService = async (userId, role) => {
  const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};
