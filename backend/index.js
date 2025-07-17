import dotenv from "dotenv";
dotenv.config({ path: ".env", debug: true });
import express from "express";
import cors from "cors";
import cookiesParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import authRoute from "./routes/auth.route.js";

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

app.use((err, req, res, next) => {
  console.log({ err });
  console.log(err.statusCode);
  console.log("error for end");
  res
    .status(err.statusCode || 500)
    .json(err);
});

// db connect after server run
connectDB().then(() =>
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  }),
);
