import mongoose from "mongoose";
const { Schema } = mongoose;

/**
 * Sub-schema for each Facebook Page the user has connected.
 * A user can manage multiple pages, and each page has its own
 * access token (needed for posting/automation via the Graph API).
 */
const FacebookPageSchema = new Schema(
  {
    pageId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    accessToken: {
      type: String, // page access token (long-lived, doesn't expire unless revoked)
      required: true,
      select: false, // hide by default in queries, must .select('+pages.accessToken')
    },
    tasks: {
      type: [String], // e.g. ['CREATE_CONTENT', 'MANAGE', 'MODERATE']
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const FacebookUserSchema = new Schema(
  {
    // Reference to the internal User document
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // Core FB identity
    facebookId: {
      type: String,
      required: false,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      // FB email is optional (user can decline permission), so not required
    },
    profilePicture: {
      type: String,
    },

    // OAuth tokens
    accessToken: {
      type: String, // long-lived USER access token
      required: true,
      select: false,
    },
    tokenExpiresAt: {
      type: Date,
    },
    grantedScopes: {
      type: [String], // e.g. ['email', 'pages_show_list', 'pages_manage_posts']
      default: [],
    },

    // Connected Pages for automation
    pages: {
      type: [FacebookPageSchema],
      default: [],
    },

    // App-level account status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
  }
);

const FacebookUserModel = mongoose.model(
  "FacebookUser",
  FacebookUserSchema
);

export default FacebookUserModel;