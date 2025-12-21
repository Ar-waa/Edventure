import Milestone from "../models/milestoneModel.js";
import mongoose from "mongoose";

export default class MilestoneController {
  async createMilestone(req, res) {
    try {
      const userId = req.params.userId;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }

      const milestone = new Milestone({ userId: mongoose.Types.ObjectId(userId) });
      await milestone.save();
      res.status(201).json({ message: "Milestone created", milestone });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateMilestone(req, res) {
    try {
      const userId = req.params.userId;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }

      const { todayMinutes, weekMinutes, monthMinutes, streakDays } = req.body;

      const milestone = await Milestone.findOne({ userId: mongoose.Types.ObjectId(userId) });
      if (!milestone) throw new Error("Milestone not found");

      const achievements = this.calculateAchievements({ todayMinutes, weekMinutes, monthMinutes, streakDays });

      let xpGained = 0;

      for (const period of ["daily", "weekly", "monthly"]) {
        for (const key in achievements[period]) {
          const current = milestone[period][key];
          if (achievements[period][key] && !current.unlocked) {
            current.unlocked = true;
            xpGained += current.xp;
          }
        }
      }

      milestone.totalXp += xpGained;
      await milestone.save();

      res.status(200).json({ message: "Milestones updated", xpGained, totalXp: milestone.totalXp });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  calculateAchievements({ todayMinutes, weekMinutes, monthMinutes, streakDays }) {
    return {
      daily: {
        studied25min: todayMinutes >= 25,
        studied1hr: todayMinutes >= 60,
        studied2hr: todayMinutes >= 120,
        perfectFocus: todayMinutes >= 90,
      },
      weekly: {
        studied10hr: weekMinutes >= 600,
        studied20hr: weekMinutes >= 1200,
        threeDayStreak: streakDays >= 3,
        fiveDayStreak: streakDays >= 5,
        consistentKing: streakDays >= 7,
        comeback: streakDays >= 1,
      },
      monthly: {
        studied30hr: monthMinutes >= 1800,
        studied45hr: monthMinutes >= 2700,
        noZeroDays: streakDays >= 28,
        topicMaster: monthMinutes >= 2000,
        fiveDayEveryWeek: streakDays >= 20
      }
    };
  }

  async getMilestone(req, res) {
    try {
      const userId = req.params.userId;

      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid userId" });
      }

      const milestone = await Milestone.findOne({ userId: mongoose.Types.ObjectId(userId) });
      res.status(200).json(milestone);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}
