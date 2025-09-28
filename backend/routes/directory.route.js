import express from "express";
import {
  createDirectory,
  deleteDirectoryById,
  getDirectory,
  starredToggleDirectory,
  updateDirectoryById,
} from "../controllers/directory.controller.js";
import paramsValidation from "../middlewares/paramsValidation.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";
import { validateInput } from "../utils/validateInput.js";
import { nameValidation } from "../validators/commanSchema.js";

const router = express.Router();
// check the id are the valid or not
router.param("id", paramsValidation);

// get all dirs and create a dirctroy
router
  .route("/{:id}")
  .get(permissionMiddleware("read"), getDirectory)
  .post(
    validateInput(nameValidation),
    permissionMiddleware("write"),
    createDirectory,
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
  .delete(permissionMiddleware("delete"), deleteDirectoryById);

export default router;
