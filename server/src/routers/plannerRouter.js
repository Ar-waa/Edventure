const express = require("express");
const router = express.Router();
const { getTasksByDate, addTask, toggleTask } = require("../controllers/plannerController");

// Routes
router.get("/tasks", getTasksByDate); // ?date=YYYY-MM-DD&userId=123
router.post("/tasks", addTask);
router.patch("/tasks/:taskId", toggleTask);

module.exports = router;

