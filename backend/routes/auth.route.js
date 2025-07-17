import express from "express";
import {
  registerWithEmail,
  loginWithEmail,
} from "../controllers/auth.controller.js";

const router = express.Router();

// router login with email and password
router.post("/register", registerWithEmail);
router.post("/login", loginWithEmail);

export default router;
