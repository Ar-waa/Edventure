import axios from "axios";

const BASE_URL = "http://localhost:3030/api/planner";

// get tasks for a date
export const fetchTasksByDate = (date) => {
  return axios.get(`${BASE_URL}/tasks`, {
    params: { date },
    withCredentials: true
  });
};

// add a task
export const createTask = (taskData) => {
  return axios.post(`${BASE_URL}/tasks`, taskData, {
    withCredentials: true
  });
};

// toggle task completion
export const toggleTaskStatus = (taskId) => {
  return axios.patch(`${BASE_URL}/tasks/${taskId}`, {}, {
    withCredentials: true
  });
};

// get all tasks
export const fetchAllTasks = () => {
  return axios.get(`${BASE_URL}/tasks/all`, {
    withCredentials: true
  });
};