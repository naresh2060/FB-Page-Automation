import Post from '../models/Post.js';
import Platform from '../models/Platform.js';
import { generatePostAndPrompt } from './geminiService.js';
import { generateImage } from './huggingfaceService.js';
import { uploadToCloudinary } from './cloudinaryService.js';
import { uploadPhoto, publishPost, decryptToken } from './facebookServices.js';

/**
 * Get all posts with optional pagination/filtering
 */
export const getAllPosts = async ({ userId, status, platform, page = 1, limit = 10 }) => {
  const filter = {};
  if (userId) filter.userId = userId;
  if (status) filter.status = status;
  if (platform) filter.platform = platform;

  const skip = (Math.max(1, page) - 1) * limit;
  
  const posts = await Post.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments(filter);

  return {
    posts,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get a single post by ID
 */
export const getPostById = async (id) => {
  return await Post.findById(id);
};

/**
 * Helper to get decrypted Facebook platform for a user
 */
const getDecryptedPlatform = async (userId) => {
  const platform = await Platform.findOne({
    userId,
    platform: "facebook",
    status: "connected",
  }).select("+accessToken");

  if (!platform) {
    throw new Error("Facebook not connected. Please connect your Facebook page first.");
  }

  if (platform.accessToken) {
    try {
      platform.accessToken = decryptToken(platform.accessToken);
    } catch (err) {
      console.error("Token decryption failed in postServices:", err);
      // Fallback: use raw token if decryption fails (might be unencrypted)
    }
  }

  return platform;
};



export const generatePostContentAndImagePrompt = async (userId, topic, theme = null) => {

  // create post immediately — track progress from the start
  let post = new Post({
    userId,
    topic,
    theme,
    status:   "pending",
    platform: "facebook",
  });
  // await post.save();
  // save before anything else — if AI call fails
  // we still have a record of the attempt

  try {
    // 1. Generate content + image prompt using Gemini
    console.log(`[postService] Generating content for: "${topic}" ${theme ? `with theme: ${theme}` : ''}`);
    const { content, imagePrompt } = await generatePostAndPrompt(topic, theme);

    // 2. Save generated content to post
    post.content     = content;
    post.imagePrompt = imagePrompt;
    post.status      = "draft";
    await post.save();

    // 3. Return so controller can use this data
    return post;
    // returns {
    //   _id, userId, topic,
    //   content: "AI generated text...",
    //   imagePrompt: "a professional photo of...",
    //   status: "content_generated"
    // }

  } catch (err) {
    // if anything fails — do NOT save to database
    console.error(`[postService] Failed to generate content:`, err.message);

    // re-throw so controller knows it failed
    throw err;
  }
};



/**
 * Delete a post from DB
 */
export const deletePost = async (id) => {
  return await Post.findByIdAndDelete(id);
};

/**
 * Update post status manually
 */
export const updatePostStatus = async (id, status, error = null) => {
  const update = { status };
  if (error) update.error = error;
  return await Post.findByIdAndUpdate(id, update, { new: true });
};
