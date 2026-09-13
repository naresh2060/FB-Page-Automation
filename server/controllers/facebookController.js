import Platform from "../models/Platform.js";
import Post from "../models/Post.js";
import {
  publishPost,
  schedulePost,
  deletePost,
  uploadPhoto,
  getPageInsights,
  getPostInsights,
  getAudienceInsights,
  getUserPages,
  getPagePosts,
  getPostComments,
  replyToComment,
  deleteComment,
  getPageConversations,
  getConversationMessages,
  sendMessage,
  debugToken,
  getPageDetails,
  encryptToken,
  decryptToken,
  uploadPhotoFromUrl,
} from "../services/facebookServices.js";


export const addFacebook = async (req, res) => {
  const { pageId, accessToken } = req.body;
  const userId = req.user._id;

  if (!pageId || !accessToken) {
    return res.status(400).json({
      success: false,
      message: "pageId and accessToken are required"
    });
  }

  try {
    // ── Step 1: Debug token to check validity and scopes ─────
    const debug = await debugToken(accessToken);
    if (!debug.is_valid) {
      return res.status(401).json({ success: false, message: "Invalid access token", code: "TOKEN_INVALID" });
    }

    // ── Step 2: Fetch real page data from Facebook ───────────
    const pageData = await getPageDetails(pageId, accessToken);

    const {
      name,
      category,
      fan_count,
      picture,
      verification_status,
      link,
    } = pageData;

    const pagePicture = picture?.data?.url || null;

    // ── Step 3: Encrypt token ────────────────────────────────
    const encryptedToken = encryptToken(accessToken);

    // ── Step 4: Save to DB ───────────────────────────────────
    const savedPlatform = await Platform.findOneAndUpdate(
      {
        userId,
        platform: "facebook",
      },
      {
        userId,
        platform: "facebook",
        status: "connected",

        accessToken: encryptedToken,
        refreshToken: null,
        tokenExpiresAt: debug.expires_at ? new Date(debug.expires_at * 1000) : null,

        profile: {
          platformUserId: pageId,
          displayName: name,
          picture: pagePicture,
          category: category || null,
          fanCount: fan_count || 0,
          verified: verification_status !== "not_verified",
          link: link || null,
        },

        connectedAt: new Date(),
        lastSyncedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    // ── Step 5: Response (Matching Frontend Expectation) ─────
    return res.status(201).json({
      success: true,
      message: "Facebook page connected successfully",
      page: {
        id: savedPlatform.profile.platformUserId,
        name: savedPlatform.profile.displayName,
        category: savedPlatform.profile.category,
        fanCount: savedPlatform.profile.fanCount,
        picture: savedPlatform.profile.picture,
        verified: savedPlatform.profile.verified,
        link: savedPlatform.profile.link,
      },
      token: {
        scopes: debug.scopes,
        expiresAt: debug.expires_at ? new Date(debug.expires_at * 1000) : null,
        isLongLived: !debug.expires_at,
      },
    });
  } catch (err) {
    console.error("Error in addFacebook:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Facebook is already connected to this account",
      });
    }

    // If it's a parsed FB error from parseFbError
    const statusCode = err.code ? 400 : (err.statusCode || 500);

    return res.status(statusCode).json({
      success: false,
      message: err.message || "Failed to connect Facebook",
      error: {
        message: err.message,
        code: err.code,
        type: err.type
      }
    });
  }
};

// Get Facebook Page data to show in frontend
export const getFacebookPage = async (req, res) => {
  const userId = req.user._id;

  try {
    const platform = await Platform.findOne({
      userId,
      platform: "facebook",
      status: "connected",
    });

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: "No Facebook page connected",
      });
    }

    return res.status(200).json({
      success: true,
      page: {
        id: platform.profile?.platformUserId,
        name: platform.profile?.displayName,
        picture: platform.profile?.picture,
        fanCount: platform.profile?.fanCount || 0,
        category: platform.profile?.category,
        verified: platform.profile?.verified,
        link: platform.profile?.link,
        connectedAt: platform.connectedAt,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to fetch Facebook page",
    });
  }
};

