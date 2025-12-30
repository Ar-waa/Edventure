import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FlashcardsPage from "./pages/FlashcardsPage";
import PlannerPage from "./pages/PlannerPage";
import Milestones from "./pages/milestonePage";
import QuizPage from "./pages/quizPage";

// 1. Create a wrapper for pages that need the Navbar
const NavLayout = ({ children }) => (
  <>
    <nav style={{ padding: 20, background: "#6A0DAD", display: "flex", gap: "20px" }}>
      <Link to="/" style={{ color: "#fff" }}>Flashcards</Link>
      <Link to="/planner" style={{ color: "#fff" }}>Planner</Link>
      <Link to="/milestones" style={{ color: "#fff" }}>Milestones</Link>
      <Link to="/quiz" style={{ color: "#fff", marginLeft: "auto" }}>Go to Quiz</Link>
    </nav>
    {children}
  </>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Main Pages with Navbar */}
        <Route path="/" element={<NavLayout><FlashcardsPage /></NavLayout>} />
        <Route path="/planner" element={<NavLayout><PlannerPage /></NavLayout>} />
        <Route path="/milestones" element={<NavLayout><Milestones /></NavLayout>} />

        {/* Quiz Page without Navbar */}
        <Route path="/quiz" element={<QuizPage />} />

        {/* Fallback for typos */}
        <Route path="*" element={<NavLayout><h2>404: Page Not Found</h2></NavLayout>} />
      </Routes>
    </Router>
  );
}

export default App;