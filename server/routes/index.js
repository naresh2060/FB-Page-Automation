import express from "express";
import authRoutes from "../api/v1/auth/auth.js";
import facebookRoutes from "./facebook.routes.js";
import postRoutes from "./post.routes.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/facebook", facebookRoutes);
router.use("/posts", authenticate, postRoutes);

export default router;
