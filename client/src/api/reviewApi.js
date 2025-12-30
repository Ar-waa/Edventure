import axios from "axios";

const FLASHCARD_API = "http://127.0.0.1:5000/api/flashcards";

// Fetch a random flashcard with optional category/difficulty filters
export const getReviewFlashcards = async (filters = {}, flashcardId = null, isCorrect = null) => {
    try {
        const payload = flashcardId ? { flashcardId, isCorrect } : filters;
        const res = await axios.post(`${FLASHCARD_API}/review`, payload);
        return res.data;
    } catch (err) {
        console.error("Error fetching/submitting review:", err);
        return { success: false, message: err.message };
    }
    };

    // Fetch aggregated stats
    export const getReviewStats = async () => {
    try {
        const res = await axios.get(`${FLASHCARD_API}/progress/summary`);
        return res.data;
    } catch (err) {
        console.error("Error fetching stats:", err);
        return { success: false, message: err.message };
    }
    };

    // Reset session (frontend-only reset, backend optional)
export const resetReviewSession = async () => {
    return { success: true };
};

    // Fetch per-card detailed stats
    export const getFlashcardDetailedStats = async (id) => {
    try {
        const res = await axios.get(`${FLASHCARD_API}/progress/${id}/progress/detailed`);
        return res.data;
    } catch (err) {
        console.error("Error fetching detailed stats:", err);
        return { success: false, message: err.message };
    }
    };

    // Fetch all categories
    export const getCategories = async () => {
    try {
        const res = await axios.get(`${FLASHCARD_API}/categories`);
        return res.data;
    } catch (err) {
        console.error("Error fetching categories:", err);
        return { success: false, message: err.message };
    }
};
