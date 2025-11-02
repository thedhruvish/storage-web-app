import express from "express";
import { listAllSubscription } from "../controllers/user.controller.js";
const router = express.Router();

router.get("/subscriptions", listAllSubscription);

export default router;
