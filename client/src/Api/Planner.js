import axios from "axios";

const BASE_URL = "http://localhost:3030/api/planner";

// Helper to get current userId
const getCurrentUserId = () => {
  return localStorage.getItem("userId") || "123";
};

// get tasks for a date
export const fetchTasksByDate = (date, userId) => {
  return axios.get(`${BASE_URL}/tasks`, {
    params: { date, userId },
  });
};

// add a task
export const createTask = (taskData) => {
  return axios.post(`${BASE_URL}/tasks`, {...taskData, userId: getCurrentUserId()});
};

// toggle task completion
export const toggleTaskStatus = (taskId) => {
  return axios.patch(`${BASE_URL}/tasks/${taskId}`);
};

export const fetchAllTasks = (userId) => {
  return axios.get(`${BASE_URL}/tasks/all`, {
    params: { userId },
  });
};