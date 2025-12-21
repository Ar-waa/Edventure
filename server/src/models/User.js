import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: String,
  password: String,

  profile: {
    name: { type: String, default: "" },
    bio: { type: String, default: "" }
  },

  totalStudyMinutes: { type: Number, default: 0 },
  totalBreakMinutes: { type: Number, default: 0 },

  dailyData: {
    date: String,
    studyMinutes: { type: Number, default: 0 },
    breakMinutes: { type: Number, default: 0 }
  },

  streak: {
    currentStreak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    lastActiveDate: String
  },

  achievements: {
    studied25min: { type: Boolean, default: false },
    studied1hr: { type: Boolean, default: false },
    studied2hr: { type: Boolean, default: false },
    studied5hr: { type: Boolean, default: false },
    threeDayStreak: { type: Boolean, default: false }
  },

  xp: { type: Number, default: 0 }
});

export default mongoose.model("User", userSchema);
