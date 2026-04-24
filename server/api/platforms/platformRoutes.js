import express from "express";
import { checkFacebookConnection } from "../../controllers/platformController.js";
import { authenticate } from "../../middlewares/authenticate.js";

const router = express.Router();

// POST /api/platforms/check-fb-connection
// protected — user must be logged in
router.post("/check-fb-connection", authenticate, checkFacebookConnection);

export default router;