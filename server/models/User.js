import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

/**
 * Sub-schema for each Facebook Page the user has connected.
 * A user can manage multiple pages, each with its own access token
 * (needed for posting/automation via the Graph API).
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
        profilePicture: {
      type: String,
      default: null,
    },

    accessToken: {
      type: String, // page access token (long-lived, doesn't expire unless revoked)
      required: true,
      select: false, // hidden by default; use .select('+facebook.pages.accessToken')
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

/**
 * Sub-schema holding all Facebook-specific data for a user.
 * Nested under the main User doc instead of a separate collection,
 * so one user = one document, however they signed up or whatever
 * they've connected.
 */
const FacebookAccountSchema = new Schema(
  {
    facebookId: {
      type: String,
      unique: true,
      sparse: true, // only enforces uniqueness among docs that HAVE a facebookId
      index: true,
    },
    accessToken: {
      type: String, // long-lived USER access token
      select: false,
    },
    tokenExpiresAt: {
      type: Date,
    },
    grantedScopes: {
      type: [String], // e.g. ['email', 'pages_show_list', 'pages_manage_posts']
      default: [],
    },
    pages: {
      type: [FacebookPageSchema],
      default: [],
    },
    connectedAt: {
      type: Date,
      default: Date.now,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: function () {
        return this.provider === "local";
      },
      unique: true,
      sparse: true, // allows multiple docs with no email without violating uniqueness
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === "local"; // only required for local signups
      },
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },

    // --- OAuth / provider fields ---
    provider: {
      type: String,
      enum: ["local", "facebook", "google"],
      default: "local",
    },
    facebookId: {
      type: String,
      unique: true,
      sparse: true, // only enforces uniqueness among docs that HAVE a facebookId
      default: null,
    },

    // All Facebook-specific data lives here now, instead of a separate model
    facebook: {
      type: FacebookAccountSchema,
      default: undefined, // stays absent entirely for non-Facebook users
    },
    // ---------------------

    avatar: {
      type: String,
      default: null,
    },
    profilePicture: {
      type: String, // kept separate from `avatar` if you want FB's photo distinct from an uploaded one
      default: null,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// checks if entered password matches the hashed one in database
userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false; // OAuth users have no password to compare
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    profilePicture: this.profilePicture,
    plan: this.plan,
    timezone: this.timezone,
    isEmailVerified: this.isEmailVerified,
    provider: this.provider,
    facebookConnected: !!this.facebook?.facebookId,
    connectedPages: this.facebook?.pages?.map(p => ({
      pageId: p.pageId,
      name: p.name,
      category: p.category,
      isActive: p.isActive,
    })) || [],
    createdAt: this.createdAt,
  };
  // note: no access tokens are ever included here
};

// hash password before storing (only runs if password exists and changed)
userSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);

export default User;