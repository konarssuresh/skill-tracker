import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.methods.hashPassword = async function () {
  let user = this;
  let passwordHash = await bcrypt.hash(user.password, 10);
  user.password = passwordHash;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  const user = this;
  const isValid = await bcrypt.compare(candidatePassword, user.password);
  return isValid;
};

userSchema.methods.generateAuthToken = function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
  return token;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
