import ApiError from "../utils/ApiError.js";
import redisClient from "../config/redis-client.js";
import User from "../models/User.model.js";

export const checkAuth = async (req, res, next) => {
  const { sessionId } = req.signedCookies;
  // check valid id
  if (!sessionId) {
    return res.status(401).json(new ApiError(401, "Unauthorized"));
  }

  const userId = await redisClient.get(`session:${sessionId}`);

  if (!userId) {
    return res.status(401).json(new ApiError(401, "Unauthorized"));
  }

  let user = await redisClient.get(`user:${userId}`);
  if (user) {
    user = JSON.parse(user);
  } else {
    user = await User.findById(userId);
    console.log("run on db");
    await redisClient.set(
      `user:${userId}`,
      JSON.stringify({
        _id: userId,
        rootDirId: user.rootDirId,
        email: user.email,
        role: user.role,
        maxStorageBytes: user.maxStorageBytes,
      }),
    );
  }
  req.user = {
    _id: user._id,
    rootDirId: user.rootDirId,
    email: user.email,
    role: user.role,
    maxStorageBytes: user.maxStorageBytes,
  };
  console.log(req.user);
  next();
};
