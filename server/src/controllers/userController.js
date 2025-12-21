import User from "../models/User.js";

export async function getProfile(req, res) {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      // Create a default user if doesn't exist
      const newUser = new User({
        _id: userId,
        password: "",
        FirstName: "",
        bio: "",
        totalStudyMinutes: 0,
        totalBreakMinutes: 0,
        xp: 0,
        level: 1,
        achievements: {
          studied25min: false,
          studied1hr: false,
          studied2hr: false,
          studied5hr: false,
          threeDayStreak: false
        }
      });
      await newUser.save();
      
      const { password, ...userData } = newUser.toObject();
      return res.json(userData);
    }
    
    // Return user data without password
    const { password, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const userId = req.params.userId;
    const { name, bio } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        FirstName: name || "",
        bio: bio || ""
      },
      { new: true, upsert: true }
    );
    
    const { password, ...userData } = updatedUser.toObject();
    res.json(userData);
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({ error: error.message });
  }
}

// Create profile (for registration)
export async function createProfile(req, res) {
  try {
    const { username, password, name } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    // Check if user already exists
    const existingUser = await User.findById(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    // Create new user
    const newUser = new User({
      _id: username,
      password: password,
      FirstName: name || "",
      bio: "",
      totalStudyMinutes: 0,
      totalBreakMinutes: 0,
      xp: 0,
      level: 1,
      achievements: {
        studied25min: false,
        studied1hr: false,
        studied2hr: false,
        studied5hr: false,
        threeDayStreak: false
      }
    });
    
    await newUser.save();
    
    // Return user data without password
    const { password: _, ...userData } = newUser.toObject();
    res.status(201).json(userData);
  } catch (error) {
    console.error("Error in createProfile:", error);
    res.status(500).json({ error: error.message });
  }
}

// Login function
export async function login(req, res) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    // Find user
    const user = await User.findById(username);
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // Check password (simple check for school project)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }
    
    // Return user data without password
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ error: error.message });
  }
}
