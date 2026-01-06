import User from "../models/userModel.js";

// authController.js - Updated checkAuth function
export const checkAuth = async (req, res) => {
  if (req.session.userId) {
    try {
      // get user data from db
      const user = await User.findOne({ _id: req.session.userId });
      if (user) {
        res.json({
          success: true,
          authenticated: true,
          userId: user._id,
          email: user.email,
          username: user.username, // add username to response
          firstname: user.firstname,
          lastname: user.lastname
        });
      } else {
        // User not found in DB
        req.session.destroy();
        res.json({
          success: true,
          authenticated: false
        });
      }
    } catch (error) {
      res.json({
        success: true,
        authenticated: false
      });
    }
  } else {
    res.json({
      success: true,
      authenticated: false
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Set session
    req.session.userId = user._id;
    req.session.email = user.email;
    req.session.username = user.username;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user._id,
        email: user.email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

export const register = async (req, res) => {
  try {
    const { email, password, firstname, lastname, username } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Validate username if provided
    if (username) {
      if (username.length < 3 || username.length > 30) {
        return res.status(400).json({
          success: false,
          message: 'Username must be between 3 and 30 characters'
        });
      }
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.status(400).json({
          success: false,
          message: 'Username can only contain letters, numbers, and underscores'
        });
      }
    }
    
    // Check for existing email
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Check for existing username (if provided)
    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: 'Username is already taken'
        });
      }
    }
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create complete user with ALL required fields
    const user = new User({
      _id: userId,
      email: email.toLowerCase().trim(),
      username: username || null, // Can be null
      password: password,
      firstname: firstname || '',
      lastname: lastname || '',
      bio: '',
      totalStudyMinutes: 0,
      totalBreakMinutes: 0,
      xp: 0,
      level: 1,
      achievements: {
        studied25min: false,
        studied1hr: false,
        studied2hr: false,
        studied5hr: false,
      },
      totalSessions: 0,
      currentStreak: 0,
      lastSessionDate: null,
      longeststreak: 0,
      joinedDate: new Date()
    });
    
    await user.save();
    
    // Create session
    req.session.userId = userId;
    req.session.email = email;
    req.session.username = username;
    
    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        userId,
        email,
        username: user.username,
        firstname: user.firstname,
        lastname: user.lastname,
        bio: user.bio,
        xp: user.xp,
        level: user.level,
        totalStudyMinutes: user.totalStudyMinutes,
        joinedDate: user.joinedDate
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
};