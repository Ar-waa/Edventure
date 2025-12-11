// reviewRouter.js
import express from "express";
import Flashcard from "../models/flashcardModel.js";

const router = express.Router();

// Start review session (with optional filters)
    router.get("/start", async (req, res) => {
        const { category, difficulty } = req.query;

        // Build dynamic query
        const query = {};
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        try {
            const flashcards = await Flashcard.find(query);

            if (!flashcards.length) {
            return res.json({ success: false, message: "No flashcards match this filter" });
            }

            // Store review session in memory (for now global/session)
            req.session.review = {
            flashcards,
            index: 0,
            stats: {
                totalAnswered: 0,
                right: 0,
                wrong: 0,
                categoryStats: {},
                difficultyStats: {},
            },
            };

            res.json({
            success: true,
            flashcard: flashcards[0],
            total: flashcards.length,
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
        });

    // Answer a flashcard
    router.post("/answer", (req, res) => {
    const { correct } = req.body; // true = right, false = wrong
    const session = req.session.review;

    if (!session) {
        return res.status(400).json({ success: false, message: "No active review session" });
    }

    const flashcard = session.flashcards[session.index];

    // Update global stats
    session.stats.totalAnswered++;
    if (correct) session.stats.right++;
    else session.stats.wrong++;

    // Update category stats
    if (!session.stats.categoryStats[flashcard.category]) {
        session.stats.categoryStats[flashcard.category] = { right: 0, wrong: 0 };
    }
    if (!session.stats.difficultyStats[flashcard.difficulty]) {
        session.stats.difficultyStats[flashcard.difficulty] = { right: 0, wrong: 0 };
    }

    if (correct) {
        session.stats.categoryStats[flashcard.category].right++;
        session.stats.difficultyStats[flashcard.difficulty].right++;
    } else {
        session.stats.categoryStats[flashcard.category].wrong++;
        session.stats.difficultyStats[flashcard.difficulty].wrong++;
    }

    // Move to next flashcard
    session.index++;
    const nextFlashcard = session.flashcards[session.index] || null;

    res.json({
        success: true,
        flashcard: nextFlashcard,
        stats: session.stats,
        finished: !nextFlashcard,
    });
    });

    // Reset review session
    router.post("/reset", (req, res) => {
    req.session.review = null;
    res.json({ success: true, message: "Review session reset" });
    });

export default router;
