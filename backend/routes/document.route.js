import express from "express";
import {
  createDocument,
  deleteDocumentById,
  getDocumentById,
  updateDocumentById,
} from "../controllers/document.controller.js";
import paramsValidation from "../middlewares/paramsValidation.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.param("parentDirId", paramsValidation);

router.route("/{:parentDirId}").post(upload.single("file"), createDocument);

router.param("id", paramsValidation);
router
  .route("/:id")
  .get(getDocumentById)
  .put(updateDocumentById)
  .delete(deleteDocumentById);

export default router;