// ── Helper: get the connected Facebook platform for this user ──
const getFbPlatform = async (userId) => {
  const platform = await Platform.findOne({
    userId,
    platform: "facebook",
    status: "connected",
  }).select("+accessToken");

  if (!platform) {
    const err = new Error("Facebook not connected");
    err.statusCode = 403;
    throw err;
  }

  // Decrypt the token before returning
  if (platform.accessToken) {
    try {
      platform.accessToken = decryptToken(platform.accessToken);
    } catch (err) {
      console.error("Token decryption failed:", err);
      // If decryption fails, it might be an unencrypted token or wrong key
      // We'll leave it as is for now, but in production this should be handled
    }
  }

  return platform;
};

// ── Helper: send consistent errors ────────────────────────────
const handleError = (res, err) => {
  console.error("Facebook Controller Error:", err);
  return res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Something went wrong",
  });
};

// ─────────────────────────────────────────────────────────────
// POSTS
// ─────────────────────────────────────────────────────────────

// POST /api/facebook/posts/publish
// controllers/postController.js
export const publishFacebookPost = async (req, res) => {
  const userId = req.user._id;

  // ── Only need postId from frontend ──────────────────────────
  const { postId, isRepost } = req.body;
  // frontend just sends: { "postId": "69e5fb9c..." }
  // all content comes from database


  // ── Step 1: Validate postId ──────────────────────────────────
  if (!postId) {
    return res.status(400).json({
      success: false,
      error: "postId is required",
    });
  }


  try {
    // ── Step 2: Get post from database ───────────────────────
    const post = await Post.findOne({ _id: postId, userId });
    // userId check — user can only publish their own posts

    if (!post) {
      return res.status(404).json({
        success: false,
        error: "Post not found or you do not have permission",
      });
    }

    // check post has content
    if (!post.content) {
      return res.status(400).json({
        success: false,
        error: "Post has no content. Generate content first.",
      });
    }

    // check post is not already published
    if (post.status === "posted" && !isRepost) {
      return res.status(400).json({
        success: false,
        error: "This post has already been published",
        facebookPostId: post.facebookPostId,
      });
    }

    let targetPost = post;
    if (isRepost) {
      targetPost = new Post({
        userId: post.userId,
        platform: post.platform,
        topic: post.topic,
        theme: post.theme,
        content: post.content,
        imageUrl: post.imageUrl,
        imagePrompt: post.imagePrompt,
        status: "pending"
      });
      await targetPost.save();
    }


    // ── Step 3: Get Facebook platform connection ─────────────
    const platform = await getFbPlatform(userId);

    const pageId = platform.profile?.platformUserId;
    const accessToken = platform.accessToken;

    if (!pageId) {
      return res.status(400).json({
        success: false,
        error: "Facebook page ID not found — please reconnect",
      });
    }


    // ── Step 4: Handle image from Cloudinary URL ─────────────
    let photoId = null;

    if (targetPost.imageUrl) {
      // image URL already stored in database from Cloudinary
      // upload it to Facebook from the URL
      photoId = await uploadPhotoFromUrl(
        targetPost.imageUrl,   // Cloudinary URL
        pageId,
        accessToken
      );
    }


    // ── Step 5: Publish to Facebook ──────────────────────────
    const fbPostId = await publishPost({
      pageId,
      accessToken,
      message: targetPost.content,   // ← from database
      photoId,
    });


    // ── Step 6: Update existing post — don't create new one ──
    targetPost.facebookPostId = fbPostId;
    targetPost.status = "posted";
    targetPost.postedAt = new Date();
    targetPost.platform = "facebook";
    await targetPost.save();


    // ── Step 7: Return success ────────────────────────────────
    return res.status(200).json({
      success: true,
      message: isRepost ? "Post reposted to Facebook successfully" : "Post published to Facebook successfully",
      post: {
        id: targetPost._id,
        facebookPostId: fbPostId,
        content: targetPost.content,
        imageUrl: targetPost.imageUrl,
        status: targetPost.status,
        postedAt: targetPost.postedAt,
      },
      isNewPost: isRepost,
      originalPostId: post._id
    });

  } catch (err) {
    if (err.message?.includes("not connected")) {
      return res.status(403).json({
        success: false,
        error: "Facebook not connected. Please connect your page first.",
      });
    }

    if (err.message?.includes("OAuthException")) {
      return res.status(401).json({
        success: false,
        error: "Facebook token expired. Please reconnect your page.",
      });
    }

    handleError(res, err);
  }
};

