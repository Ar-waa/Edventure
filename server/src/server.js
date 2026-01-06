import { serverPort, mongodbURL } from './secret.js';
import mongoose from "mongoose";
import express from "express";
import morgan from "morgan";
import createHttpError from "http-errors";
import rateLimit from "express-rate-limit";
import cors from "cors"
import session from "express-session";
import MongoStore from "connect-mongo";

// Import routers
import authRouter from "./routers/authRouter.js";
import plannerRouter from "./routers/plannerRouter.js"; 
import flashcardRouter from "./routers/flashcardRouter.js";
import milestoneRouter from "./routers/milestoneRouter.js";
import profileRouter from "./routers/profileRouter.js";
import sessionRouter from "./routers/sessionRouter.js";

const app = express();

// Middleware
app.use(morgan("dev"));

// CORS Configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    // Check if origin is localhost (any port)
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // If it's not localhost, block it
    console.log('CORS blocked for origin:', origin);
    return callback(new Error('Not allowed by CORS'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Rate limiting
const rateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests. Try again later',
});
app.use(rateLimiter);

// Session configuration
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
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
  })
);

// Routes
app.use('/api', authRouter); // Handles: /api/check-auth, /api/login, /api/register, /api/logout
app.use('/api/flashcards', flashcardRouter);
app.use("/api/planner", plannerRouter);
app.use("/api/milestones", milestoneRouter);
app.use("/api/profile", profileRouter);
app.use('/api/session', sessionRouter);

// Root route
app.get("/", (req, res) => res.send("Server is running"));

// 404 Error handling
app.use((req, res, next) => {
  next(createHttpError(404, 'Route not found'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Start server
app.listen(serverPort, async () => {
  console.log(`Server running on http://localhost:${serverPort}`);
  await connectDB();
});

// Database connection
const connectDB = async (options = {}) => {
  try {
    await mongoose.connect(mongodbURL, options);
    console.log("Connection to database successful");

    mongoose.connection.on("error", (error) => {
      console.error("DB connection error: ", error);
    });
  } catch (error) {
    console.error("Could not connect to DB: ", error.toString());
    process.exit(1);
  }
};