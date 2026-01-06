import express from "express";
import multer from "multer";
import { 
  getFlashcards, 
  createFlashcards, 
  updateFlashcards, 
  deleteFlashcards, 
  generateFlashcardsFromAI,
  getCategories 
} from "../controllers/flashcardController.js";
import { reviewSession } from "../controllers/flashcardReviewController.js";
import {
  getProgressSummary,
  getCategoryStats,
  getDifficultyStats,
  getCategoryDifficultyStats,
  getFlashcardProgress,
  getFlashcardProgressDetailed,
} from "../controllers/flashcardProgController.js";

const flashcardRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Flashcard CRUD routes
flashcardRouter.get('/', getFlashcards);
flashcardRouter.post('/', createFlashcards);
flashcardRouter.put('/:id', updateFlashcards);
flashcardRouter.delete('/:id', deleteFlashcards);
flashcardRouter.post("/generate", upload.array("files"), generateFlashcardsFromAI);
flashcardRouter.get("/categories", getCategories);

// Progress routes
flashcardRouter.get("/progress/summary", getProgressSummary);
flashcardRouter.get("/progress/category", getCategoryStats);
flashcardRouter.get("/progress/difficulty", getDifficultyStats);
flashcardRouter.get("/progress/category-difficulty", getCategoryDifficultyStats);
flashcardRouter.get("/progress/:id/progress", getFlashcardProgress);
flashcardRouter.get("/progress/:id/progress/detailed", getFlashcardProgressDetailed);

// Review session route
flashcardRouter.post("/review", reviewSession);

export default flashcardRouter;