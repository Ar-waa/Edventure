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
        borderBottom: activeTab === tab ? "3px solid #6A0DAD" : "3px solid transparent",
        fontWeight: activeTab === tab ? "bold" : "normal",
        background: "#F3E5FF",
        borderRadius: "8px 8px 0 0"
    });

    return (
        <div style={{ fontFamily: "Arial", maxWidth: 900, margin: "auto", padding: 20 }}>
        <div style={{ display: "flex", marginBottom: 20 }}>
            <div style={tabStyle("manager")} onClick={() => handleTabSwitch("manager")}>
            Forge Flashcards
            </div>
            <div style={tabStyle("review")} onClick={() => handleTabSwitch("review")}>
            Review Flashcards
            </div>
        </div>

        <div
            style={{
            padding: 20,
            background: "#F3E5FF",
            borderRadius: "0 8px 8px 8px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
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
