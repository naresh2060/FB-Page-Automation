import { graphClient } from "../utils/axiosClient.js";

// GET instagram id
export const getInstagramId = async (pageId, pageToken) => {
  try {
    const res = await graphClient.get(`/${pageId}`, {
      params: {
        fields: "instagram_business_account",
        access_token: pageToken,
      },
    });

    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || "Instagram ID fetch error");
  }
};

// Get Instagram Profile
export const getInstagramProfile = async (igId, pageToken) => {
  try {
    const res = await graphClient.get(`/${igId}/media`, {
      params: {
        fields: "id,username,media_count",
        access_token: pageToken,
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || "Instagram profile fetch error");
  }
};

// Get all posts from Instagram Account
export const getInstagramMedia = async (igId, pageToken) => {
  try {
    const res = await graphClient.get(`/${igId}/media`, {
      params: {
        fields: "id,caption,media_url,media_type,thumbnail_url,permalink,timestamp",
        access_token: pageToken,
      },
    });
    return res.data;
  } catch (error) {
    throw new Error(error.response?.data?.error?.message || "Instagram media fetch error");
  }
}

// Create media container
export const createInstagramMedia = async (igId, caption, imageUrl, accessToken) => {
  try {
    const res = await graphClient.post(
      `/${igId}/media`,
      null,
      {
        params: {
          caption,
          image_url: imageUrl,
          access_token: accessToken,
        }
      }
    );

    return res.data; // { id: creation_id }
  } catch (error) {
    throw new Error(
      error.response?.data?.error?.message || "Create media failed"
    );
  }
};

//Publish media
export const publishInstagramMedia = async (igId, creationId, accessToken) => {

  try {
    const res = await graphClient.post(
      `/${igId}/media_publish`,
      null,
      {
        params: {
          creation_id: creationId,
          access_token: accessToken,
        }
      }
    );

    return res.data; // { id: post_id }
  } catch (error) {
    console.log("PUBLISH ERROR:", error.response?.data);

    throw new Error(
      error.response?.data?.error?.message || "Publish media failed"
    );
  }
};