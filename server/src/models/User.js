const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  totalStudyMinutes: Number,
  totalBreakMinutes: Number,
  xp: Number,
  level: Number,
  bio: String,
  password: String,
  FirstName: String,
  userID: mongoose.Schema.Types.ObjectId,
  achievements: {
    studied25min: Boolean,
    studied1hr: Boolean,
    studied2hr: Boolean,
    studied5hr: Boolean,
  },
});

module.exports = mongoose.model("User", userSchema);
