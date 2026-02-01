import express from "express";
import {
  createDirectoryController,
  getDirectory,
  hardDeleteDirectoryById,
  softDeleteDirectoryById,
  starredToggleDirectory,
  updateDirectoryById,
  emptyTrashController,
  restoreDirectoryById,
  getTrashController,
} from "../controllers/directory.controller.js";
import paramsValidation from "../middlewares/paramsValidation.middleware.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";
import { validateInput } from "../utils/validateInput.js";
import { nameValidation } from "../validators/comman.validator.js";

const router = express.Router();

router.delete("/trash", permissionMiddleware("delete"), emptyTrashController);

router.get("/trash", permissionMiddleware("read"), getTrashController);
// check the id are the valid or not
router.param("id", paramsValidation);

// get all dirs and create a dirctroy
router
  .route("/{:id}")
  .get(permissionMiddleware("read"), getDirectory)
  .post(
    validateInput(nameValidation),
    permissionMiddleware("write"),
    createDirectoryController,
  );

// starr toggle
router.put(
  "/:id/starred",
  permissionMiddleware("update"),
  starredToggleDirectory,
);

// update dirs and delete directory
router
  .route("/:id")
  .put(
    validateInput(nameValidation),
    permissionMiddleware("update"),
    updateDirectoryById,
  )
  .delete(permissionMiddleware("delete"), softDeleteDirectoryById);

router.delete(
  "/:id/hard",
  permissionMiddleware("delete"),
  hardDeleteDirectoryById,
);

router.put(
  "/:id/restore",
  permissionMiddleware("delete"),
  restoreDirectoryById,
);

export default router;
