import axios from 'axios';
import FormData from 'form-data';

const PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const BASE_URL = `https://graph.facebook.com/v18.0`;
const GRAPH = "https://graph.facebook.com/v19.0";


// ── parse FB error cleanly ───────────────────────────────────────
const parseFbError = (error) => {
  const fb = error.response?.data?.error;
  return {
    code:    fb?.code    || 0,
    type:    fb?.type    || "GraphAPIError",
    message: fb?.message || "Facebook API error",
    subcode: fb?.error_subcode || null,
  };
};
 
// ── 1. Debug token — checks validity, expiry, scopes ─────────────
export const debugToken = async (inputToken) => {
  try {
    const appToken = `${process.env.FB_APP_ID}|${process.env.FB_APP_SECRET}`;
    const { data } = await axios.get(`${GRAPH}/debug_token`, {
      params: { input_token: inputToken, access_token: appToken },
    });
    return data.data;
    // { is_valid, expires_at, scopes, app_id, user_id, issued_at }
  } catch (err) {
    throw parseFbError(err);
  }
};
 
// ── 2. Get all pages token owner manages ─────────────────────────
export const getUserPages = async (accessToken) => {
  try {
    const { data } = await axios.get(`${GRAPH}/me/accounts`, {
      params: {
        access_token: accessToken,
        fields: "id,name,category,tasks,access_token",
        limit: 100,
      },
    });
    return data.data;
    // [ { id, name, category, tasks, access_token } ]
  } catch (err) {
    throw parseFbError(err);
  }
};
 
// ── 3. Get specific page details ──────────────────────────────────
export const getPageDetails = async (pageId, accessToken) => {
  try {
    const { data } = await axios.get(`${GRAPH}/${pageId}`, {
      params: {
        access_token: accessToken,
        fields: "id,name,category,fan_count,picture,verification_status,link",
      },
    });
    return data;
    // { id, name, category, fan_count, picture, verification_status }
  } catch (err) {
    throw parseFbError(err);
  }
};




// ─── Upload Photo (unpublished) ───────────────────────────────────────────────
export const uploadPhoto = async (imageBuffer) => {
    try {
        const formData = new FormData();
        formData.append('source', imageBuffer, {
            filename: 'image.png',
            contentType: 'image/png',
        });
        formData.append('published', 'false');      // store privately, don't post yet
        formData.append('access_token', ACCESS_TOKEN);

        const response = await axios.post(
            `${BASE_URL}/${PAGE_ID}/photos`,
            formData,
            {
                headers: {
                    ...formData.getHeaders()        // sets correct multipart/form-data headers
                }
            }
        );

        const photoId = response.data.id;
        console.log("Photo uploaded to Facebook, photoId:", photoId);
        return photoId;

    } catch (error) {
        console.error('Facebook Photo Upload Error:', error.response?.data || error.message);
        throw new Error('Failed to upload photo to Facebook');
    }
};

// ─── Post to Page (with or without image) ────────────────────────────────────
export const postToPage = async (content, photoId = null) => {
    try {
        const payload = {
            message: content,
        };

        // Only attach image if photoId exists
        if (photoId) {
            payload.attached_media = [{ media_fbid: photoId }];
        }

        const response = await axios.post(
            `${BASE_URL}/${PAGE_ID}/feed`,
            payload,
            {
                params: {
                    access_token: ACCESS_TOKEN
                }
            }
        );

        const facebookPostId = response.data.id;
        console.log("Posted to Facebook, postId:", facebookPostId);
        return facebookPostId;

    } catch (error) {
        console.error('Facebook Post Error:', error.response?.data || error.message);
        throw new Error('Failed to post to Facebook');
    }
};