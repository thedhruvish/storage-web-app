import { createClient } from "redis";

if (!process.env.REDIS_URL) {
  throw new Error(
    "REDIS_URL is not defined add it in env file, key name is REDIS_URL",
  );
}

const redisClient = createClient({
  url: process.env.REDIS_URL,
});
redisClient.on("error", (err) => {
  console.error("❗ Redis Client Error:", err.message);
});
await redisClient.connect();

export default redisClient;
