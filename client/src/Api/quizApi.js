import axios from 'axios';

// Create an instance to avoid repeating the base URL
const api = axios.create({
  baseURL: 'http://127.0.0.1:5000/api', 
});

export const getQuizByTopic = async (topic) => {
  try {
    const response = await api.post('/quiz/generate-topic', { topic });
    return response.data; // This returns the { success: true, data: [...] } object
  } catch (error) {
    throw error.response?.data?.message || "Failed to connect to server";
  }
};