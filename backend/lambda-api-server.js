import serverless from "serverless-http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis-client.js";

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  await connectRedis();
  return serverless(app)(event, context);
};
