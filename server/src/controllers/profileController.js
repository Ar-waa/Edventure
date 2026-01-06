import User from "../models/userModel.js";

// Get user profile
export const getProfile = async (req, res) => {
  try {
    console.log("Fetching profile for user:", req.params.userId);
    const user = await User.findById(req.params.userId).select("-password");
    
    if (!user) {
      console.log("User not found:", req.params.userId);
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    console.log("Found user:", user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user stats for profile page
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("xp level totalStudyMinutes achievements");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Calculate next level XP and progress
    const nextLevelXP = user.level * 1000;
    const progress = (user.xp / nextLevelXP) * 100;

    res.status(200).json({
      success: true,
      data: {
        xp: user.xp,
        level: user.level,
        totalStudyMinutes: user.totalStudyMinutes || 0,
        achievements: user.achievements || {
          studied25min: false,
          studied1hr: false,
          studied2hr: false,
          studied5hr: false,
        },
        nextLevelXP,
        progress: Math.min(progress, 100),
      },
    });
  } catch (error) {
    console.error("Error in getUserStats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update existing user profile
export const updateProfile = async (req, res) => {
  try {
    const { firstname, lastname, bio, email } = req.body; 
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.userId,
      { firstname, lastname, bio, email }, 
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change password for existing user
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Simple comparison (since your DB has plain text password)
    if (currentPassword !== user.password) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};