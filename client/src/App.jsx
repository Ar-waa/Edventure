import { useState, useEffect, useRef } from 'react';
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import FlashcardsPage from "./pages/FlashcardsPage";
import PlannerPage from "./pages/PlannerPage";
import Milestones from "./pages/milestonePage";
import ProfilePage from "./pages/ProfilePageDB";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import TimerPage from "./pages/TimerPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { fetchAllTasks } from "./Api/Planner";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  
  useEffect(() => {
    fetch('http://localhost:3030/api/check-auth', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setIsAuthenticated(data.authenticated);
        if (data.authenticated) {
          setUserId(data.userId);
          localStorage.setItem("userId", data.userId);
        }
      })
      .catch(err => console.error("Auth check error:", err));
  }, []);

  
  const updateUpcomingTasks = () => {
    if (!isAuthenticated || !userId) return;

    fetchAllTasks()
      .then(res => {
        const tasks = res.data.data; // Use .data.data to match your Planner API
        const today = new Date();

        const isUpcoming = (taskDate) => {
          const date = new Date(taskDate);
          const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 2;
        };

        const upcoming = tasks.filter((t) => !t.completed && isUpcoming(t.date));
        setUpcomingTasks(upcoming);
      })
      .catch(err => console.error("Tasks fetch error:", err));
  };

  // Fetch upcoming tasks initially and whenever userId/isAuthenticated changes
  useEffect(() => {
    updateUpcomingTasks();
  }, [isAuthenticated, userId]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3030/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    setIsAuthenticated(false);
    setUserId(null);
    setUpcomingTasks([]); // Clear tasks on logout
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ verticalAlign: 'middle' }}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  const TimerIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ verticalAlign: 'middle' }}>
      <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
    </svg>
  );

  const NotificationBell = () => {
    const totalXP = upcomingTasks.length * 10;

    return (
      <div ref={dropdownRef} style={{ position: "relative" }}>
        <button
          onClick={() => setShowDropdown((prev) => !prev)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "#00ffff",
            position: "relative",
            fontSize: "20px",
            fontWeight: "bold",
            textShadow: "0 0 5px #0ff, 0 0 10px #0ff",
          }}
          title="Notifications"
        >
          🔔
          {upcomingTasks.length > 0 && (
            <span
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                width: "10px",
                height: "10px",
                background: "red",
                borderRadius: "50%",
              }}
            ></span>
          )}
        </button>

        {showDropdown && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "30px",
              width: "300px",
              maxHeight: "350px",
              overflowY: "auto",
              background: "rgba(0,0,0,0.9)",
              border: "1px solid #0ff",
              borderRadius: "8px",
              padding: "10px",
              boxShadow: "0 0 15px #0ff",
              zIndex: 1000,
            }}
          >
            <h4 style={{ color: "#0ff", marginBottom: "10px", fontSize: "0.9rem" }}>
              Upcoming Deadlines
            </h4>
            {upcomingTasks.length === 0 ? (
              <p style={{ color: "#fff", fontSize: "0.8rem" }}>No upcoming deadlines</p>
            ) : (
              <>
                {upcomingTasks.map((task) => (
                  <div
                    key={task._id}
                    style={{
                      padding: "5px 0",
                      borderBottom: "1px solid rgba(0,255,255,0.2)",
                      fontSize: "0.8rem",
                      color: "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>{task.text}</span>
                    <span>{new Date(task.date).toLocaleDateString()}</span>
                  </div>
                ))}
                <div
                  style={{
                    marginTop: "10px",
                    padding: "5px",
                    background: "rgba(0,255,255,0.1)",
                    borderRadius: "5px",
                    textAlign: "center",
                    color: "#0ff",
                    fontWeight: "bold",
                    fontSize: "0.8rem",
                  }}
                >
                  🏆 Total XP if completed: {totalXP}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Router>
      {/* Navbar - only show when authenticated */}
      {isAuthenticated && (
        <nav className="navbar">
          <Link to="/">Flashcards</Link>
          <Link to="/planner">Planner</Link>
          <Link to="/milestones">Milestones</Link>
          <Link to="/timer" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <TimerIcon />
            Timer
          </Link>
          <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <UserIcon />
            Profile
          </Link>
          <NotificationBell />
          <button
            onClick={handleLogout}
            style={{
              marginLeft: "auto",
              background: "transparent",
              border: "none",
              color: "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "8px 12px",
              borderRadius: 4,
            }}
          >
            Logout
          </button>
        </nav>
      )}

      <div className="page-content">
        <Routes>
          {/* Public route */}
          <Route path="/login" element={
            <LoginPage 
              setIsAuthenticated={setIsAuthenticated} 
              setUserId={setUserId} 
            />
          } />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <FlashcardsPage />
            </ProtectedRoute>
          } />
          <Route path="/planner" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PlannerPage updateUpcomingTasks={updateUpcomingTasks} />
            </ProtectedRoute>
          } />
          <Route path="/milestones" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Milestones />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/settings" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProfileSettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/timer" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TimerPage />
            </ProtectedRoute>
          } />
          
          {/* Redirect */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
