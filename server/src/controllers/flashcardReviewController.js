import Flashcard from "../models/flashcardModel.js";
import Progress from "../models/flashcardProgModel.js";

export const reviewSession = async (req, res) => {
  try {
    const { category, difficulty, flashcardId, isCorrect, reviewedIds = [] } = req.body;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to review flashcards'
      });
    }

    // Record progress
    if (flashcardId && typeof isCorrect === "boolean") {
      const flashcard = await Flashcard.findOne({ _id: flashcardId, userId: userId });
      
      if (flashcard) {
        await Progress.create({
          flashcard: flashcard._id,
          category: flashcard.category,
          difficulty: flashcard.difficulty,
          isCorrect,
        });
        
        reviewedIds.push(flashcardId);
      }
    }

    // Select a random flashcard
    const query = { userId: userId };
    
    if (category) query.category = category.toLowerCase();
    if (difficulty) query.difficulty = difficulty.toLowerCase();
    
    if (reviewedIds.length > 0) {
      query._id = { $nin: reviewedIds };
    }

    const count = await Flashcard.countDocuments(query);
    
    if (count === 0) {
      return res.status(200).json({
        success: true,
        message: "No more flashcards to review",
        completed: true,
        reviewedCount: reviewedIds.length
      });
    }

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