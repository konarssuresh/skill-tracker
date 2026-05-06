import mongoose from "mongoose";

const skillGoalSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["weekly", "total"],
      default: null,
    },
    targetMinutes: {
      type: Number,
      min: [1, "Goal target must be at least 1 minute"],
      default: null,
    },
  },
  {
    _id: false,
  },
);

const skillSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Skill name is required"],
      trim: true,
      maxlength: [100, "Skill name cannot be more than 100 characters"],
    },
    normalizedName: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      select: false,
    },
    color: {
      type: String,
      default: "#059669",
      trim: true,
      maxlength: [30, "Color value cannot be more than 30 characters"],
    },
    goal: {
      type: skillGoalSchema,
      default: () => ({ type: null, targetMinutes: null }),
    },
    totalMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    sessionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentStreakDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    longestStreakDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPracticedOn: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.normalizedName;
        return ret;
      },
    },
  },
);

skillSchema.index({ userId: 1, normalizedName: 1 }, { unique: true });
skillSchema.index({ userId: 1, updatedAt: -1 });
skillSchema.index({ userId: 1, totalMinutes: -1 });

skillSchema.pre("validate", function setNormalizedName() {
  if (this.name) {
    this.normalizedName = this.name.trim().toLowerCase();
  }

  if (this.goal?.type && !this.goal?.targetMinutes) {
    this.invalidate(
      "goal.targetMinutes",
      "Goal target is required when a goal type is set",
    );
  }

  if (!this.goal?.type && this.goal?.targetMinutes) {
    this.invalidate(
      "goal.type",
      "Goal type is required when a target is set",
    );
  }
});

const Skill = mongoose.models.Skill || mongoose.model("Skill", skillSchema);

export default Skill;
