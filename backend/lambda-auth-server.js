import express from "express";
import serverless from "serverless-http";
import { connectDB } from "./config/db.js";
import { connectRedis } from "./config/redis-client.js";
import { validateInput } from "./utils/validateInput.js";
import {
  loginWithEmail,
  registerWithEmail,
} from "./controllers/auth.controller.js";
import {
  loginWithEmailValidation,
  registerWithEmailValidation,
} from "./validators/auth.validator.js";

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from lambda auth server!");
});

app.use(getRequestInfo);

app.post(
  "/register",
  validateInput(registerWithEmailValidation),
  registerWithEmail,
);

app.post("/login", validateInput(loginWithEmailValidation), loginWithEmail);

// 404 not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Not Found...",
  });
});

// Global error
app.use((err, req, res, next) => {
  console.error("Error caught by middleware:", err);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.log(process.env.NODE_ENV);
  console.log(err);
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }), // Only include stack trace in dev
  });
});

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  await connectRedis();
  return serverless(app)(event, context);
};
