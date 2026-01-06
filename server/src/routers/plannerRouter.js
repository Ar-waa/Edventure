import express from "express";
import { getTasksByDate, addTask, toggleTask, getAllTasks } from "../controllers/plannerController.js";

const router = express.Router();

router.get("/tasks", getTasksByDate);
router.get("/tasks/all", getAllTasks);
router.post("/tasks", addTask);
router.patch("/tasks/:taskId", toggleTask);

export default router;