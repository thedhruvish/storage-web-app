import express from "express";
import cors from "cors";
import cookiesParser from "cookie-parser";
import serverless from "serverless-http";
import "./config/redis-client.js";
import { validateInput } from "./utils/validateInput.js";
import {
  loginWithEmail,
  registerWithEmail,
} from "./controllers/auth.controller.js";
import {
  loginWithEmailValidation,
  registerWithEmailValidation,
} from "./validators/auth.validator.js";
import { getRequestInfo } from "./middlewares/getRequestInfo.middleware.js";
import helmet from "helmet";
import { connectDB } from "./config/db.js";
import { deviceCheck } from "./middlewares/devicecheck.middleware.js";

const cookieSecret = process.env.COOKIESECRETKEY || "DHRUVISH";

const app = express();

app.set("trust proxy", 1);
app.use(deviceCheck);

app.use((req, res, next) => {
  if (req.isMobile) return next();
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
    contentSecurityPolicy: {
      directives: {
        reportUri: "/report-violation",
      },
    },
  })(req, res, next);
});
// cors allow
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.post(
  "/report-violation",
  express.json({ type: "application/csp-report" }),
  (req, res) => {
    console.log(req.body);
    res.status(200).json({ success: true });
  },
);
app.use(express.json());

app.use(cookiesParser(cookieSecret));

app.get("/", (req, res) => {
  res.send("Hello from lambda auth server!");
});

app.use(getRequestInfo);

app.post(
  "/auth/register",
  validateInput(registerWithEmailValidation),
  registerWithEmail,
);

app.post(
  "/auth/login",
  validateInput(loginWithEmailValidation),
  loginWithEmail,
);

// 404 not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Not Found......",
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

await connectDB();

export const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;
  return serverless(app)(event, context);
};
