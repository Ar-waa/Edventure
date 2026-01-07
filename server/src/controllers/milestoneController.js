import Milestone from "../models/milestoneModel.js";
//import mongoose from "mongoose";

export default class MilestoneController {
  async createMilestone(req, res) {
    try {
      const { userId } = req.params;
    
      const existing = await Milestone.findOne({ userId });
      if (existing) return res.status(200).json(existing);

      const milestone = new Milestone({ 
        userId: userId, 
        totalXp: 0,
      });

      await milestone.save();
      res.status(201).json(milestone);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateMilestone(req, res) {
    try {
      const userId = req.params.userId;

      const { todayMinutes, weekMinutes, monthMinutes, streakDays } = req.body;

      // FIX: Use findOne to get the EXISTING data from the database
      const milestone = await Milestone.findOne({ userId: userId });
      
      if (!milestone) {
          return res.status(404).json({ error: "Milestone not found for this user" });
      }

      const achievements = this.calculateAchievements({ todayMinutes, weekMinutes, monthMinutes, streakDays });

      let xpGained = 0;

      for (const period of ["daily", "weekly", "monthly"]) {
        for (const key in achievements[period]) {
          const current = milestone[period][key];
          
          // Check if AI/Logic says achievement is reached AND it's not already unlocked
          if (achievements[period][key] && current && !current.unlocked) {
            current.unlocked = true;
            xpGained += current.xp;
          }
        }
      }

      milestone.totalXp += xpGained;
      
      // Tell Mongoose that nested objects were modified
      milestone.markModified('daily');
      milestone.markModified('weekly');
      milestone.markModified('monthly');
      
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

      const milestone = await Milestone.findOne({ userId: userId });
      if (!milestone) {
        return res.status(404).json({ message: "No milestones found for this user." });
      }
      res.status(200).json(milestone);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}