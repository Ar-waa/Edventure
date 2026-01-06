import Flashcard from "../models/flashcardModel.js";
import Progress from "../models/flashcardProgModel.js";

export const reviewSession = async (req, res) => {
    try {
        const { category, difficulty, flashcardId, isCorrect } = req.query;
        let reviewedIds = req.query.reviewedIds || req.query['reviewedIds[]'];

        // Normalize to an array (handles undefined, single string, or array)
        if (!reviewedIds) {
            reviewedIds = [];
        } else if (!Array.isArray(reviewedIds)) {
            reviewedIds = [reviewedIds];
        }

        const isCorrectBool = isCorrect === 'true';
        // ✅ Step 1: Record progress if flashcardId and isCorrect are provided
        if (flashcardId && (isCorrect === 'true' || isCorrect === 'false')) {
        const flashcard = await Flashcard.findById(flashcardId);
        if (flashcard) {
            await Progress.create({
            flashcard: flashcard._id,
            category: flashcard.category,
            difficulty: flashcard.difficulty,
            isCorrect,
            });
            console.log("Progress saved for card:", flashcardId);
        }
        }

        // ✅ Step 2: Select a random flashcard matching filters
        const query = {};
        if (category) query.category = category.toLowerCase();
        if (difficulty) query.difficulty = difficulty.toLowerCase();
        
        // Exclude already reviewed flashcards
        if (reviewedIds.length > 0) {
            query._id = { $nin: reviewedIds };
        }

        // Count matching flashcards
        const count = await Flashcard.countDocuments(query);
        if (count === 0) {
        return res.status(200).json({
            success: false,
            flashcard: null,
            message: "Session Complete",
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
      reviewedIds: reviewedIds,
      remaining: count - 1
    });
  } catch (err) {
    console.error('Review session error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};