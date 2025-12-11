import { useState } from "react";
import FlashcardManager from "./components/FlashcardManager";
import FlashcardReview from "./components/FlashcardReview";

function App() {
  const [activeTab, setActiveTab] = useState("manager"); // "manager" or "review"

  const tabStyle = (tab) => ({
    padding: "10px 20px",
    marginRight: 10,
    cursor: "pointer",
    borderBottom: activeTab === tab ? "3px solid #6A0DAD" : "3px solid transparent",
    fontWeight: activeTab === tab ? "bold" : "normal",
    background: "#F3E5FF",
    borderRadius: "8px 8px 0 0"
  });

  return (
    <div style={{ fontFamily: "Arial", maxWidth: 900, margin: "auto", padding: 20 }}>
      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: 20 }}>
        <div style={tabStyle("manager")} onClick={() => setActiveTab("manager")}>
          Manage Flashcards
        </div>
        <div style={tabStyle("review")} onClick={() => setActiveTab("review")}>
          Review Flashcards
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: 20,
        background: "#F3E5FF",
        borderRadius: "0 8px 8px 8px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        {activeTab === "manager" && <FlashcardManager />}
        {activeTab === "review" && <FlashcardReview />}
      </div>
    </div>
  );
}

export default App;
