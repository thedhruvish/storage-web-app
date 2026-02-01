import express from "express";
import { getRecentFiles } from "../controllers/recent.controller.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.get("/", getRecentFiles);

export default router;
