import { Router } from "express";
import {
  getAllUser,
  logoutAllDevices,
  userDeleteChange,
  userHardDelete,
  userRoleChange,
} from "../controllers/admin.controller.js";
import { adminPermissionMiddleware } from "../middlewares/permission.middleware.js";
import { validateInput } from "../utils/validateInput.js";
import { userRoleChangeValidation } from "../validators/adminSchema.js";
import paramsValidation from "../middlewares/paramsValidation.js";

const route = Router();

route.route("/users").get(adminPermissionMiddleware("read"), getAllUser);

// validation params
route.param("userId", paramsValidation);

route
  .route("/users/:userId")
  .post(adminPermissionMiddleware("logoutAll"), logoutAllDevices)
  .patch(
    validateInput(userRoleChangeValidation),
    adminPermissionMiddleware("update"),
    userRoleChange,
  )
  .put(adminPermissionMiddleware("softdelete"), userDeleteChange)
  .delete(adminPermissionMiddleware("harddelete"), userHardDelete);

export default route;
