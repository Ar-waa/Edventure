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
  const [taskMap, setTaskMap] = useState({});
  const [weeklySummary, setWeeklySummary] = useState({
    finished: 0,
    unfinished: 0,
    total: 0,
  });

  const formattedDate = date.toISOString().split("T")[0];
  const [sparkles, setSparkles] = useState([]);

  // Fetch all tasks once
  useEffect(() => {
    fetchAllTasks()
      .then((res) => {
        console.log("All tasks response:", res.data);
        setAllTasks(res.data.data);
        const map = {};
        res.data.data.forEach((task) => {
          if (!map[task.date]) map[task.date] = [];
          map[task.date].push(task);
        });
        setTaskMap(map);
      })
      .catch((err) => {
        console.error("Error fetching all tasks:", err);
        if (err.response?.status === 401) {
          // Not logged in - redirect to login
          window.location.href = "/login";
        }
      });
  }, []);

  // Weekly summary
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
    fetchTasksByDate(formattedDate)
      .then((res) => {
        console.log("Tasks for date response:", res.data);
        setTasks(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching tasks:", err);
        if (err.response?.status === 401) {
          // Not logged in
          setTasks([]);
        }
      });
  }, [formattedDate]);

  // Add task
  const addTask = () => {
    if (!taskInput.trim()) {
      alert("Please enter a task description");
      return;
    }

    const newTaskData = {
      date: formattedDate,
      text: taskInput,
      type: taskType,
    };

    console.log("Adding task:", newTaskData);

    createTask(newTaskData)
      .then((res) => {
        console.log("Task created response:", res.data);
        const newTask = res.data.data;
        setTasks((prev) => [...prev, newTask]);
        setTaskInput("");
        setAllTasks((prev) => [...prev, newTask]);
        setTaskMap((prev) => {
          const updated = { ...prev };
          if (!updated[formattedDate]) updated[formattedDate] = [];
          updated[formattedDate].push(newTask);
          return updated;
        });
      })
      .catch((err) => {
        console.error("Error creating task:", err);
        if (err.response?.status === 401) {
          alert("Please login to add tasks");
          window.location.href = "/login";
        } else {
          alert("Error creating task: " + (err.response?.data?.message || err.message));
        }
      });
  };

  // Toggle completion
  const toggleTask = (taskId) => {
    toggleTaskStatus(taskId)
      .then((res) => {
        const updatedTask = res.data.data;

        if (updatedTask.completed) {
          const sparkleId = `${taskId}-${Date.now()}`;
          setSparkles((prev) => [...prev, { taskId, sparkleId }]);

          setTimeout(() => {
            setSparkles((prev) =>
              prev.filter((s) => s.sparkleId !== sparkleId)
            );
          }, 800);
        }

        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );
        setAllTasks((prev) =>
          prev.map((t) => (t._id === taskId ? updatedTask : t))
        );
        setTaskMap((prev) => {
          const updated = { ...prev };
          const dayTasks = updated[updatedTask.date]?.map((t) =>
            t._id === taskId ? updatedTask : t
          ) || [];
          updated[updatedTask.date] = dayTasks;
          return updated;
        });
      })
      .catch((err) => {
        console.error("Error toggling task:", err);
        if (err.response?.status === 401) {
          alert("Please login to update tasks");
        }
      });
  };

  // Task type emojis
  const taskEmoji = {
    exam: "📚",
    assignment: "📝",
    quiz: "🧪",
    homework: "🏠",
  };

  return (
    <div className="planner-container">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Edventure Stats</h2>
        <div className="badge">🏆 Weekly XP</div>
        <div className="badge">⭐ Finished: {weeklySummary.finished}</div>
        <div className="badge">⚡ Unfinished: {weeklySummary.unfinished}</div>
        <div className="badge">🎖 Total Tasks: {weeklySummary.total}</div>
      </div>

      {/* Main Calendar */}
      <div className="calendar-section">
        <h1 className="planner-title">🪐 Edventure Calendar</h1>

        <Calendar
          onChange={setDate}
          value={date}
          className="planner-calendar"
          tileContent={({ date }) => {
            const dayStr = date.toISOString().split("T")[0];
            const dayTasks = taskMap[dayStr] || [];

            return (
              <div className="calendar-tile-container">
                {dayTasks.map((task, idx) => (
                  <span key={idx} className={`task-icon ${task.type}`}>
                    {taskEmoji[task.type]}
                  </span>
                ))}

                <div className="xp-tooltip">
                  {dayTasks.length > 0 &&
                    `You earned ${
                      dayTasks.filter((t) => t.completed).length * 10
                    } XP today!`}
                </div>
              </div>
            );
          }}
        />

        <p className="selected-date">Selected date: {formattedDate}</p>

        <div className="task-input-container">
          <input
            type="text"
            value={taskInput}
            placeholder="Add a task..."
            onChange={(e) => setTaskInput(e.target.value)}
            className="task-input"
            onKeyPress={(e) => {
              if (e.key === "Enter") addTask();
            }}
          />
          <select
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            className="task-select"
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
              <span className="task-emoji">{taskEmoji[task.type]}</span>
              {task.text}

              {/* Render all active sparkles for this task */}
              {sparkles
                .filter((s) => s.taskId === task._id)
                .map((s) => (
                  <span key={s.sparkleId} className="sparkle"></span>
                ))}
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="task-item" style={{ textAlign: "center", color: "#666", fontStyle: "italic" }}>
              No tasks for this date. Add one above!
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Planner;