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

// Get all posts from Instafram Account
export const getInstagramMedia = async (igId, pageToken)=>{
    try {
        const res = await graphClient.get(`/${igId}/media`,{
            params: {
                fields: "id,caption,media_url,timestamp",
                access_token: pageToken,
            },
        });
        return res.data;
    } catch (error) {
    throw new Error(error.response?.data?.error?.message || "Instagram media fetch error");
    }
}