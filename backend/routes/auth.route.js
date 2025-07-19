import express from "express";
import {
  registerWithEmail,
  loginWithEmail,
  logout,
  logoutAllDevices,
  getCureentUser,
} from "../controllers/auth.controller.js";
import { checkAuth } from "../middlewares/auth.js";

const router = express.Router();

// router login with email and password
router.post("/register", registerWithEmail);
router.post("/login", loginWithEmail);

// authenticated route
router.use(checkAuth);
router.get("/me", getCureentUser);

// logout user
router.post("/logout", logout);
router.get("/logoutAll", logoutAllDevices);
export default router;
