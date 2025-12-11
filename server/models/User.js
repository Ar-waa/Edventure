import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  _id: String,

  totalStudyMinutes: Number,
  totalBreakMinutes: Number,

  dailyData: {
    date: String,
    studyMinutes: Number,
    breakMinutes: Number
  },

  streak: {
    currentStreak: Number,
    maxStreak: Number,
    lastActiveDate: String
  },

  achievements: {
    studied25min: Boolean,
    studied1hr: Boolean,
    studied2hr: Boolean,
    studied5hr: Boolean,
    threeDayStreak: Boolean
  },

  xp: Number
});

export default mongoose.model("User", userSchema);
