import express from "express";
import {
  checkOauthConnected,
  genrateGoogleDriveImportAuthUrl,
  googleDriveCallback,
  importDriveData,
} from "../controllers/importData.controller.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";
import { validateInput } from "../utils/validateInput.js";
import { importDriveDataValidation } from "../validators/commanSchema.js";
import paramsValidation from "../middlewares/paramsValidation.js";

const router = express.Router();

// gen 0auth url
router.get("/google/oauthurlgen", genrateGoogleDriveImportAuthUrl);

// handle google callback
router.get("/google/callback", googleDriveCallback);

// check the user is connected or not
router.get("/google/check-connected", checkOauthConnected);

// validate params:
router.param("id", paramsValidation);

// Give dir to download inside files
router.post(
  "/google/file-data{/:id}",
  validateInput(importDriveDataValidation),
  permissionMiddleware("write"),
  importDriveData,
);

export default router;
