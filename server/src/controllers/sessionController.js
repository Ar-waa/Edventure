import User from "../models/userModel.js";

export const saveSession = async (req, res) => {
  try {
    const { userId, duration, xpEarned } = req.body;
    
    if (!userId || !duration) {
      return res.status(400).json({
        success: false,
        message: 'User ID and duration are required'
      });
    }
    
    const user = await User.findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user stats
    user.totalStudyMinutes += duration;
    user.xp += xpEarned || 0;
    user.totalSessions += 1;
    
    // Calculate new level (1000 XP per level)
    user.level = Math.floor(user.xp / 1000) + 1;
    
    // Update achievements
    if (user.totalStudyMinutes >= 25) user.achievements.studied25min = true;
    if (user.totalStudyMinutes >= 60) user.achievements.studied1hr = true;
    if (user.totalStudyMinutes >= 120) user.achievements.studied2hr = true;
    if (user.totalStudyMinutes >= 300) user.achievements.studied5hr = true;
    
    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (user.lastSessionDate) {
      const lastSession = new Date(user.lastSessionDate);
      lastSession.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((today - lastSession) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        user.currentStreak += 1;
      } else if (diffDays === 0) {
        // Already studied today
      } else {
        user.currentStreak = 1;
      }
    } else {
      user.currentStreak = 1;
    }
    
    // Update longest streak
    if (user.currentStreak > user.longeststreak) {
      user.longeststreak = user.currentStreak;
    }
    
    // Update last session date
    user.lastSessionDate = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Session saved successfully',
      data: {
        xp: user.xp,
        level: user.level,
        totalStudyMinutes: user.totalStudyMinutes,
        currentStreak: user.currentStreak,
        lastSessionDate: user.lastSessionDate,
        achievements: user.achievements
      }
    });
  } catch (error) {
    console.error('Session save error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error saving session'
    });
  }
};