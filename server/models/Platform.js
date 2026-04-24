import mongoose  from "mongoose";
const platformSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    platform: {
      type: String,
      enum: ["instagram", "facebook", "linkedin", "twitter"],
      required: true,
    },

    status: {
      type: String,
      enum: ["connected", "disconnected", "expired"],
      default: "connected",
    },

    accessToken: {
      type: String,
      required: true,
      select: false, // hide from queries by default
    },

    refreshToken: {
      type: String,
      required: true,
      select: false,
    },

    tokenExpiresAt: {
      type: Date,
      required: true,
    },

    profile: {
      platformUserId: { type: String },
      username: { type: String },
      displayName: { type: String },
      profileImage: { type: String },
      followersCount: { type: Number, default: 0 },
      followingCount: { type: Number, default: 0 },
    },

    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Platform = mongoose.model("Platform", platformSchema);

export default Platform;