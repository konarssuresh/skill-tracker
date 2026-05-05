import mongoose from "mongoose";

const SESSION_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: [true, "Skill is required"],
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be at least 1 minute"],
      max: [1440, "Duration cannot be more than 24 hours"],
    },
    sessionDate: {
      type: String,
      required: [true, "Session date is required"],
      validate: {
        validator: (value) => SESSION_DATE_REGEX.test(value),
        message: "Session date must use YYYY-MM-DD format",
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [4000, "Notes cannot be more than 4000 characters"],
      default: "",
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  },
);

sessionSchema.index({ userId: 1, sessionDate: -1, createdAt: -1 });
sessionSchema.index({ userId: 1, skillId: 1, sessionDate: -1, createdAt: -1 });

const Session =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);

export default Session;
