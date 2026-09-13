import express from "express";
import { authenticate } from "../middlewares/authenticate.js";

import {
    addInstagram,
} from "../controllers/instagramController.js"

const router = express.Router();

router.use(authenticate);

// connect new platform
router.post("/add",addInstagram);





export default router;