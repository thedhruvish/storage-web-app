import { createClient } from "redis";
let redisClient;
if (!process.env.REDIS_URL) {
  throw new Error(
    "REDIS_URL is not defined add it in env file, key name is REDIS_URL",
  );
}

export const connectRedis = async () => {
  if (redisClient) return redisClient;
  // create a client
  redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  // handle errors
  redisClient.on("error", (err) => {
    console.error("❗ Redis Client Error:", err.message);
  });

  // connect to the
  try {
    await redisClient.connect();
    console.log(" Redis connected successfully");
  } catch (error) {
    console.error(" Could not connect to Redis:", error);
    process.exit(1); // Exit if critical infrastructure fails
  }
};

export default redisClient;
