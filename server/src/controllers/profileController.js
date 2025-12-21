const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.params.userID });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      FirstName: user.FirstName,
      userID: user.userID,
      xp: user.xp,
      level: user.level,
      achievements: user.achievements,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
