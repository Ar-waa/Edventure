import axios from "axios";

const REVIEW_API = "http://localhost:5000/api/review";
const FLASHCARD_API = "http://localhost:5000/api/flashcards";

export const getReviewFlashcards = async (filters = {}) => {
    const res = await axios.get(`${REVIEW_API}/start`, { params: filters });
    return res.data;
};

export const submitReviewAnswer = async (data) => {
    const res = await axios.post(`${REVIEW_API}/answer`, data);
    return res.data;
};

export const resetReviewSession = async () => {
    const res = await axios.post(`${REVIEW_API}/reset`);
    return res.data;
};

// New: fetch all categories
export const getCategories = async () => {
    const res = await axios.get(`${FLASHCARD_API}/categories`);
    return res.data;
};
