import express from "express";
import {
  addDirectoryPermision,
  changeDirectoryPermision,
  createShareLink,
  getDirectoryPermissionUsers,
  getShareLink,
  removeDirectoryPermision,
} from "../controllers/permission.controller.js";
import { checkAuth } from "../middlewares/auth.js";
import { permissionMiddleware } from "../middlewares/permission.middleware.js";

const router = express.Router();
// public route to get the document
router.route("/share/:id").get(getShareLink);

// check auth
router.use(checkAuth, permissionMiddleware("write"));
router.route("/share/:id").post(createShareLink);

// permission on dir
router
  .route("/:id/directory")
  .get(getDirectoryPermissionUsers)
  .post(addDirectoryPermision)
  .put(changeDirectoryPermision)
  .delete(removeDirectoryPermision);

export default router;
