import { isValidObjectId } from "mongoose";
import Session from "../models/Session.model.js";
import ApiResponse from "../utils/ApiResponse.js";

export const checkAuth = async (req, res, next) => {
  const { sessionId } = req.signedCookies;
  // check valid id
  if (!sessionId || !isValidObjectId(sessionId)) {
    return res.status(401).json(new ApiResponse(401, "Unauthorized"));
  }
  const session = await Session.findById(sessionId).populate("userId");
  if (!session) {
    return res.status(401).json(new ApiResponse(401, "Unauthorized"));
  }
  // add user detial in requent object
  req.user = {
    _id: session.userId._id,
    rootDirId: session.userId.rootDirId,
    email: session.userId.email,
    role: session.userId.role,
  };
  next();
};
