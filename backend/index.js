import dotenv from "dotenv";
dotenv.config({ path: ".env", debug: true });
import express from "express";
import cors from "cors";
import cookiesParser from "cookie-parser";

const port = process.env.PORT || 4000;
const cookieSecret = process.env.COOKIESECRETKEY || "DHRUVISH";
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookiesParser(cookieSecret));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