export const getPageList = async (req, res) => {
  try {
    // Get access token from request (body, query, or headers)
    const accessToken = req.body.accessToken || req.query.accessToken;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Access token is required",
      });
    }

    // Call controller function
    const pages = await getUserPages(accessToken);

    // Send response
    return res.status(200).json({
      success: true,
      count: pages.length,
      pages,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch pages",
    });
  }
};

















// POST /api/facebook/posts/schedule
export const scheduleFacebookPost = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);
    const { message, scheduledAt, imageUrl } = req.body;

    if (!message || !scheduledAt) {
      return res.status(400).json({ success: false, error: "Message and scheduledAt are required" });
    }

    const scheduleDate = new Date(scheduledAt);
    const minTime = new Date(Date.now() + 10 * 60 * 1000);   // min 10 min from now
    const maxTime = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // max 30 days

    if (scheduleDate < minTime || scheduleDate > maxTime) {
      return res.status(400).json({
        success: false,
        error: "Scheduled time must be between 10 minutes and 30 days from now",
      });
    }

    let photoId = null;
    if (req.file) {
      photoId = await uploadPhoto(req.file.buffer, platform.profile.platformUserId, platform.accessToken);
    }

    const fbPostId = await schedulePost({
      pageId: platform.profile.platformUserId,
      accessToken: platform.accessToken,
      message,
      publishTime: scheduleDate,
      photoId,
    });

    const post = await Post.create({
      topic: message.substring(0, 60),
      content: message,
      imageUrl: imageUrl || null,
      facebookPostId: fbPostId,
      status: "pending",
      postedAt: scheduleDate,
    });

    return res.status(201).json({
      success: true,
      message: "Post scheduled on Facebook",
      post: {
        id: post._id,
        facebookPostId: fbPostId,
        content: post.content,
        status: post.status,
        scheduledAt: scheduleDate,
      },
    });
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE /api/facebook/posts/:postId
export const deleteFacebookPost = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    if (!post.facebookPostId) {
      return res.status(400).json({ success: false, error: "This post has no Facebook post ID" });
    }

    await deletePost({
      postId: post.facebookPostId,
      accessToken: platform.accessToken,
    });

    await Post.findByIdAndDelete(req.params.postId);

    return res.status(200).json({
      success: true,
      message: "Post deleted from Facebook and database",
    });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/facebook/posts
export const getPagePostsList = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);
    const limit = parseInt(req.query.limit) || 10;

    const posts = await getPagePosts({
      pageId: platform.profile.platformUserId,
      accessToken: platform.accessToken,
      limit,
    });

    return res.status(200).json({ success: true, posts });
  } catch (err) {
    handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────

// GET /api/facebook/analytics/page
export const getPageAnalytics = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);
    const { since, until } = req.query;

    const insights = await getPageInsights({
      pageId: platform.profile.platformUserId,
      accessToken: platform.accessToken,
      since,
      until,
    });

    // Shape data for frontend consumption
    const shaped = {};
    insights.forEach((metric) => {
      shaped[metric.name] = metric.values;
    });

    return res.status(200).json({
      success: true,
      pageId: platform.profile.platformUserId,
      pageName: platform.profile.displayName,
      insights: shaped,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/facebook/analytics/post/:fbPostId
export const getSinglePostAnalytics = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);

    const insights = await getPostInsights({
      postId: req.params.fbPostId,
      accessToken: platform.accessToken,
    });

    const shaped = {};
    insights.forEach((metric) => {
      shaped[metric.name] = metric.values;
    });

    return res.status(200).json({ success: true, postId: req.params.fbPostId, insights: shaped });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/facebook/analytics/audience
export const getAudienceData = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);

    const insights = await getAudienceInsights({
      pageId: platform.profile.platformUserId,
      accessToken: platform.accessToken,
    });

    const shaped = {};
    insights.forEach((metric) => {
      shaped[metric.name] = metric.values?.[0]?.value || {};
    });

    return res.status(200).json({
      success: true,
      audience: shaped,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────

// GET /api/facebook/comments/:fbPostId
export const getComments = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);
    const limit = parseInt(req.query.limit) || 25;

    const comments = await getPostComments({
      postId: req.params.fbPostId,
      accessToken: platform.accessToken,
      limit,
    });

    return res.status(200).json({ success: true, comments });
  } catch (err) {
    handleError(res, err);
  }
};

