import { Router } from "express";
import {
  getAllUser,
  userDeleteChange,
  userHardDelete,
  userRoleChange,
} from "../controllers/admin.controller.js";
const route = Router();

route.route("/users").get(getAllUser);

route
  .route("/users/:userId")
  .patch(userRoleChange)
  .put(userDeleteChange)
  .delete(userHardDelete);

export default route;
