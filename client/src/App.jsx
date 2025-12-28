import FlashcardsPage from "./pages/FlashcardsPage";
import PlannerPage from "./pages/PlannerPage";
<<<<<<< Updated upstream
import ProfilePage from "./pages/ProfilePage";
=======
import Milestones from "./pages/milestonePage";
import ProfilePage from "./pages/ProfilePagehardcoded";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";

>>>>>>> Stashed changes

function App() {
  const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style={{ verticalAlign: 'middle' }}>
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
    </svg>
  );

  return (
    <Router>
      {/* Simple Navigation */}
      <nav style={{ 
        padding: "20px", 
        background: "#6A0DAD",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"}}>
        <Link to="/" style={{ color: "#fff", marginRight: 20 }}>
          Flashcards
        </Link>
        <Link to="/planner" style={{ color: "#fff" }}>
          Planner
        </Link>
<<<<<<< Updated upstream
        <Link to="/profile" style={{ color: "#fff" }}>
=======
        <Link 
          to="/profile" 
          style={{ 
            color: "#fff", 
            display: "flex", 
            alignItems: "center", 
            gap: 8,
            textDecoration: "none"
          }}>
          <UserIcon />
>>>>>>> Stashed changes
          Profile
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<FlashcardsPage />} />
        <Route path="/planner" element={<PlannerPage />} />
<<<<<<< Updated upstream
        <Route path="/profile" element={<ProfilePage />} />
=======
        <Route path="/milestones" element={<Milestones />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/settings" element={<ProfileSettingsPage />} />
>>>>>>> Stashed changes
      </Routes>
    </Router>
  );
}

export default App;