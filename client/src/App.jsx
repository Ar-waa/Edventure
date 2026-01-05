import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FlashcardsPage from "./pages/FlashcardsPage";
import PlannerPage from "./pages/PlannerPage";
import Milestones from "./pages/milestonePage";
import ProfilePage from "./pages/ProfilePageDB";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import TimerPage from "./pages/TimerPage";

function App() {
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
      {/* Navbar with Calendar-style UI */}
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
      </nav>

      <div className="page-content">
        <Routes>
          <Route path="/" element={<FlashcardsPage />} />
          <Route path="/planner" element={<PlannerPage />} />
          <Route path="/milestones" element={<Milestones />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/settings" element={<ProfileSettingsPage />} />      
          <Route path="/timer" element={<TimerPage />} />       
        </Routes>
      </div>
    </Router>
  );
}

export default App;
