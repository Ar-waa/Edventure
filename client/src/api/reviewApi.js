import axios from "axios";

const FLASHCARD_API = "http://localhost:3030/api/flashcards";

export const getReviewFlashcards = async (filters = {}) => {
  try {
    const res = await axios.get(`${FLASHCARD_API}/review`, { params: filters, paramsSerializer: {
        indexes: null // shorthand for 'no brackets'
      } });
    return res.data;
  } catch (err) {
    console.error("Error fetching review flashcards:", err);
    return { success: false, message: err.message };
  }
};

export const getReviewStats = async () => {
  try {
    const res = await axios.get(`${FLASHCARD_API}/progress/summary`);
    return res.data;
  } catch (err) {
    console.error("Error fetching review stats:", err);
    return { success: false, message: err.message };
  }
};

export const resetReviewSession = async () => {
  try {
    const res = await axios.post(`${FLASHCARD_API}/review/reset`);
    return res.data;
  } catch (err) {
    console.error("Error resetting review session:", err);
    return { success: false, message: err.message };
  }
};

export const getFlashcardDetailedStats = async (id) => {
  try {
    const res = await axios.get(`${FLASHCARD_API}/${id}/stats`);
    return res.data;
  } catch (err) {
    console.error("Error fetching card stats:", err);
    return { success: false, message: err.message };
  }
};

export const getCategories = async () => {
  try {
    const res = await axios.get(`${FLASHCARD_API}/categories`);
    return res.data;
  } catch (err) {
    console.error("Error fetching categories:", err);
    return { success: false, message: err.message };
  }
};