console.log("🔥 facebook.routes.js LOADED");
import express from "express";
import multer from "multer";
import { authenticate } from "../middlewares/authenticate.js";
import {
  publishFacebookPost,
  scheduleFacebookPost,
  deleteFacebookPost,
  getPagePostsList,
  getPageAnalytics,
  getSinglePostAnalytics,
  getAudienceData,
  getComments,
  replyToFacebookComment,
  deleteFacebookComment,
  getInbox,
  getMessages,
  replyToMessage,
  connectFacebookPage,
  addFacebook,
  getFacebookPage,
  getPageList,
} from "../controllers/facebookController.js";

const router = express.Router();

// multer — memory storage for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },  // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// All routes protected
router.use(authenticate);

// router.post("/connect", connectFacebookPage);   // ← add
router.post("/add", addFacebook)
router.get("/getPage", getFacebookPage);


router.get("/pages", getPageList);

router.get("/postlist", getPagePostsList);  //working




// ── Posts ─────────────────────────────────────────────────────
router.get("/posts", getPagePostsList);
router.post("/posts/publish", upload.single("image"), publishFacebookPost);
router.post("/posts/schedule", upload.single("image"), scheduleFacebookPost);
router.delete("/posts/:postId", deleteFacebookPost);

// ── Analytics ─────────────────────────────────────────────────
router.get("/analytics/page", getPageAnalytics);
router.get("/analytics/post/:fbPostId", getSinglePostAnalytics);
router.get("/analytics/audience", getAudienceData);

// ── Comments ──────────────────────────────────────────────────
router.get("/comments/:fbPostId", getComments);
router.post("/comments/:commentId/reply", replyToFacebookComment);
router.delete("/comments/:commentId", deleteFacebookComment);

// ── Inbox / Messages ──────────────────────────────────────────
router.get("/inbox", getInbox);
router.get("/inbox/:conversationId", getMessages);
router.post("/inbox/:conversationId/reply", replyToMessage);

export default router;