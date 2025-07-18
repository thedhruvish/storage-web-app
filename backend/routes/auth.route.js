import express from "express";
import {
  registerWithEmail,
  loginWithEmail,
  logout,
  logoutAllDevices,
  getCureentUser,
} from "../controllers/auth.controller.js";

const router = express.Router();

// router login with email and password
router.post("/register", registerWithEmail);
router.post("/login", loginWithEmail);

router.get("/me", getCureentUser);

// logout user
router.get("/logout", logout);
router.get("/logoutAll", logoutAllDevices);
export default router;
