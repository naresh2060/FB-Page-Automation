import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
      required: [true, "Email is required"],
      unique: true,                      // no two users same email
      lowercase: true,                   // saves as lowercase always
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,               // basic email format check
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,                     // never returned in queries by default
    },
    avatar: {
      type: String,
      default: null,                     // null until user uploads one
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"], // only these 3 values allowed
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
      default: null,                     // set when forgot password requested
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,                     // token expiry time
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    isActive: {
      type: Boolean,
      default: true
    },
  }, { timestamps: true });


// checks if entered password matches the hashed one in database
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    avatar: this.avatar,
    plan: this.plan,
    timezone: this.timezone,
    isEmailVerified: this.isEmailVerified,
    createdAt: this.createdAt,
  };
  // notice: password is NOT included
};

//hash password before storing 
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
  // next();
});

const User = mongoose.model("User", userSchema);

export default User;
