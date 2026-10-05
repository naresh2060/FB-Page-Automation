import express from "express";
import { authenticate } from "../middlewares/authenticate.js";

import {
    addInstagram,
    getInstagramPosts,
    publishInstagramPost,
} from "../controllers/instagramController.js"

const router = express.Router();

router.use(authenticate);

// connect new platform
router.post("/add",addInstagram);
router.post("/publish", publishInstagramPost);


router.get("/posts", getInstagramPosts);





export default router;