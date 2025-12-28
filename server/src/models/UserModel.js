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
    firstName: {
      type: String,
      default: "",
    },
    lastName: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      default: "",
    },
    username: {
      type: String,
      default: "",
    },
    profilePicture: {
      type: String,
      default: "",
    },
    joinedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// If the collection name in MongoDB is different, specify it
const User = mongoose.model("User", userSchema, "users"); // 'users' is the collection name

export default User;