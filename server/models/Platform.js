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
      required: false,
      select: false,
    },

    tokenExpiresAt: {
      type: Date,
      required: false,
    },

    profile: {
      platformUserId: { type: String },
      username:       { type: String },
      displayName:    { type: String },
      profileImage:   { type: String },
      picture:        { type: String }, // support both
      category:       { type: String },
      fanCount:       { type: Number, default: 0 },
      followersCount: { type: Number, default: 0 },
      verified:       { type: Boolean, default: false },
      link:           { type: String },
    },

    lastSyncedAt: {
      type: Date,
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