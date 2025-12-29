// server.js - Add this route
const express = require('express');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/studyapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const app = express();
app.use(express.json());

// Session schema (create a separate model if needed)
const sessionSchema = new mongoose.Schema({
  userId: String,
  duration: Number,
  xpEarned: Number,
  segments: Number,
  endTime: Date
}, { timestamps: true });

const Session = mongoose.model('Session', sessionSchema);

// Save session endpoint
app.post('/api/sessions', async (req, res) => {
  try {
    const { userId, duration, xpEarned, segments } = req.body;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // 1. Save the session to sessions collection
    const session = new Session({
      userId,
      duration,
      xpEarned,
      segments,
      endTime: new Date()
    });
    await session.save();

    // 2. Update the user document with new XP and study minutes
    const User = mongoose.model('User'); // Your existing User model
    
    const user = await User.findOne({ _id: userId });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update user stats
    user.xp += xpEarned;
    user.totalStudyMinutes += duration;
    user.totalSessions += 1;
    
    // Calculate new level (1000 XP per level)
    user.level = Math.floor(user.xp / 1000) + 1;
    
    // Update achievements based on total study minutes
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
        // Studied yesterday, continue streak
        user.currentStreak += 1;
      } else if (diffDays === 0) {
        // Already studied today, keep streak same
      } else {
        // Broken streak, reset to 1
        user.currentStreak = 1;
      }
    } else {
      // First session
      user.currentStreak = 1;
    }
    
    // Update longest streak if needed
    if (user.currentStreak > user.longestStreak) {
      user.longestStreak = user.currentStreak;
    }
    
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
        achievements: user.achievements
      }
    });

  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Get user sessions
app.get('/api/sessions/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const sessions = await Session.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});