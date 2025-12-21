import express from "express";

const router = express.Router();

import { getTasksByDate, addTask, toggleTask, getAllTasks } from "../controllers/plannerController.js";

// Routes
router.get("/tasks", getTasksByDate); // ?date=YYYY-MM-DD&userId=123
router.get("/tasks/all", getAllTasks);
router.post("/tasks", addTask);
router.patch("/tasks/:taskId", toggleTask);

export default router;  

