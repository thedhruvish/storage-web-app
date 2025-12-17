import express from "express";
import {
  cancelUpload,
  checkUploadedObject,
  createDocument,
  createPresigned,
  deleteDocumentById,
  getDocumentById,
  starredToggleDocument,
  updateDocumentById,
} from "../controllers/document.controller.js";
import paramsValidation from "../middlewares/paramsValidation.js";
import { createUpload } from "../middlewares/multer.middleware.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";
import { validateInput } from "../utils/validateInput.js";
import { nameValidation } from "../validators/commanSchema.js";
import { checkStorageLimit } from "../utils/checkStorageLimit.js";

const router = express.Router();

router.param("parentDirId", paramsValidation);

router.post("/{:parentDirId}/init", createPresigned);
router.post("/:id/compeleted", checkUploadedObject);
router.delete("/:id/cancel", cancelUpload);

router.route("/{:parentDirId}").post(
  permissionMiddleware("write"),
  checkStorageLimit,
  (req, res, next) => {
    const uploader = createUpload(req.remainingStorageBytes).single("file");
    uploader(req, res, (err) => {
      if (err)
        return res.status(400).json({ message: "Storage limit exceeded" });
      next();
    });
  },
  createDocument,
);

router.param("id", paramsValidation);

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
