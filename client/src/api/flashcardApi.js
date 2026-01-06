import axios from "axios";

const API_URL = "http://localhost:3030/api/flashcards";
// const FLASHCARD_API = "/api/flashcards";

// Helper to get current userId
const getCurrentUserId = () => {
  return localStorage.getItem("userId") || "demo_user";
};

export const getFlashcards = async (filters = {}, page = 1, limit = 5) => {
    try {
        const res = await axios.get(API_URL, {
            params: {
                search: filters.search || "",
                category: filters.category || "",
                difficulty: filters.difficulty || "",
                page: page,    // use function argument
                limit: limit,  // use function argument
            },
        });
        return res.data;
    } catch (error) {
        console.error("Error fetching flashcards:", error); 
        return { success: false, message: "Error fetching flashcards" };
    }
};

export const createFlashcard = async (flashcard) => {
    const res = await axios.post(API_URL, {...flashcard, userId: getCurrentUserId()});
    return res.data;
};

export const updateFlashcard = async (id, updatedData) => {
    const res = await axios.put(`${API_URL}/${id}`, updatedData);
    return res.data;
};

export const deleteFlashcard = async (id) => {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
};

export const generateFlashcards = async ({ files, text }) => {
    try {
        const formData = new FormData();
        if (text) formData.append("textInput", text);
        if (files) {
        for (const file of files) formData.append("files", file);
        }

        const res = await axios.post(`${API_URL}/generate`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        });

        return res.data;
    } catch (err) {
        console.error("Error generating flashcards:", err);
        return { success: false, message: err.response?.data?.message || err.message };
    }
};
