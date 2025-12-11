import express from "express";
import { getFlashcards, createFlashcards, updateFlashcards, deleteFlashcards} from "../controllers/flashcardController.js";
const flashcardReviewRouter = express.Router();


// /api/flashcards common route
flashcardReviewRouter.get('/', getFlashcards);
flashcardReviewRouter.post('/', createFlashcards);
flashcardReviewRouter.put('/:id', updateFlashcards);
flashcardReviewRouter.delete('/:id', deleteFlashcards);

flashcardReviewRouter.get("/categories", async (req, res) => {
    try {
        const categories = await Flashcard.distinct("category");
        res.json({ success: true, categories });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

export default flashcardReviewRouter;
