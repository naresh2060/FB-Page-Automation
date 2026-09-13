import Platform from "../models/Platform.js";
import { encryptToken } from "../services/facebookServices.js";
import {
  getInstagramId,
  getInstagramProfile,
  getInstagramMedia,
} from "../services/instagramService.js";

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
          username: username ,
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
