import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FlashcardsPage from "./pages/FlashcardsPage";
import PlannerPage from "./pages/PlannerPage";

function App() {
  return (
    <Router>
      {/* Simple Navigation */}
      <nav style={{ padding: 20, background: "#6A0DAD" }}>
        <Link to="/" style={{ color: "#fff", marginRight: 20 }}>
          Flashcards
        </Link>
        <Link to="/planner" style={{ color: "#fff" }}>
          Planner
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<FlashcardsPage />} />
        <Route path="/planner" element={<PlannerPage />} />
      </Routes>
    </Router>
  );
}

export default App;
