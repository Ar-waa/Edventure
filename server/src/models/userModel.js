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
    FirstName: {
      type: String,
      default: "",
    },
    LastName: {
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
  },
  { 
    timestamps: true,
    _id: true // This tells Mongoose to use default _id behavior
  }
);

userSchema.index({ email: 1 }, { unique: true, sparse: true }); d

const User = mongoose.model("User", userSchema);
export default User;