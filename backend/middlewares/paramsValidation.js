import { isValidObjectId } from "mongoose";

export default function paramsValidation(req, res, next, id) {
  if (!isValidObjectId(id)) {
    return res.status(400).json({ error: "invalid ID" });
  }
  next();
}
