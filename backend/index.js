import dotenv from "dotenv";
dotenv.config({ path: ".env", debug: true });
import express from "express";
import cors from "cors";
import cookiesParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import { checkAuth } from "./middlewares/auth.js";
import authRoute from "./routes/auth.route.js";
import directoryRoute from "./routes/directory.route.js";
import docuemntRoute from "./routes/document.route.js";

const port = process.env.PORT || 4000;
const cookieSecret = process.env.COOKIESECRETKEY || "DHRUVISH";
const app = express();

// cors allow
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
// parser data into json and add req.body
app.use(express.json());

// cookies add req.cookie
app.use(cookiesParser(cookieSecret));

// auth router
app.use("/auth", authRoute);

// login Required route
app.use(checkAuth);

app.use("/directory", directoryRoute);
app.use("/document", docuemntRoute);

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

// db connect after server run
connectDB().then(() =>
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  }),
);
