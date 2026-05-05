import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import { buildAuthToken } from "@/utils/auth";

const userPreferencesSchema = new mongoose.Schema(
  {
    theme: {
      type: String,
      enum: ["system", "light", "dark"],
      default: "system",
    },
    dashboardLayout: {
      type: String,
      enum: ["featured-skill"],
      default: "featured-skill",
    },
  },
  {
    _id: false,
  },
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      maxLength: [200, "Full name cannot be more than 200 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: validator.isEmail,
        message: "Please provide valid email address",
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    timezone: {
      type: String,
      default: "UTC",
      trim: true,
      maxlength: [100, "Timezone cannot be more than 100 characters"],
    },
    preferences: {
      type: userPreferencesSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  },
);

userSchema.index({ email: 1 }, { unique: true });

userSchema.pre("save", async function hashPasswordBeforeSave(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return buildAuthToken(this);
};

userSchema.methods.toSafeObject = function () {
  return {
    id: this._id.toString(),
    fullName: this.fullName,
    email: this.email,
    verified: this.verified,
    timezone: this.timezone,
    preferences: this.preferences,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
