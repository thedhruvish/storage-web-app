import express from "express";
import cors from "cors";
import cookiesParser from "cookie-parser";
import helmet from "helmet";

import { checkAuth } from "./middlewares/auth.js";
import { rateLimiter } from "./middlewares/rateLimit.js";

import authRoute from "./routes/auth.route.js";
import directoryRoute from "./routes/directory.route.js";
import docuemntRoute from "./routes/document.route.js";
import importDataRoute from "./routes/importData.route.js";
import permissionRoute from "./routes/permission.route.js";
import adminRoute from "./routes/admin.route.js";
import paymentRoute from "./routes/payment.route.js";
import planRoute from "./routes/plan.route.js";
import paymentStripeRoute from "./routes/paymentStripe.route.js";
import webhookRoute from "./routes/webhook.route.js";
import userRoute from "./routes/user.route.js";
import { startCronJobs } from "./cron-job/index.js";

const cookieSecret = process.env.COOKIESECRETKEY || "DHRUVISH";

const app = express();

// helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
    contentSecurityPolicy: {
      directives: {
        reportUri: "/report-violation",
      },
    },
  }),
);

// cron-job
startCronJobs();

// handle report violation:
app.post(
  "/report-violation",
  express.json({ type: "application/csp-report" }),
  (req, res) => {
    console.log(req.body);
    res.status(200).json({ success: true });
  },
);

// cors allow
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// webhook
app.use("/wh", webhookRoute);

// parser data into json and add req.body
app.use(express.json());

// cookies add req.cookie
app.use(cookiesParser(cookieSecret));

// auth router
app.use("/auth", rateLimiter({ maxLimit: 20 }), authRoute);

// plan route
app.use("/plan", rateLimiter({ maxLimit: 100 }), planRoute);

// permission on files
app.use("/permission", rateLimiter({ maxLimit: 100 }), permissionRoute);

// login Required route
app.use(rateLimiter({ maxLimit: 150 }), checkAuth);

app.use("/admin", adminRoute);
app.use("/directory", directoryRoute);
app.use("/document", docuemntRoute);
app.use("/import-data", importDataRoute);
app.use("/user", userRoute);
app.use("/payment", paymentRoute);
app.use("/payment/stripe", paymentStripeRoute);

/**
 * error handle
 */
// 404 error
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: "Not Found",
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

export default app;
