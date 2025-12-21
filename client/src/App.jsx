import FlashcardsPage from "./pages/FlashcardsPage";
import PlannerPage from "./pages/PlannerPage";
import ProfilePage from "./pages/ProfilePage";

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
        <Link to="/profile" style={{ color: "#fff" }}>
          Profile
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<FlashcardsPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}

export default App;