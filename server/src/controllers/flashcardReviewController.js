import Flashcard from "../models/flashcardModel.js";

// In-memory session data
let session = {
    index: 0,
    flashcards: [],
    results: {}, // { flashcardId: 'right' | 'wrong' }
};

// Start a new review session
export const startReview = async (req, res) => {
    try {
        const { category = "", difficulty = "" } = req.query;

        // Build dynamic filter
        const filter = {};
        if (category) filter.category = category;
        if (difficulty) filter.difficulty = difficulty;

        const flashcards = await Flashcard.find(filter);

        session.flashcards = flashcards;
        session.index = 0;
        session.results = {};

        res.json({
            success: true,
            message: "Review session started",
            total: flashcards.length,
            flashcard: flashcards[0] || null,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// Answer current flashcard
const flashcardsAnswered = Object.keys(session.results).map(id => {
    return session.flashcards.find(f => f._id.toString() === id);
});

const perCategory = {};
const perDifficulty = {};

flashcardsAnswered.forEach(fc => {
    const ans = session.results[fc._id];
    if (!perCategory[fc.category]) perCategory[fc.category] = { right: 0, wrong: 0 };
    if (!perDifficulty[fc.difficulty]) perDifficulty[fc.difficulty] = { right: 0, wrong: 0 };

    perCategory[fc.category][ans]++;
    perDifficulty[fc.difficulty][ans]++;
});

res.json({
    success: true,
    flashcard: nextCard,
    done: !nextCard,
    stats: {
        totalAnswered: Object.keys(session.results).length,
        right: Object.values(session.results).filter(v => v === "right").length,
        wrong: Object.values(session.results).filter(v => v === "wrong").length,
        perCategory,
        perDifficulty
    }
});


// Reset session
export const resetReview = async (req, res) => {
    session = { index: 0, flashcards: [], results: {} };
    res.json({ success: true, message: "Review session reset" });
};
