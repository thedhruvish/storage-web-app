import express from "express";
import {
  checkOauthConnected,
  genrateGoogleDriveImportAuthUrl,
  googleDriveCallback,
  importDriveData,
} from "../controllers/importData.controller.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";
const router = express.Router();

// gen 0auth url
router.get("/google/oauthurlgen", genrateGoogleDriveImportAuthUrl);

// handle google callback
router.get("/google/callback", googleDriveCallback);

// check the user is connected or not
router.get("/google/check-connected", checkOauthConnected);

// Give dir to download inside files
router.post(
  "/google/file-data{/:id}",
  permissionMiddleware("write"),
  importDriveData,
);

export default router;
