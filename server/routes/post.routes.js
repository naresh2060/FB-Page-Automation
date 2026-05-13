import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { getUserPosts, generatePostContent, generateImageForPost, deleteUserPost, updateUserPost, createUserPost } from '../controllers/postController.js';
import { publishFacebookPost } from '../controllers/facebookController.js';
const router = express.Router();
router.use(authenticate);

// GET /api/posts
// called when Dashboard or Drafts page loads
// query params: ?status=draft&platform=facebook&page=1&limit=10
router.get("/", getUserPosts);
router.post("/", createUserPost);
router.post("/generate", generatePostContent);
router.post("/generate-image", generateImageForPost);

router.post("/publish/facebook", publishFacebookPost)
router.put("/:id", updateUserPost);
router.delete("/:id", deleteUserPost);

export default router;