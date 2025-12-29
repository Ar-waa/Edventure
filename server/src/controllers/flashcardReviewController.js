import Flashcard from "../models/flashcardModel.js";
import Progress from "../models/flashcardProgModel.js";

// POST /api/flashcards/review
// Body: { category?: string, difficulty?: string, flashcardId?: string, isCorrect?: boolean }
export const reviewSession = async (req, res) => {
    try {
        const { category, difficulty, flashcardId, isCorrect } = req.body;

        // ✅ Step 1: Record progress if flashcardId and isCorrect are provided
        if (flashcardId && typeof isCorrect === "boolean") {
        const flashcard = await Flashcard.findById(flashcardId);
        if (flashcard) {
            await Progress.create({
            flashcard: flashcard._id,
            category: flashcard.category,
            difficulty: flashcard.difficulty,
            isCorrect,
            });
        }
        }

        // ✅ Step 2: Select a random flashcard matching filters
        const query = {};
        if (category) query.category = category.toLowerCase();
        if (difficulty) query.difficulty = difficulty.toLowerCase();
        
        // Exclude already reviewed flashcards
        if (reviewedIds.length > 0) query._id = { $nin: reviewedIds.map(id => id.toString()) };

        // Count matching flashcards
        const count = await Flashcard.countDocuments(query);
        if (count === 0) {
        return res.status(404).json({
            success: false,
            message: "No flashcards found for the selected category/difficulty",
        });
        }

        // Pick a random index
        const randomIndex = Math.floor(Math.random() * count);

        const flashcard = await Flashcard.findOne(query).skip(randomIndex);

        res.status(200).json({
        success: true,
        flashcard: {
            _id: flashcard._id,
            question: flashcard.question,
            answer: flashcard.answer,
            category: flashcard.category,
            difficulty: flashcard.difficulty,
        },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
