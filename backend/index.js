import app from "./app.js";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis-client.js";

const port = process.env.PORT || 4000;

const startServer = async () => {
  try {
    // connect mongo and redis
    await Promise.all([connectDB(), connectRedis()]);
    app.listen(port, () => {
      console.log(` Server listening on port ${port}`);
    });
  } catch (error) {
    console.error(" Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
