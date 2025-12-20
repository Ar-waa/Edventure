import express from "express";
import { getFlashcards, createFlashcards, updateFlashcards, deleteFlashcards} from "../controllers/flashcardController.js";

import {
    getProgressSummary,
    getCategoryStats,
    getDifficultyStats,
    getCategoryDifficultyStats,
    getFlashcardProgress,
    getFlashcardProgressDetailed,
} from "../controllers/flashcardProgController.js";

import { reviewSession } from "../controllers/flashcardReviewController.js";

const flashcardRouter = express.Router();


// /api/flashcards common route
flashcardRouter.get('/', getFlashcards);
flashcardRouter.post('/', createFlashcards);
flashcardRouter.put('/:id', updateFlashcards);
flashcardRouter.delete('/:id', deleteFlashcards);
flashcardRouter.get("/categories", async (req, res) => {
    try {
        const categories = await Flashcard.distinct("category");
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});


flashcardRouter.get("/progress/summary", getProgressSummary);
flashcardRouter.get("/progress/category", getCategoryStats);
flashcardRouter.get("/progress/difficulty", getDifficultyStats);
flashcardRouter.get("/progress/category-difficulty", getCategoryDifficultyStats);
flashcardRouter.get("/progress/:id/progress", getFlashcardProgress);
flashcardRouter.get("/progress/:id/progress/detailed", getFlashcardProgressDetailed);
flashcardRouter.post("/review", reviewSession);

export default flashcardRouter;
