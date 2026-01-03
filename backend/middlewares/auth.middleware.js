import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { getRedisValue, setRedisValue } from "../services/redis.service.js";

export const checkAuth = async (req, res, next) => {
  const { sessionId } = req.signedCookies;
  // check valid id
  if (!sessionId) {
    res.clearCookie("session");
    return res.status(401).json(new ApiError(401, "Unauthorized 1"));
  }

  const userId = await getRedisValue(`session:${sessionId}`);

  if (!userId) {
    res.clearCookie("session");
    return res.status(401).json(new ApiError(401, "Unauthorized 2"));
  }

  let user = await getRedisValue(`user:${userId}`);
  if (user) {
    user = JSON.parse(user);
  } else {
    user = await User.findById(userId);

    await setRedisValue(
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
  next();
};
