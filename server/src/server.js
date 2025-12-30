import { serverPort, mongodbURL, API } from './secret.js';
import mongoose from "mongoose";
import express from "express";
import cors from "cors"
import morgan from "morgan";
import createHttpError from "http-errors";
import rateLimit from "express-rate-limit";
import session from "express-session";

import plannerRouter from "./routers/plannerRouter.js"; 
import flashcardRouter from "./routers/flashcardRouter.js";
import milestoneRouter from "./routers/milestoneRouter.js";
import quizRouter from "./routers/quizRouter.js";


const app = express();

app.use(cors({
    origin: 'http://127.0.0.1:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Explicitly allow OPTIONS
    credentials: true,
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get("/api/test", (req, res) => {
    res.json({ message: "CORS is working!" });
});
//const rateLimiter = rateLimit({
  //  windowMs: 1*60*1000,
    //max: 100,
    //message: 'Too many requests. Try again later',
//});
//app.use(rateLimiter);

//app.use(
  //  session({
    //    secret: "flashcardsecret",
      //  resave: false,
        //saveUninitialized: true,
        //cookie: { secure: false },
    //})
//);


// app.use("/api/review", router);
app.use('/api/flashcards', flashcardRouter);
app.use("/api/planner", plannerRouter);
app.use("/api/milestones", milestoneRouter);
app.use("/api/quiz", quizRouter);

//client error handling
app.use((req, res, next) => {
  next(createHttpError(404, "Route not found"));
});


//server error handling
app.use((err, req, res, next) => {
    return res.status(err.status || 500).json({
        success: false,
        message: err.message,
    });
});


app.get("/", (req, res) => res.send("Server is running"));

app.listen(5000, async () => {
    console.log(`Server running on http://127.0.0.1:${serverPort}`);
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
