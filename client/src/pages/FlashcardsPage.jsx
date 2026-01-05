import { useState } from "react";
import FlashcardManager from "../components/FlashcardManager";
import FlashcardReview from "../components/FlashcardReview";

export default function FlashcardsPage() {
  const [activeTab, setActiveTab] = useState("manager");
  const [reviewKey, setReviewKey] = useState(0);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === "manager") setReviewKey(prev => prev + 1);
  };

  const tabStyle = (tab) => ({
    padding: "10px 20px",
    marginRight: 10,
    cursor: "pointer",
    borderBottom: activeTab === tab ? "3px solid rgb(17, 52, 49)" : "3px solid transparent",
    fontWeight: activeTab === tab ? "bold" : "normal",
    background: activeTab === tab ? "#e0ffff" : "#b2fefa", // cyan/light shades
    color: "#003333",
    borderRadius: "8px 8px 0 0",
    transition: "0.3s"
  });

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        width: "100%",
        minHeight: "calc(100vh - 70px)", // full screen minus navbar
        padding: 20,
        background: "#d0f4f7", // light cyan background for page
        boxSizing: "border-box"
      }}
    >
      {/* Tabs */}
      <div style={{ display: "flex", marginBottom: 0 }}>
        <div style={tabStyle("manager")} onClick={() => handleTabSwitch("manager")}>
          Forge Flashcards
        </div>
        <div style={tabStyle("review")} onClick={() => handleTabSwitch("review")}>
          Review Flashcards
        </div>
      </div>

      {/* Content Area */}
      <div
        style={{
          marginTop: 0,
        //   padding: 20,
          background: "#aef0f3", // slightly darker cyan for content
          borderRadius: "0 8px 8px 8px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          width: "100%",
          minHeight: "calc(100vh - 140px)", // adjust to fill screen under tabs
          boxSizing: "border-box"
        }}
      >
        <div style={{ display: activeTab === "manager" ? "block" : "none" }}>
          <FlashcardManager />
        </div>

        <div style={{ display: activeTab === "review" ? "block" : "none" }}>
          <FlashcardReview key={reviewKey} />
        </div>
      </div>
    </div>
  );
}
