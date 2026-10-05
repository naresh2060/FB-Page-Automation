import express from 'express';
import Post from '../../../models/Post.js';
import * as postServices from '../../../services/postServices.js';

const router = express.Router();

// @route   POST /api/posts/generate
// @desc    Generate AI content and publish to Facebook
// @access  Protected (handled by middleware in server.js)
router.post('/generate', async (req, res) => {
  try {
    const { topic } = req.body;
    const userId = req.user._id;

    if (!topic) {
      return res.status(400).json({ success: false, error: 'Topic is required' });
    }

    console.log(`[posts api] Request to generate post for topic: ${topic}`);
    const post = await postServices.generateAndPublishPost(userId, topic);

    res.json({
      success: true,
      message: 'Post created and published successfully!',
      post: {
        id: post._id,
        topic: post.topic,
        content: post.content,
        imageUrl: post.imageUrl,
        facebookPostId: post.facebookPostId,
        status: post.status
      }
    });
  } catch (error) {
    console.error("[posts api] Error in /generate:", error);
    return res.status(500).json({
      success: false,
      error: error.message || 'An error occurred during post generation'
    });
  }
});

// @route   GET /api/posts
// @desc    Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await postServices.getAllPosts();
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @route   DELETE /api/posts/:id
router.delete('/:id', async (req, res) => {
  try {
    await postServices.deletePost(req.params.id);
    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


export default router;