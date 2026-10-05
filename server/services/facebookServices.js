import axios from "axios";
import FormData from "form-data";
import crypto from "crypto";
import FacebookUser from "../models/FacebookUser.model.js";
import User from "../models/User.js";
// import FacebookUserModel from "../models/FacebookUser.model.js"; // removed duplicate

const GRAPH = "https://graph.facebook.com/v19.0";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_LENGTH = 16; // AES block size
// ── Parse FB error cleanly ───────────────────────────────────
const parseFbError = (error) => {
  const fb = error.response?.data?.error;
  return {
    code: fb?.code || 0,
    type: fb?.type || "GraphAPIError",
    message: fb?.message || "Facebook API error",
    subcode: fb?.error_subcode || null,
  };
};

// ─────────────────────────────────────────────────────────────
// TOKEN & PAGE VALIDATION
// ─────────────────────────────────────────────────────────────

// 1. Debug token — checks validity, expiry, scopes
export const debugToken = async (inputToken) => {
  const appId = process.env.FB_APP_ID;
  const appSecret = process.env.FB_APP_SECRET;

  if (!appId || !appSecret) {
    console.warn(
      "Facebook App ID or Secret missing. Skipping debugToken validation.",
    );
    return { is_valid: true, scopes: [], expires_at: null }; // Assume valid if we can't check
  }

  try {
    const appToken = `${appId}|${appSecret}`;
    const { data } = await axios.get(`${GRAPH}/debug_token`, {
      params: { input_token: inputToken, access_token: appToken },
    });
    return data.data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// ── Encrypt ─────────────────────────────
export const encryptToken = (token) => {
  // If ENCRYPTION_KEY is not set, store token as‑is (no encryption)
  if (!ENCRYPTION_KEY) {
    console.warn(
      "ENCRYPTION_KEY not set – storing Facebook token in plain text",
    );
    return token;
  }
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv,
  );

  let encrypted = cipher.update(token, "utf8", "hex");
  encrypted += cipher.final("hex");

  // store iv + encrypted together
  return `${iv.toString("hex")}:${encrypted}`;
};

// ── Decrypt ─────────────────────────────
export const decryptToken = (encryptedToken) => {
  // If ENCRYPTION_KEY is missing, assume token was stored plain‑text
  if (!ENCRYPTION_KEY) {
    console.warn(
      "ENCRYPTION_KEY not set – assuming Facebook token is stored plain text",
    );
    return encryptedToken;
  }
  const [ivHex, encrypted] = encryptedToken.split(":");

  const iv = Buffer.from(ivHex, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(ENCRYPTION_KEY, "hex"),
    iv,
  );

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

// 2. Get all pages the token owner manages
export const getUserPages = async (accessToken) => {
  try {
    const { data } = await axios.get(`${GRAPH}/me/accounts`, {
      params: {
        access_token: accessToken,
        fields: "id,name,category,tasks,access_token,picture{url}",

      },
    });
    return data.data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// 3. Get specific page details
export const getPageDetails = async (pageId, accessToken) => {
  try {
    const { data } = await axios.get(`${GRAPH}/${pageId}`, {
      params: {
        access_token: accessToken,
        fields: "id,name,category,fan_count,picture,verification_status,link",
      },
    });

    return data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// ─────────────────────────────────────────────────────────────
// PUBLISHING
// ─────────────────────────────────────────────────────────────

// 4. Upload photo as unpublished (returns photoId)
export const uploadPhoto = async (imageBuffer, pageId, accessToken) => {
  try {
    const formData = new FormData();
    formData.append("source", imageBuffer, {
      filename: "image.png",
      contentType: "image/png",
    });
    formData.append("published", "false");
    formData.append("access_token", accessToken);

    const { data } = await axios.post(`${GRAPH}/${pageId}/photos`, formData, {
      headers: formData.getHeaders(),
    });

    return data.id;
  } catch (err) {
    throw parseFbError(err);
  }
};

// 5. Publish a post (text only or text + image)
export const publishPost = async ({
  pageId,
  accessToken,
  message,
  photoId = null,
}) => {
  try {
    const payload = { message };
    if (photoId) payload.attached_media = [{ media_fbid: photoId }];

    const { data } = await axios.post(`${GRAPH}/${pageId}/feed`, payload, {
      params: { access_token: accessToken },
    });

    return data.id; // facebook post id e.g. "123456_789"
  } catch (err) {
    throw parseFbError(err);
  }
};

// services/platforms/facebookService.js

// ── Upload image to Facebook from a URL ───────────────────────────
// used when image is already on Cloudinary
export const uploadPhotoFromUrl = async (imageUrl, pageId, accessToken) => {
  const { data } = await axios.post(`${GRAPH}/${pageId}/photos`, {
    url: imageUrl, // Cloudinary URL — Facebook fetches it directly
    published: false, // don't publish yet — just upload
    access_token: accessToken,
  });

  return data.id;
  // returns photoId to attach to the post
};

// 6. Schedule a post (published_time must be 10min–30days in future)
export const schedulePost = async ({
  pageId,
  accessToken,
  message,
  publishTime,
  photoId = null,
}) => {
  try {
    const payload = {
      message,
      published: false,
      scheduled_publish_time: Math.floor(
        new Date(publishTime).getTime() / 1000,
      ),
    };
    if (photoId) payload.attached_media = [{ media_fbid: photoId }];

    const { data } = await axios.post(`${GRAPH}/${pageId}/feed`, payload, {
      params: { access_token: accessToken },
    });

    return data.id;
  } catch (err) {
    throw parseFbError(err);
  }
};

// 7. Delete a post
export const deletePost = async ({ postId, accessToken }) => {
  try {
    const { data } = await axios.delete(`${GRAPH}/${postId}`, {
      params: { access_token: accessToken },
    });
    return data; // { success: true }
  } catch (err) {
    throw parseFbError(err);
  }
};

// ─────────────────────────────────────────────────────────────
// ANALYTICS & INSIGHTS
// ─────────────────────────────────────────────────────────────

// 8. Page-level insights (reach, impressions, engagement, followers)
export const getPageInsights = async ({
  pageId,
  accessToken,
  since,
  until,
}) => {
  try {
    const metrics = [
      "page_impressions",
      "page_impressions_unique", // reach
      "page_engaged_users",
      "page_post_engagements",
      "page_fan_adds_unique", // new followers
      "page_fan_removes_unique", // unfollows
      "page_views_total",
    ].join(",");

    const params = {
      access_token: accessToken,
      metric: metrics,
      period: "day",
    };
    if (since) params.since = Math.floor(new Date(since).getTime() / 1000);
    if (until) params.until = Math.floor(new Date(until).getTime() / 1000);

    const { data } = await axios.get(`${GRAPH}/${pageId}/insights`, { params });
    return data.data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// 9. Single post insights (reach, impressions, reactions, clicks)
export const getPostInsights = async ({ postId, accessToken }) => {
  try {
    const metrics = [
      "post_impressions",
      "post_impressions_unique", // reach
      // "post_engaged_users",
      // "post_reactions_by_type_total",
      "post_clicks",
    ].join(",");

    const { data } = await axios.get(`${GRAPH}/${postId}/insights`, {
      params: { access_token: accessToken, metric: metrics },
    });
    return data.data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// 10. Audience demographics (age/gender, country, city)
export const getAudienceInsights = async ({ pageId, accessToken }) => {
  try {
    const metrics = [
      "page_fans_gender_age",
      "page_fans_country",
      "page_fans_city",
      "page_fans_locale",
    ].join(",");

    const { data } = await axios.get(`${GRAPH}/${pageId}/insights`, {
      params: {
        access_token: accessToken,
        metric: metrics,
        period: "lifetime",
      },
    });
    return data.data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// 11. Get recent posts from the page
export const getPagePosts = async ({ pageId, accessToken, limit = 10 }) => {
  try {
    const { data } = await axios.get(`${GRAPH}/${pageId}/feed`, {
      params: {
        access_token: accessToken,
        fields:
          "id,message,story,created_time,permalink_url,full_picture,likes.summary(true),comments.summary(true),shares",
        limit,
      },
    });
    return data.data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// ─────────────────────────────────────────────────────────────
// COMMENTS
// ─────────────────────────────────────────────────────────────

// 12. Get comments on a post
export const getPostComments = async ({ postId, accessToken, limit = 25 }) => {
  try {
    const { data } = await axios.get(`${GRAPH}/${postId}/comments`, {
      params: {
        access_token: accessToken,
        fields: "id,message,from,created_time,like_count,comment_count",
        limit,
      },
    });
    return data.data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// 13. Reply to a comment
export const replyToComment = async ({ commentId, accessToken, message }) => {
  try {
    const { data } = await axios.post(
      `${GRAPH}/${commentId}/comments`,
      { message },
      { params: { access_token: accessToken } },
    );
    return data; // { id: "comment_id" }
  } catch (err) {
    throw parseFbError(err);
  }
};

// 14. Delete a comment
export const deleteComment = async ({ commentId, accessToken }) => {
  try {
    const { data } = await axios.delete(`${GRAPH}/${commentId}`, {
      params: { access_token: accessToken },
    });
    return data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// ─────────────────────────────────────────────────────────────
// MESSAGES (PAGE INBOX)
// ─────────────────────────────────────────────────────────────

// 15. Get page conversations (inbox)
export const getPageConversations = async ({
  pageId,
  accessToken,
  limit = 20,
}) => {
  try {
    const { data } = await axios.get(`${GRAPH}/${pageId}/conversations`, {
      params: {
        access_token: accessToken,
        fields:
          "id,snippet,updated_time,message_count,unread_count,participants",
        limit,
      },
    });
    return data.data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// 16. Get messages inside a conversation
export const getConversationMessages = async ({
  conversationId,
  accessToken,
  limit = 20,
}) => {
  try {
    const { data } = await axios.get(`${GRAPH}/${conversationId}/messages`, {
      params: {
        access_token: accessToken,
        fields: "id,message,from,created_time,attachments",
        limit,
      },
    });
    return data.data;
  } catch (err) {
    throw parseFbError(err);
  }
};

// 17. Send a message (reply to a conversation)
export const sendMessage = async ({
  pageId,
  accessToken,
  recipientId,
  message,
}) => {
  try {
    const { data } = await axios.post(
      `${GRAPH}/${pageId}/messages`,
      {
        recipient: { id: recipientId },
        message: { text: message },
        messaging_type: "RESPONSE",
      },
      { params: { access_token: accessToken } },
    );
    return data;
  } catch (err) {
    throw parseFbError(err);
  }
};

//  Login With Facebook Page

const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI;



// console.log('Facebook OAuth Config:', { APP_ID, APP_SECRET, REDIRECT_URI });

export const handleFacebookCallbackService = async ({ code, state }) => {
  console.log("Callback Services")
  if (!code) throw new Error("Missing code");

  // 1. Exchange code → short token
  const tokenRes = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        client_id: APP_ID,
        client_secret: APP_SECRET,
        redirect_uri: REDIRECT_URI,
        code,
      },
    }
  );

  const shortToken = tokenRes.data.access_token;

  // 2. Exchange → long-lived user token
  const longRes = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        grant_type: "fb_exchange_token",
        client_id: APP_ID,
        client_secret: APP_SECRET,
        fb_exchange_token: shortToken,
      },
    }
  );

  const longUserToken = longRes.data.access_token;

  // 3. Get the FB profile itself — this was missing before, which is why
  // `fbUser` was undefined. Needed for facebookId/name/email/picture.
  const meRes = await axios.get("https://graph.facebook.com/v19.0/me", {
    params: {
      fields: "id,name,email,picture",
      access_token: longUserToken,
    },
  });

  const fbUser = meRes.data;

  // 4. Get pages
  const pagesRes = await axios.get(
    "https://graph.facebook.com/v19.0/me/accounts",
    {
      params: {
        access_token: longUserToken,
      },
    }
  );

  const pages = pagesRes.data.data;

  // 5. Get IG + category + structure data to match FacebookPageSchema
  const pagesWithIG = await Promise.all(
    pages.map(async (page) => {
      const igRes = await axios.get(
        `https://graph.facebook.com/v19.0/${page.id}`,
        {
          params: {
            fields: "instagram_business_account,category",
            access_token: page.access_token,
          },
        }
      );

      return {
        pageId: page.id,
        pageName: page.name,
        pageToken: page.access_token,
        category: igRes.data.category || null,
        instagramId: igRes.data.instagram_business_account?.id || null,
      };
    })
  );

  // 6. Save to DB — one FacebookUser doc per app user (`state`)
  const savedFacebookUser = await FacebookUser.findOneAndUpdate(
    { user: state }, // correct primary key — links to the app's User

    {
      $set: {
        user: state,
        facebookId: fbUser.id,
        name: fbUser.name,
        email: fbUser.email || null,
        profilePicture: fbUser.picture?.data?.url || null,

        accessToken: longUserToken, // matches schema field name

        grantedScopes: [],

        pages: pagesWithIG.map((page) => ({
          pageId: page.pageId,
          name: page.pageName,           // schema field is "name", not "pageName"
          category: page.category,
          accessToken: page.pageToken,   // schema field is "accessToken", not "pageAccessToken"
          instagramId: page.instagramId,
          tasks: [],
          isActive: true,
          connectedAt: new Date(),
        })),

        lastLoginAt: new Date(),
        isActive: true,
      },
    },

    {
      new: true,
      upsert: true,
    }
  );

  return savedFacebookUser;
};

export const exchangeCodeForLongLivedToken = async (code) => {
  // 1. Exchange code → short-lived user token
  const { data: shortData } = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
        code,
      },
    }
  );

  const shortToken = shortData.access_token;

  // 2. Exchange short → long-lived user token
  const { data: longData } = await axios.get(
    "https://graph.facebook.com/v19.0/oauth/access_token",
    {
      params: {
        grant_type: "fb_exchange_token",
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        fb_exchange_token: shortToken,
      },
    }
  );

  console.log("Long-lived token response:", longData); // temp debug — check expires_in is present

  const expiresInSeconds = Number(longData.expires_in);

  const tokenExpiresAt = Number.isFinite(expiresInSeconds)
    ? new Date(Date.now() + expiresInSeconds * 1000)
    : undefined; // leave unset rather than writing an invalid date

  return {
    accessToken: longData.access_token,
    tokenExpiresAt,
  };
};


// Fetch Facebook Profile
export const fetchFacebookProfile = async (accessToken) => {
  const { data } = await axios.get("https://graph.facebook.com/me", {
    params: {
      fields: "id,name,email,picture",
      access_token: accessToken,
    },
  });

  console.log("Facebook Profile Fetched");
  return data;
};

//Fetch FB Page Profile Pic
export const getPageProfilePic = async (pageId, accessToken) => {
  const { data } = await axios.get(
    `https://graph.facebook.com/v25.0/${pageId}/picture`,
    {
      params: {
        redirect: false,
        type: "large",
        access_token: accessToken,
      },
    }
  );

  return data.data.url;
}