// models/userModel.js - CHANGE FIELD NAMES to match your database
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
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
    bio: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    firstname: {
      type: String,
      default: "",
    },
    lastname: { 
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    joinedDate: {
      type: Date,
      default: Date.now,
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
  },
  { 
    timestamps: true,
  }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true }); 

const User = mongoose.model("User", userSchema);
export default User;