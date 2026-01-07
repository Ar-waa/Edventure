import express from "express";
import { generateQuizByTopic } from '../controllers/quizController.js';
const quizRouter = express.Router();

// Define your route
quizRouter.post('/generate-topic', generateQuizByTopic);

export default quizRouter;