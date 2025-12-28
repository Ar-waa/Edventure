import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

// Get user profile by username (_id)
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile (name, bio, etc.) by username (_id)
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { firstName, lastName, bio },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change password by username (_id)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user stats by username (_id)
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("xp level totalStudyMinutes achievements");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Calculate next level XP
    const nextLevelXP = user.level * 1000;
    const progress = (user.xp / nextLevelXP) * 100;

    res.status(200).json({
      success: true,
      data: {
        xp: user.xp,
        level: user.level,
        totalStudyMinutes: user.totalStudyMinutes,
        achievements: user.achievements,
        nextLevelXP,
        progress: Math.min(progress, 100),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user stats (for when study sessions are completed) by username (_id)
export const updateUserStats = async (req, res) => {
  try {
    const { studyMinutes, breakMinutes } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update study time
    user.totalStudyMinutes += studyMinutes || 0;
    user.totalBreakMinutes += breakMinutes || 0;

    // Add XP (1 XP per minute studied)
    const xpGained = studyMinutes || 0;
    user.xp += xpGained;

    // Check level up
    const xpNeeded = user.level * 1000;
    if (user.xp >= xpNeeded) {
      user.level += 1;
    }

    // Check achievements
    if (user.totalStudyMinutes >= 25 && !user.achievements.studied25min) {
      user.achievements.studied25min = true;
      user.xp += 50; // Bonus XP
    }
    if (user.totalStudyMinutes >= 60 && !user.achievements.studied1hr) {
      user.achievements.studied1hr = true;
      user.xp += 100;
    }
    if (user.totalStudyMinutes >= 120 && !user.achievements.studied2hr) {
      user.achievements.studied2hr = true;
      user.xp += 250;
    }
    if (user.totalStudyMinutes >= 300 && !user.achievements.studied5hr) {
      user.achievements.studied5hr = true;
      user.xp += 500;
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        xpGained,
        newXP: user.xp,
        newLevel: user.level,
        achievementsUnlocked: Object.values(user.achievements).filter(Boolean).length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};