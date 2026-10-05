import Platform from "../models/Platform.js";
import { decryptToken, encryptToken } from "../services/facebookServices.js";
import {
  getInstagramId,
  getInstagramProfile,
  getInstagramMedia,
  createInstagramMedia,
  publishInstagramMedia,
} from "../services/instagramService.js";


//Add Instagram 
export const addInstagram = async (req, res) => {
  try {
    const { pageId, accessToken } = req.body;
    const userId = req.user.id;

    if (!pageId || !accessToken) {
      return res.status(400).json({
        success: false,
        message: "Page Id and Access Token are required",
      });
    }

    const data = await getInstagramId(pageId, accessToken);

    const instagramId = data?.instagram_business_account?.id || null;

    if (!instagramId) {
      return res.status(404).json({
        success: false,
        message: "Instagram account not linked to this Page",
      });
    }

    //fetch real data from instagram
    const response = await getInstagramProfile(instagramId, accessToken);
    const responseData = response?.data?.data || response?.data;
    if (!responseData) {
      throw new Error("Invalid Instagram API response");
    }
    const { id, username, media_count } = responseData[0];

    //Encrypt Token
    const encryptedToken = encryptToken(accessToken);

    const savedPlatform = await Platform.findOneAndUpdate(
      {
        userId,
        platform: "instagram",
      },
      {
        userId,
        platform: "instagram",
        status: "connected",

        instagramId,

        accessToken: encryptedToken,

        refreshToken: null,
        tokenExpiresAt: null,

        profile: {
          platformUserId: instagramId || id,
          username: username,
          displayName: username,
          mediaCount: media_count,
        },

        connectedAt: new Date(),
        lastSyncedAt: new Date(),
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Instagram account connected successfully",
      data: {
        pageId,
        instagramId,
        savedPlatform,
      },
    });
  } catch (error) {
    console.error("addInstagram error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const getInstagramPosts = async (req, res) => {
  const userId = req.user._id;

  try {

    const platform = await Platform.findOne({
      userId,
      platform: "instagram",
      status: "connected",
    }).select("+accessToken");

    if (!platform) {
      return res.status(404).json({
        success: false,
        message: "No Instagram profile connected"
      });
    }

    if (platform.accessToken) {
      try {
        platform.accessToken = decryptToken(platform.accessToken);
      } catch (err) {
        console.error("Token decryption failed: ", err);
      }
    }


    const instagramId = platform.profile.platformUserId;
    const accessToken = platform.accessToken;


    if (!instagramId) {
      return res.status(404).json({
        success: false,
        message: "Instagram account not linked to this Page",
      });
    }

    const response = await getInstagramMedia(instagramId, accessToken);

    const responseData = response?.data?.data || response?.data;
    if (!responseData) {
      throw new Error("Invalid API response");
    }

    return res.status(200).json({
      success: true,
      message: "Instagram media Fetched",
      data: responseData

    })

  } catch (error) {
    console.error("addInstagram error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

export const publishInstagramPost = async (req, res) => {
  console.log("Publish ig post");
  try {
    const userId = req.user.id;
    const { caption, imageUrl } = req.body;

    const platform = await Platform.findOne({
      userId,
      platform: "instagram",
      status: "connected",
    }).select("+accessToken");

    if (!platform) {
      return res.status(400).json({
        success: false,
        message: "Instagram not connected",
      });
    }

    const accessToken = decryptToken(platform.accessToken);
    const igId = platform.profile.platformUserId;

    //Create media container
    const media = await createInstagramMedia(igId, caption, imageUrl, accessToken);

    // console.log(media);
    if (!media.id) {
      throw new Error("Failed to create media container");
    }

    // Publish media
    const published = await publishInstagramMedia(igId, media.id, accessToken);

    return res.status(200).json({
      success: true,
      message: "Post published successfully",
      postId: published.id,
    });
  } catch (error) {
    console.error("publishInstagramPost error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}