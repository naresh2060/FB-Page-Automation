import { getAllPosts, generatePostContentAndImagePrompt } from '../services/postServices.js';
import { generateImage } from '../services/huggingfaceService.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import Post from '../models/Post.js';

// GET /api/posts
export const getUserPosts = async (req, res) => {
  const userId = req.user._id;

  const {
    status,
    platform,
    page  = 1,
    limit = 10,
  } = req.query;

  try {
    const result = await getAllPosts({
    //             ↑ now calls the service, no conflict
      userId,
      status,
      platform,
      page:  Number(page),
      limit: Number(limit),
    });

    return res.status(200).json({
      success:    true,
      posts:      result.posts,
      pagination: result.pagination,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch posts",
    });
  }
};

export const generatePostContent = async (req, res) => {
  const userId = req.user._id;
  const { topic, theme } = req.body;

  try {
    const post = await generatePostContentAndImagePrompt(userId, topic, theme);
    return res.status(200).json({
      success: true,
      post,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate post",
    });
  }
};

// server/src/controllers/postController.js
export const generateImageForPost = async (req, res) => {
  const { postId, imagePrompt } = req.body;
  const userId = req.user._id;

  if (!imagePrompt) {
    return res.status(400).json({
      success: false,
      message: "Image prompt is required",
    });
  }

  try {
    // 1. generate image with HuggingFace
    const image = await generateImage(imagePrompt);

    // 2. upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(image.buffer);

    // 3. update post with image URL if postId given
    if (postId) {
      await Post.findOneAndUpdate(
        { _id: postId, userId },
        { imageUrl: cloudinaryResult.secure_url }
      );
    }

    // 4. return URL to frontend
    return res.status(200).json({
      success:  true,
      imageUrl: cloudinaryResult.secure_url,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate image",
    });
  }
};

export const deleteUserPost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  try {
    const post = await Post.findOneAndDelete({ _id: id, userId });
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Failed to delete post" });
  }
};
