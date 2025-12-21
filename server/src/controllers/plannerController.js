
import Planner from "../models/Planner.js";

// Get tasks for a specific date
const getTasksByDate = async (req, res) => {
  const { date, userId } = req.query;

  try {
    const tasks = await Planner.find({ date, userId });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching tasks", error: err });
  }
};

// Add a new task
const addTask = async (req, res) => {
  const { userId, date, text, type } = req.body;

  try {
    const task = new Planner({ userId, date, text, type });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: "Error adding task", error: err });
  }
};

// Toggle task completion
const toggleTask = async (req, res) => {
  const { taskId } = req.params;

  try {
    const task = await Planner.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.completed = !task.completed;
    await task.save();

    res.status(200).json(task);
  } catch (err) {
    res.status(500).json({ message: "Error updating task", error: err });
  }
};

const getAllTasks = async (req, res) => {
  const { userId } = req.query;

  try {
    const tasks = await Planner.find({ userId });
    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: "Error fetching all tasks", error: err });
  }
};

export { getTasksByDate, getAllTasks, addTask, toggleTask };

