import { serverPort, mongodbURL } from './secret.js';
import mongoose from "mongoose";
import express from "express";
import morgan from "morgan";
import createHttpError from "http-errors";
import rateLimit from "express-rate-limit";
import cors from "cors"
import session from "express-session";
import MongoStore from "connect-mongo";


import User from "./models/userModel.js";

import plannerRouter from "./routers/plannerRouter.js"; 
import flashcardRouter from "./routers/flashcardRouter.js";
import milestoneRouter from "./routers/milestoneRouter.js";
import profileRouter from "./routers/profileRouter.js";

const app = express();

app.use(morgan("dev"));
app.use(cors({
  origin: 'http://localhost:5173', // Your React app URL
  credentials: true, // IMPORTANT for cookies/sessions
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
const rateLimiter = rateLimit({
    windowMs: 1*60*1000,
    max: 100,
    message: 'Too many requests. Try again later',
});
app.use(rateLimiter);

app.use(
    session({
        secret: "flashcardsecret",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: mongodbURL,
            collectionName: 'sessions'
        }),
        cookie: { 
            secure: false, // Set to true if using HTTPS
            httpOnly: true,
            sameSite: 'lax', 
            maxAge: 24 * 60 * 60 * 1000
        },
    })
);

// check authentication status
app.get('/api/check-auth', (req, res) => {
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
});

// login user
app.post('/api/login', async (req, res) => {
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
});

// register new user
app.post('/api/register', async (req, res) => {
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
    const user = new User({
      _id: userId,
      email,
      password,
      firstname: firstname || '',
      lastname: lastname || '',
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
        lastname: user.lastname
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// logout user
app.post('/api/logout', (req, res) => {
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
});

//  demo user endpoint
//app.post('/api/demo-user', async (req, res) => {
 // try {
 //   const demoUserId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
 //   const demoUser = new User({
 //     _id: demoUserId,
 //     email: `demo_${demoUserId}@example.com`,
 //     password: "demopassword123",
 //     firstname: "Demo",
  //    lastname: "User",
  //    bio: "Welcome to my learning journey! This is a demo profile.",
  //    joinedDate: new Date(),
 //   });
    
//    await demoUser.save();
    
//    req.session.userId = demoUserId;
//    req.session.email = demoUser.email;
//    
//    res.json({
//      success: true,
//      message: 'Demo user created successfully',
//      data: {
//        userId: demoUserId,
//        email: demoUser.email,
//        firstname: demoUser.firstname,
//        lastname: demoUser.lastname,
//        bio: demoUser.bio,
//        joinedDate: demoUser.joinedDate
//      }
//    });
//  } catch (error) {
//   console.error('Demo user error:', error);
//    res.status(500).json({
//      success: false,
//      message: 'Server error during demo user creation'
//    });
//  }
//});




// app.use("/api/review", router);
app.use('/api/flashcards', flashcardRouter);
app.use("/api/planner", plannerRouter);
app.use("/api/milestones", milestoneRouter);
app.use("/api/profile", profileRouter);




//client error handling
app.use((req,res,next) => {
    createHttpError(404, 'route not found');
    next();
});

//server error handling
app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        success: false,
        message: err.message,
    });
});

app.get("/", (req, res) => res.send("Server is running"));


app.listen(serverPort, async () => {
    console.log(`Server running on http://localhost:${serverPort}`);
    await connectDB();
});

const connectDB = async (options = {}) => {
    try {
        await mongoose.connect(mongodbURL, options);
        console.log("Connection to database successful");

        mongoose.connection.on("error", (error) => {
            console.error("DB connection error: ", error);
        });
    } catch (error) {
        console.error("Could not connect to DB: ", error.toString());
    }
};
