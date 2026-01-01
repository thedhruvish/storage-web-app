import express from "express";
import {
  cancelUpload,
  checkUploadedObject,
  createPresigned,
  deleteDocumentById,
  getDocumentById,
  starredToggleDocument,
  updateDocumentById,
} from "../controllers/document.controller.js";
import paramsValidation from "../middlewares/paramsValidation.middleware.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";
import { validateInput } from "../utils/validateInput.js";
import { nameValidation } from "../validators/comman.validator.js";

const router = express.Router();

router.param("parentDirId", paramsValidation);

router
  .route("/{:parentDirId}/init")
  .post(permissionMiddleware("write"), createPresigned);

router.param("id", paramsValidation);

// upload after check is completed or not
router.post(
  "/:id/compeleted",
  permissionMiddleware("write", false),
  checkUploadedObject,
);

// user click canel button than remove the document in the mongo.
router.delete(
  "/:id/cancel",
  permissionMiddleware("write", false),
  cancelUpload,
);

router.put(
  "/:id/starred",
  permissionMiddleware("update", false),
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
