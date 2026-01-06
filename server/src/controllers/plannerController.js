import Planner from "../models/Planner.js";

// Get tasks for a specific date
const getTasksByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "You must be logged in to view tasks" 
      });
    }

    if (!date) {
      return res.status(400).json({ 
        success: false,
        message: "Date is required" 
      });
    }

    const tasks = await Planner.find({ date, userId });
    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching tasks", 
      error: err.message 
    });
  }
};

// Add a new task
const addTask = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "You must be logged in to create tasks"
      });
    }

    const { date, text, type } = req.body;

    if (!date || !text) {
      return res.status(400).json({
        success: false,
        message: "Date and text are required"
      });
    }

    const task = new Planner({
      userId: userId,
      date: String(date),
      text: text.trim(),
      type: type || "assignment",
      completed: false
    });

    await task.save();
    
    res.status(201).json({
      success: true,
      data: task
    });

  } catch (err) {
    console.error("ADD TASK ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Toggle task completion
const toggleTask = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { taskId } = req.params;

    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "You must be logged in to update tasks" 
      });
    }

    const task = await Planner.findOne({ _id: taskId, userId: userId });
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found or you don't have permission" 
      });
    }

    task.completed = !task.completed;
    await task.save();

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ 
      success: false,
      message: "Error updating task", 
      error: err.message 
    });
  }
};

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: "You must be logged in to view tasks" 
      });
    }

    const tasks = await Planner.find({ userId });
    
    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (err) {
    console.error("Error fetching all tasks:", err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching all tasks", 
      error: err.message 
    });
  }
};

export { getTasksByDate, getAllTasks, addTask, toggleTask };