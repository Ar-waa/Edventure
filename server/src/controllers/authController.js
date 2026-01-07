import User from "../models/userModel.js";

// Check authentication status
export const checkAuth = (req, res) => {
  if (req.session.userId) {
    res.json({
      success: true,
      authenticated: true,
      userId: req.session.userId,
      email: req.session.email
    });
  } else {
    res.json({
      success: true,
      authenticated: false
    });
  }
};

// Login user
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
    
    req.session.userId = user._id;
    req.session.email = user.email;
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user._id,
        email: user.email,
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

// Register new user
export const register = async (req, res) => {
  try {
    const { email, password, firstname, lastname } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create complete user with ALL required fields
    const user = new User({
      _id: userId,
      email: email.toLowerCase().trim(),
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
    
    req.session.userId = userId;
    req.session.email = email;
    
    res.json({
      success: true,
      message: 'Registration successful',
      data: {
        userId,
        email,
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

// Logout user
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