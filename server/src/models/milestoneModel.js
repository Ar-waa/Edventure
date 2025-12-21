import mongoose from "mongoose";

const achievementSchema = new mongoose.Schema({
  unlocked: { type: Boolean, default: false },
  xp: { type: Number, required: true }
});

const milestoneSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    unique: true
  },
  daily: {
    studied25min: { type: achievementSchema, default: { xp: 5 } },
    studied1hr: { type: achievementSchema, default: { xp: 5 } },
    studied2hr: { type: achievementSchema, default: { xp: 5 } },
    perfectFocus: { type: achievementSchema, default: { xp: 5 } },

  },
  weekly: {
    studied10hr: { type: achievementSchema, default: { xp: 20 } },
    studied20hr: { type: achievementSchema, default: { xp: 20 } },
    threeDayStreak: { type: achievementSchema, default: { xp: 20 } },
    fiveDayStreak: { type: achievementSchema, default: { xp: 20 } },
    consistentKing: { type: achievementSchema, default: { xp: 20 } },
    comeback: { type: achievementSchema, default: { xp: 20 } },
  },
  monthly: {
    studied30hr: { type: achievementSchema, default: { xp: 100 } },
    studied45hr: { type: achievementSchema, default: { xp: 100 } },
    noZeroDays: { type: achievementSchema, default: { xp: 100 } },
    topicMaster: { type: achievementSchema, default: { xp: 100 } },
    fiveDayEveryWeek: { type: achievementSchema, default: { xp: 100 } },
  },
  totalXp: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Milestone", milestoneSchema);
