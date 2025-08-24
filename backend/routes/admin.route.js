import { Router } from "express";
import {
  getAllUser,
  logoutAllDevices,
  userDeleteChange,
  userHardDelete,
  userRoleChange,
} from "../controllers/admin.controller.js";
import { adminPermissionMiddleware } from "../middlewares/permission.middleware.js";
const route = Router();

route.route("/users").get(adminPermissionMiddleware("read"), getAllUser);

route
  .route("/users/:userId")
  .post(adminPermissionMiddleware("logoutAll"), logoutAllDevices)
  .patch(adminPermissionMiddleware("update"), userRoleChange)
  .put(adminPermissionMiddleware("softdelete"), userDeleteChange)
  .delete(adminPermissionMiddleware("harddelete"), userHardDelete);

export default route;