// POST /api/facebook/comments/:commentId/reply
export const replyToFacebookComment = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: "Message is required" });
    }

    const result = await replyToComment({
      commentId: req.params.commentId,
      accessToken: platform.accessToken,
      message,
    });

    return res.status(200).json({ success: true, comment: result });
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE /api/facebook/comments/:commentId
export const deleteFacebookComment = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);

    await deleteComment({
      commentId: req.params.commentId,
      accessToken: platform.accessToken,
    });

    return res.status(200).json({ success: true, message: "Comment deleted" });
  } catch (err) {
    handleError(res, err);
  }
};

// ─────────────────────────────────────────────────────────────
// MESSAGES (INBOX)
// ─────────────────────────────────────────────────────────────

// GET /api/facebook/inbox
export const getInbox = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);
    const limit = parseInt(req.query.limit) || 20;

    const conversations = await getPageConversations({
      pageId: platform.profile.platformUserId,
      accessToken: platform.accessToken,
      limit,
    });

    return res.status(200).json({ success: true, conversations });
  } catch (err) {
    handleError(res, err);
  }
};

// GET /api/facebook/inbox/:conversationId
export const getMessages = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);
    const limit = parseInt(req.query.limit) || 20;

    const messages = await getConversationMessages({
      conversationId: req.params.conversationId,
      accessToken: platform.accessToken,
      limit,
    });

    return res.status(200).json({ success: true, messages });
  } catch (err) {
    handleError(res, err);
  }
};

// POST /api/facebook/inbox/:conversationId/reply
export const replyToMessage = async (req, res) => {
  try {
    const platform = await getFbPlatform(req.user._id);
    const { message, recipientId } = req.body;

    if (!message || !recipientId) {
      return res.status(400).json({ success: false, error: "message and recipientId are required" });
    }

    const result = await sendMessage({
      pageId: platform.profile.platformUserId,
      accessToken: platform.accessToken,
      recipientId,
      message,
    });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    handleError(res, err);
  }
};

// POST /api/facebook/connect
export const connectFacebookPage = async (req, res) => {
  try {
    const { pageId, accessToken } = req.body;

    if (!pageId || !accessToken) {
      return res.status(400).json({ success: false, error: "pageId and accessToken are required" });
    }

    // 1. Debug token to check validity and scopes
    const debug = await debugToken(accessToken);
    if (!debug.is_valid) {
      return res.status(401).json({ success: false, error: "Invalid access token", code: "TOKEN_INVALID" });
    }

    // 2. Check for required scopes
    const requiredScopes = ["pages_show_list", "pages_read_engagement", "pages_manage_posts", "pages_manage_metadata"];
    const missingScopes = requiredScopes.filter(s => !debug.scopes.includes(s));

    if (missingScopes.length > 0) {
      return res.status(403).json({
        success: false,
        error: "Missing required permissions",
        code: "MISSING_PERMISSIONS",
        missingScopes
      });
    }

    // 3. Get Page Details
    const page = await getPageDetails(pageId, accessToken);
    if (!page || !page.id) {
      return res.status(404).json({ success: false, error: "Could not find Facebook page", code: "PAGE_NOT_FOUND" });
    }

    // 4. Upsert Platform record
    const platformData = {
      userId: req.user._id,
      platform: "facebook",
      status: "connected",
      accessToken,
      tokenExpiresAt: debug.expires_at ? new Date(debug.expires_at * 1000) : null,
      profile: {
        platformUserId: page.id,
        displayName: page.name,
        category: page.category,
        picture: page.picture?.data?.url,
        fanCount: page.fan_count,
        verified: page.verification_status !== "not_verified",
        link: page.link
      },
      lastSyncedAt: new Date()
    };

    await Platform.findOneAndUpdate(
      { userId: req.user._id, platform: "facebook" },
      platformData,
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Facebook page connected successfully",
      page: {
        id: page.id,
        name: page.name,
        category: page.category,
        fanCount: page.fan_count,
        picture: page.picture?.data?.url,
        verified: page.verification_status !== "not_verified",
        link: page.link
      },
      token: {
        scopes: debug.scopes,
        expiresAt: debug.expires_at ? new Date(debug.expires_at * 1000) : null,
        isLongLived: !debug.expires_at // typically true for long-lived page tokens
      }
    });

  } catch (err) {
    handleError(res, err);
  }
};
