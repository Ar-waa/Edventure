import axios from "axios";

const API_URL = "http://localhost:3030/api/flashcards";

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
    const res = await axios.post(API_URL, flashcard);
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
