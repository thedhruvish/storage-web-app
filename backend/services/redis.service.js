import redisClient from "../config/redis-client.js";
import SessionHistory from "../models/SessionHistory.model.js";
import { getDeviceInfoFromRequest } from "../utils/deviceInfo.js";
import { getLocationInfo } from "../utils/locationInfo.js";

export const createAndCheckLimitSession = async ({
  userId,
  req,
  limitDevices = 3,
}) => {
  const deviceInfo = getDeviceInfoFromRequest(req);
  const locationInfo = await getLocationInfo(deviceInfo.ipAddress);

  const zsetKey = `user:sessions:${userId}`;
  const now = Date.now();
  const SESSION_TTL = 24 * 60 * 60;

  // Create DB session
  const newSession = await SessionHistory.create({
    userId,
    isActive: true,
    location: locationInfo,
    ipAddress: deviceInfo.ipAddress,
    device: {
      browser: deviceInfo.device.browser,
      os: deviceInfo.device.os,
      type: deviceInfo.device.type,
    },
    userAgent: deviceInfo.userAgent,
  });

  const sessionId = newSession._id.toString();
  const sessionKey = `session:${sessionId}`;

  // Save in Redis
  await redisClient
    .multi()
    .zAdd(zsetKey, { score: now, value: sessionId })
    .set(sessionKey, userId, {
      expiration: { type: "EX", value: SESSION_TTL },
    })
    .expire(zsetKey, SESSION_TTL)
    .exec();

  // Count sessions
  const sessionCount = await redisClient.zCard(zsetKey);

  // 🚨 Only remove if limit exceeded
  if (sessionCount > limitDevices) {
    const excess = sessionCount - limitDevices;

    // Get oldest sessions
    const sessionsToRemove = await redisClient.zRange(zsetKey, 0, excess - 1);

    if (sessionsToRemove.length) {
      const cleanup = redisClient.multi();

      cleanup.zRem(zsetKey, ...sessionsToRemove);
      sessionsToRemove.forEach((id) => cleanup.del(`session:${id}`));

      await cleanup.exec();

      // Mark DB sessions inactive
      SessionHistory.updateMany(
        { _id: { $in: sessionsToRemove } },
        { $set: { isActive: false } },
      ).catch(console.error);
    }
  }

  return sessionId;
};

export const deleteAllUserSessions = async (
  userId,
  keepSessionId = undefined,
) => {
  const zsetKey = `user:sessions:${userId}`;
  const sessionIds = await redisClient.zRange(zsetKey, 0, -1);

  const toRemove = sessionIds.filter((id) => id !== keepSessionId);
  if (!toRemove.length) return;

  const multi = redisClient.multi();
  multi.zRem(zsetKey, ...toRemove);
  toRemove.forEach((id) => multi.del(`session:${id}`));
  await multi.exec();

  SessionHistory.updateMany(
    { _id: { $in: toRemove } },
    { $set: { isActive: false } },
  ).catch(console.error);
};

export const deleteSingleUserSession = async ({ userId, sessionId }) => {
  const zsetKey = `user:sessions:${userId}`;
  const sessionKey = `session:${sessionId}`;

  // remove from redis
  await redisClient.multi().zRem(zsetKey, sessionId).del(sessionKey).exec();

  // mark session inactive in DB
  await SessionHistory.findByIdAndUpdate(sessionId, {
    $set: { isActive: false },
  }).catch(console.error);
};

export const countUserCheckoutUrls = async (userId) => {
  return Number(await redisClient.get(`checkout:url:count:${userId}`)) || 0;
};

export const createCheckoutUrl = async (userId, planId, url) => {
  const key = `checkoutUrl:${userId}:${planId}`;

  const exists = await redisClient.exists(key);
  if (exists) return;

  await redisClient
    .multi()
    .set(key, url, { expiration: { type: "EX", value: 3600 } })
    .incr("checkout:url:count")
    .exec();
};

export const deleteRedisKey = async (key) => {
  await redisClient.del(key);
};

export const setRedisValue = async (key, value, option = undefined) => {
  await redisClient.set(key, value, option);
};

export const getRedisValue = async (key) => {
  return await redisClient.get(key);
};
