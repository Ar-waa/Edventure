
import { serverPort, mongodbURL } from './secret.js';
import mongoose from "mongoose";
import express from "express";
import morgan from "morgan";
import createHttpError from "http-errors";
import rateLimit from "express-rate-limit";
import cors from "cors"
import session from "express-session";

import profileRouter from "./routes/profileRouter";
import plannerRouter from "./routers/plannerRouter.js"; 
import flashcardRouter from "./routers/flashcardRouter.js";


const app = express();

app.use(morgan("dev"));
app.use(cors());
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
        name: 'sessionId',
        secret: "flashcardsecret",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

// Middleware to make user available to all routes
app.use((req, res, next) => {
  // req.user will be set by the login route
  next();
});

// app.use("/api/review", router);
app.use('/api/flashcards', flashcardRouter);
app.use("/api/planner", plannerRouter);
app.use("/api/user", userRouter);
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