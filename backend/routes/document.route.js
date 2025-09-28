import express from "express";
import {
  createDocument,
  deleteDocumentById,
  getDocumentById,
  starredToggleDocument,
  updateDocumentById,
} from "../controllers/document.controller.js";
import paramsValidation from "../middlewares/paramsValidation.js";
import { upload } from "../middlewares/multer.middleware.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";
import { validateInput } from "../utils/validateInput.js";
import { nameValidation } from "../validators/commanSchema.js";

const router = express.Router();

router.param("parentDirId", paramsValidation);

router
  .route("/{:parentDirId}")
  .post(permissionMiddleware("write"), upload.single("file"), createDocument);

router.param("id", paramsValidation);

router.put(
  "/:id/starred",
  permissionMiddleware("update"),
  starredToggleDocument,
);

router
  .route("/:id")
  .get(permissionMiddleware("read", false), getDocumentById)
  .put(
    validateInput(nameValidation),
    permissionMiddleware("write", false),
    updateDocumentById,
  )
  .delete(permissionMiddleware("delete", false), deleteDocumentById);

export default router;
