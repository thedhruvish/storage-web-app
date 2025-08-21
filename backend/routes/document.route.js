import express from "express";
import {
  createDocument,
  deleteDocumentById,
  getDocumentById,
  updateDocumentById,
} from "../controllers/document.controller.js";
import paramsValidation from "../middlewares/paramsValidation.js";
import { upload } from "../middlewares/multer.middleware.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";

const router = express.Router();

router.param("parentDirId", paramsValidation);

router
  .route("/{:parentDirId}")
  .post(permissionMiddleware("write"), upload.single("file"), createDocument);

router.param("id", paramsValidation);
router
  .route("/:id")
  .get(permissionMiddleware("read", false), getDocumentById)
  .put(permissionMiddleware("write", false), updateDocumentById)
  .delete(permissionMiddleware("delete", false), deleteDocumentById);

export default router;
