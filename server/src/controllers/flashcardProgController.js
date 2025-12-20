import Progress from "../models/flashcardProgModel.js";
import Flashcard from "../models/flashcardModel.js";

// GET /api/progress/summary
export const getProgressSummary = async (req, res) => {
    try {
        const totalReviewed = await Progress.countDocuments();
        const correctAnswers = await Progress.countDocuments({ isCorrect: true });

        const accuracy =
        totalReviewed === 0
            ? 0
            : ((correctAnswers / totalReviewed) * 100).toFixed(2);

        res.status(200).json({
        success: true,
        totalReviewed,
        accuracy,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/progress/category
export const getCategoryStats = async (req, res) => {
    try {
        const stats = await Progress.aggregate([
        {
            $group: {
            _id: "$category",
            total: { $sum: 1 },
            correct: {
                $sum: { $cond: ["$isCorrect", 1, 0] },
            },
            },
        },
        {
            $project: {
            category: "$_id",
            total: 1,
            accuracy: {
                $multiply: [{ $divide: ["$correct", "$total"] }, 100],
            },
            },
        },
        ]);

        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// GET /api/progress/difficulty
export const getDifficultyStats = async (req, res) => {
    try {
        const stats = await Progress.aggregate([
        {
            $group: {
            _id: "$difficulty",
            total: { $sum: 1 },
            correct: {
                $sum: { $cond: ["$isCorrect", 1, 0] },
            },
            },
        },
        {
            $project: {
            difficulty: "$_id",
            total: 1,
            accuracy: {
                $multiply: [{ $divide: ["$correct", "$total"] }, 100],
            },
            },
        },
        ]);

        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// GET /api/progress/category-difficulty
export const getCategoryDifficultyStats = async (req, res) => {
    try {
        const stats = await Progress.aggregate([
        {
            $group: {
            _id: {
                category: "$category",
                difficulty: "$difficulty",
            },
            total: { $sum: 1 },
            correct: {
                $sum: { $cond: ["$isCorrect", 1, 0] },
            },
            },
        },
        {
            $project: {
            category: "$_id.category",
            difficulty: "$_id.difficulty",
            total: 1,
            accuracy: {
                $multiply: [{ $divide: ["$correct", "$total"] }, 100],
            },
            },
        },
        ]);

        res.status(200).json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get progress for a specific flashcard
export const getFlashcardProgress = async (req, res) => {
    try {
        const { id } = req.params;

        // Count total reviews for this flashcard
        const total = await Progress.countDocuments({ flashcard: id });

        // Count correct answers for this flashcard
        const correct = await Progress.countDocuments({
        flashcard: id,
        isCorrect: true,
        });

        res.status(200).json({
        success: true,
        flashcardId: id,
        totalReviewed: total,
        correct,
        accuracy: total ? ((correct / total) * 100).toFixed(2) : 0,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get per-flashcard progress with category + difficulty breakdown
export const getFlashcardProgressDetailed = async (req, res) => {
    try {
        const { id } = req.params;

        // Aggregate progress for this flashcard
        const stats = await Progress.aggregate([
        { $match: { flashcard: id } }, // only this flashcard
        {
            $group: {
            _id: { category: "$category", difficulty: "$difficulty" },
            total: { $sum: 1 },
            correct: { $sum: { $cond: ["$isCorrect", 1, 0] } },
            },
        },
        {
            $project: {
            category: "$_id.category",
            difficulty: "$_id.difficulty",
            total: 1,
            correct: 1,
            accuracy: { $multiply: [{ $divide: ["$correct", "$total"] }, 100] },
            },
        },
        ]);

        // Calculate overall totals
        const overallTotal = stats.reduce((acc, cur) => acc + cur.total, 0);
        const overallCorrect = stats.reduce((acc, cur) => acc + cur.correct, 0);
        const overallAccuracy = overallTotal ? ((overallCorrect / overallTotal) * 100).toFixed(2) : 0;

        res.status(200).json({
        success: true,
        flashcardId: id,
        overall: {
            totalReviewed: overallTotal,
            correct: overallCorrect,
            accuracy: overallAccuracy,
        },
        breakdown: stats,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
