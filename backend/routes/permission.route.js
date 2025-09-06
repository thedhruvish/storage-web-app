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
import { validateInput } from "../utils/validateInput.js";
import {
  addDirectoryPermissionValidation,
  changeDirectoryPermisionValidation,
  createShareLinkValidation,
  removeDirectoryPermisionValidation,
} from "../validators/permissionSchema.js";
import paramsValidation from "../middlewares/paramsValidation.js";

const router = express.Router();
// public route to get the document
router.route("/share/:id").get(getShareLink);

// check auth
router.use(checkAuth, permissionMiddleware("write"));

// valid parms
router.param("id", paramsValidation);

router
  .route("/share/:id")
  .post(validateInput(createShareLinkValidation), createShareLink);

// permission on dir
router
  .route("/:id/directory")
  .get(getDirectoryPermissionUsers)
  .post(validateInput(addDirectoryPermissionValidation), addDirectoryPermision)
  .put(
    validateInput(changeDirectoryPermisionValidation),
    changeDirectoryPermision,
  )
  .delete(
    validateInput(removeDirectoryPermisionValidation),
    removeDirectoryPermision,
  );

export default router;
