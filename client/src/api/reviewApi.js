import axios from "axios";

const API_URL = "http://localhost:3030/api/profile";

export const getUserProfile = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching profile:", error);
    return { success: false, message: error.message };
  }
};

export const getUserStats = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}/stats`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching stats:", error);
    return { success: false, message: error.message };
  }
};

export const updateProfile = async (userId, data) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, message: error.message };
  }
};

export const changePassword = async (userId, data) => {
  try {
    const response = await fetch(`${API_URL}/${userId}/password`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error changing password:", error);
    return { success: false, message: error.message };
  }
};

const FLASHCARD_API = "http://localhost:3030/api/flashcards";

export const getReviewFlashcards = async (filters = {}) => {
  try {
    const res = await axios.get(`${FLASHCARD_API}/review`, { params: filters });
    return res.data;
  } catch (err) {
    console.error("Error fetching review flashcards:", err);
    return { success: false, message: err.message };
  }
};

export const getReviewStats = async () => {
  try {
    const res = await axios.get(`${FLASHCARD_API}/review/stats`);
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