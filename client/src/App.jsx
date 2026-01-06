import { useState, useEffect } from 'react';
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

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);

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
      });
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

  return (
    <Router>
      {/*Navbar - only show when authenticated */}
      {isAuthenticated && (
        <nav className="navbar">
          <Link to="/">Flashcards    </Link>
          <Link to="/planner">Planner     </Link>
          <Link to="/milestones">Milestones     </Link>
          <Link to="/timer" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <TimerIcon />
            Timer    
          </Link>
          <Link to="/profile" style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <UserIcon />
            Profile      
          </Link>
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
            <ProtectedRoute>
              <FlashcardsPage />
            </ProtectedRoute>
          } />
          <Route path="/planner" element={
            <ProtectedRoute>
              <PlannerPage />
            </ProtectedRoute>
          } />
          <Route path="/milestones" element={
            <ProtectedRoute>
              <Milestones />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/profile/settings" element={
            <ProtectedRoute>
              <ProfileSettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/timer" element={
            <ProtectedRoute>
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