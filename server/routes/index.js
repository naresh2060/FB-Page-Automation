import express from "express";
import authRoutes from "./auth.routes.js";
import facebookRoutes from "./facebook.routes.js";
import instagramRoutes from "./instagram.routes.js"
import postRoutes from "./post.routes.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/facebook", facebookRoutes);
router.use("/instagram",instagramRoutes);
router.use("/posts", authenticate, postRoutes);

export default router;
