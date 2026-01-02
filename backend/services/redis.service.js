import redisClient from "../config/redis-client.js";
import crypto from "crypto";

export const createAndCheckLimitSession = async (userId, limitDevices = 3) => {
  const sessionUUID = crypto.randomUUID();
  const sessionKey = `session:${sessionUUID}`;

  let cursor = "0";
  let userSessions = [];

  // Scan only session:* keys
  do {
    const { cursor: nextCursor, keys } = await redisClient.scan(cursor, {
      MATCH: "session:*",
      COUNT: 100,
    });
    cursor = nextCursor;

    for (const key of keys) {
      const value = await redisClient.get(key);
      if (value === userId) {
        if (limitDevices === 0) {
          await redisClient.del(key);
        } else {
          userSessions.push(key);
        }
      }
    }
  } while (cursor !== "0");

  if (userSessions.length >= limitDevices) {
    // Remove the oldest session
    const keyToRemove = userSessions[0];
    await redisClient.del(keyToRemove);
  }

  await redisClient.set(sessionKey, userId, { EX: 24 * 60 * 60 });

  return sessionUUID;
};

export const deleteAllUserSessions = async (userId) => {
  let cursor = "0";

  do {
    const { cursor: nextCursor, keys } = await redisClient.scan(cursor, {
      MATCH: "session:*",
      COUNT: 100,
    });
    cursor = nextCursor;

    for (const key of keys) {
      const value = await redisClient.get(key);
      if (value === userId) {
        await redisClient.del(key);
      }
    }
  } while (cursor !== "0");
};

export const countCheckoutUrls = async (MATCH) => {
  let cursor = "0";
  let total = 0;
  do {
    const { cursor: nextCursor, keys } = await redisClient.scan(cursor, {
      MATCH,
      COUNT: 100,
    });

    total += keys.length;
    cursor = nextCursor;
  } while (cursor !== "0");

  return total;
};

export const deleteRedisKey = async (key) => {
  await redisClient.del(key);
};
