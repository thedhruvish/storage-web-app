import express from "express";
import {
  createDirectory,
  deleteDirectoryById,
  getDirectory,
  updateDirectoryById,
} from "../controllers/directory.controller.js";
import paramsValidation from "../middlewares/paramsValidation.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";

const router = express.Router();
// check the id are the valid or not
router.param("id", paramsValidation);

// get all dirs and create a dirctroy
router
  .route("/{:id}")
  .get(permissionMiddleware("read"), getDirectory)
  .post(permissionMiddleware("write"), createDirectory);

// update dirs and delete directory
router
  .route("/:id")
  .put(permissionMiddleware("update"), updateDirectoryById)
  .delete(permissionMiddleware("delete"), deleteDirectoryById);

export default router;
