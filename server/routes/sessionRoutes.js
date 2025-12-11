import express from "express";
import User from "../models/User.js";
import StudySession from "../models/StudySession.js";

const router = express.Router();

// XP 
function calculateXP(totalMinutes) {
  return Math.floor(totalMinutes / 25) * 10;
}

router.post("/", async (req, res) => {
  const { userId, type, seconds } = req.body;

  const minutes = Math.floor(seconds / 60);
  const today = new Date().toISOString().slice(0, 10);

  let user = await User.findById(userId);

  // Create user if not found
  if (!user) {
    user = await User.create({
      _id: userId,
      totalStudyMinutes: 0,
      totalBreakMinutes: 0,

      dailyData: {
        date: today,
        studyMinutes: 0,
        breakMinutes: 0
      },

      streak: {
        currentStreak: 0,
        maxStreak: 0,
        lastActiveDate: ""
      },

      achievements: {
        studied25min: false,
        studied1hr: false,
        studied2hr: false,
        studied5hr: false,
        threeDayStreak: false
      },

      xp: 0  // level system to be implemented later
    });
  }

  // Daily reset
  if (user.dailyData.date !== today) {
    user.dailyData.date = today;
    user.dailyData.studyMinutes = 0;
    user.dailyData.breakMinutes = 0;
  }

  // Handle focus / break
  if (type === "focus") {
    user.totalStudyMinutes += minutes;
    user.dailyData.studyMinutes += minutes;
  } else {
    user.totalBreakMinutes += minutes;
    user.dailyData.breakMinutes += minutes;
  }

  // Streak logic (focus only)
  if (type === "focus") {
    if (user.streak.lastActiveDate !== today) {
      if (user.dailyData.studyMinutes >= 25) {
        user.streak.currentStreak += 1;
      } else if (
        user.streak.lastActiveDate &&
        new Date(today) - new Date(user.streak.lastActiveDate) > 86400000
      ) {
        user.streak.maxStreak = Math.max(user.streak.maxStreak, user.streak.currentStreak);
        user.streak.currentStreak = 0;
      }

      user.streak.lastActiveDate = today;
    }
  }

  // Achievements
  if (user.totalStudyMinutes >= 25)  user.achievements.studied25min = true;
  if (user.totalStudyMinutes >= 60)  user.achievements.studied1hr = true;
  if (user.totalStudyMinutes >= 120) user.achievements.studied2hr = true;
  if (user.totalStudyMinutes >= 300) user.achievements.studied5hr = true;
  if (user.streak.currentStreak >= 3) user.achievements.threeDayStreak = true;

  // XP 
  user.xp = calculateXP(user.totalStudyMinutes);

  await user.save();

  // Log session
  await StudySession.create({
    _id: "sess_" + Date.now(),
    userId,
    type,
    durationSeconds: seconds,
    date: new Date().toISOString()
  });

  res.json({ success: true, user });
});

export default router;
