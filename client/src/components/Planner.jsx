import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Planner.css";

import {
  fetchTasksByDate,
  fetchAllTasks,
  createTask,
  toggleTaskStatus,
} from "../Api/Planner";

function Planner() {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [taskType, setTaskType] = useState("exam");

  const [allTasks, setAllTasks] = useState([]);
  const [taskMap, setTaskMap] = useState({}); // map of date -> tasks
  const [weeklySummary, setWeeklySummary] = useState({
    finished: 0,
    unfinished: 0,
    total: 0,
  });

  const userId = "123";

  // Format selected date as YYYY-MM-DD
  const formattedDate = date.toISOString().split("T")[0];

  // Fetch all tasks once
  useEffect(() => {
    fetchAllTasks(userId)
      .then((res) => {
        setAllTasks(res.data);

        // Build task map for faster lookup per date
        const map = {};
        res.data.forEach((task) => {
          if (!map[task.date]) map[task.date] = [];
          map[task.date].push(task);
        });
        setTaskMap(map);
      })
      .catch((err) => console.error(err));
  }, []);

  // Compute weekly summary
  useEffect(() => {
    if (allTasks.length > 0) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const lastWeekTasks = allTasks.filter(
        (task) => new Date(task.date) >= oneWeekAgo
      );

      const finished = lastWeekTasks.filter((t) => t.completed).length;
      const unfinished = lastWeekTasks.filter((t) => !t.completed).length;

      setWeeklySummary({
        finished,
        unfinished,
        total: lastWeekTasks.length,
      });
    }
  }, [allTasks]);

  // Fetch tasks for selected date
  useEffect(() => {
    fetchTasksByDate(formattedDate, userId)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err));
  }, [formattedDate]);

  // Add new task
  const addTask = () => {
    if (!taskInput.trim()) return;

    const newTaskData = {
      userId,
      date: formattedDate,
      text: taskInput,
      type: taskType,
    };

    createTask(newTaskData)
      .then((res) => {
        const newTask = res.data;
        setTasks((prev) => [...prev, newTask]);
        setTaskInput("");

        // Update allTasks and taskMap
        setAllTasks((prev) => [...prev, newTask]);
        setTaskMap((prev) => {
          const updated = { ...prev };
          if (!updated[formattedDate]) updated[formattedDate] = [];
          updated[formattedDate].push(newTask);
          return updated;
        });
      })
      .catch((err) => console.error(err));
  };

  // Toggle completion
  const toggleTask = (taskId) => {
    toggleTaskStatus(taskId)
      .then((res) => {
        const updatedTask = res.data;
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );

        setAllTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );

        setTaskMap((prev) => {
          const updated = { ...prev };
          const dayTasks = updated[updatedTask.date].map((t) =>
            t._id === taskId ? updatedTask : t
          );
          updated[updatedTask.date] = dayTasks;
          return updated;
        });
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="planner-container">
      {/* Header with title + dashboard icon */}
      <div className="planner-header">
        <h1 className="planner-title"> Calendar Planner</h1>
        <div className="summary-icon">
          📜
          <div className="tooltip">
            <p>Finished tasks: {weeklySummary.finished}</p>
            <p>Unfinished tasks: {weeklySummary.unfinished}</p>
            <p>Total tasks: {weeklySummary.total}</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <Calendar
        onChange={setDate}
        value={date}
        className="planner-calendar"
        tileContent={({ date }) => {
          const dayStr = date.toISOString().split("T")[0];
          const dayTasks = taskMap[dayStr] || [];

          return (
            <div className="calendar-dots">
              {dayTasks.map((task, idx) => (
                <span key={idx} className={`dot ${task.type}`}></span>
              ))}
            </div>
          );
        }}
      />

      <p className="selected-date">Selected date: {formattedDate}</p>

      <div className="task-input-container">
        <input
          type="text"
          value={taskInput}
          placeholder="Add a task"
          onChange={(e) => setTaskInput(e.target.value)}
          className="task-input"
        />

        <select
          value={taskType}
          onChange={(e) => setTaskType(e.target.value)}
          style={{ padding: 10, marginRight: 5 }}
        >
          <option value="exam">Exam</option>
          <option value="assignment">Assignment</option>
          <option value="quiz">Quiz</option>
          <option value="homework">Homework</option>
        </select>

        <button onClick={addTask} className="add-task-btn">
          Add
        </button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task._id}
            className={`task-item ${task.completed ? "completed" : ""}`}
            onClick={() => toggleTask(task._id)}
          >
            <span className={`task-tag ${task.type}`}>
              {task.type.toUpperCase()}
            </span>
            {task.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Planner;
