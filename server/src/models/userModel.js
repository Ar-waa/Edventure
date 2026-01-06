import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    username: { 
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/, // Alphanumeric and underscores only
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      default: "",
      trim: true,
    },
    lastname: { 
      type: String,
      default: "",
      trim: true,
    },
    bio: {
      type: String,
      default: "",
    },
    totalStudyMinutes: {
      type: Number,
      default: 0,
    },
    totalBreakMinutes: {
      type: Number,
      default: 0,
    },
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    achievements: {
      studied25min: { type: Boolean, default: false },
      studied1hr: { type: Boolean, default: false },
      studied2hr: { type: Boolean, default: false },
      studied5hr: { type: Boolean, default: false },
    },
    totalSessions: { 
      type: Number,
      default: 0,
    },
    currentStreak: { 
      type: Number,
      default: 0,
    },
    lastSessionDate: {
      type: Date,
      default: null,
    },
    longeststreak: { 
      type: Number,
      default: 0,
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;