import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Planner.css";
import axios from "axios";

function Planner() {
  const [date, setDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");

  const userId = "123"; // placeholder, replace with actual auth user

  // Fetch tasks whenever date changes
  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/planner/tasks`, {
        params: { date: date.toDateString(), userId },
      })
      .then((res) => setTasks(res.data))
      .catch((err) => console.log(err));
  }, [date]);

  const addTask = () => {
    if (taskInput.trim() === "") return;
    axios
      .post("http://localhost:3001/api/planner/tasks", {
        userId,
        date: date.toDateString(),
        text: taskInput,
      })
      .then((res) => {
        setTasks([...tasks, res.data]);
        setTaskInput("");
      })
      .catch((err) => console.log(err));
  };

  const toggleTask = (taskId) => {
    axios
      .patch(`http://localhost:3001/api/planner/tasks/${taskId}`)
      .then((res) => {
        const updatedTasks = tasks.map((t) =>
          t._id === taskId ? res.data : t
        );
        setTasks(updatedTasks);
      })
      .catch((err) => console.log(err));
  };

  const tasksForDate = tasks;

  return (
    <div className="planner-container">
      <h1 className="planner-title">Planner Page</h1>

      <Calendar onChange={setDate} value={date} className="planner-calendar" />

      <p className="selected-date">Selected date: {date.toDateString()}</p>

      <div className="task-input-container">
        <input
          type="text"
          value={taskInput}
          placeholder="Add a task, goal, or exam"
          onChange={(e) => setTaskInput(e.target.value)}
          className="task-input"
        />
        <button onClick={addTask} className="add-task-btn">
          Add
        </button>
      </div>

      <ul className="task-list">
        {tasksForDate.map((task) => (
          <li
            key={task._id}
            className={`task-item ${task.completed ? "completed" : ""}`}
            onClick={() => toggleTask(task._id)}
          >
            {task.text}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Planner;



