import { useEffect, useState, useCallback } from "react";
import axios from "axios";

export default function FlashcardReview() {
  const [currentCard, setCurrentCard] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [filters, setFilters] = useState({ category: "", difficulty: "" });
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    right: 0,
    wrong: 0,
    perCategory: {},
    perDifficulty: {},
  });
  const [reviewFinished, setReviewFinished] = useState(false);
  const [cardStats, setCardStats] = useState(null);
  const [reviewStats, setReviewStats] = useState(null);
  const [showOverallStats, setShowOverallStats] = useState(false);
  const [reviewedIds, setReviewedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_URL = "http://localhost:3030/api/flashcards";

  const startReview = useCallback(async () => {
    setLoading(true);
    setReviewFinished(false);
    setStats({
      total: 0,
      right: 0,
      wrong: 0,
      perCategory: {},
      perDifficulty: {},
    });
    setCardStats(null);
    setShowOverallStats(false);
    setReviewStats(null);
    setReviewedIds([]);
    setCurrentCard(null);
    setFlipped(false);

    try {
      const res = await axios.post(`${API_URL}/review`, 
        { ...filters, reviewedIds: [] },
        { withCredentials: true }
      );
      
      if (res.data.success) {
        if (res.data.completed) {
          setReviewFinished(true);
        } else {
          setCurrentCard(res.data.flashcard || null);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error starting review: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const handleAnswer = async (isCorrect) => {
    if (!currentCard) return;

    try {
      // Update local stats
      setStats(prev => {
        const newStats = { ...prev };
        newStats.total += 1;
        if (isCorrect) newStats.right += 1;
        else newStats.wrong += 1;

        const cat = currentCard.category;
        const diff = currentCard.difficulty;

        newStats.perCategory[cat] = newStats.perCategory[cat] || { right: 0, wrong: 0 };
        newStats.perDifficulty[diff] = newStats.perDifficulty[diff] || { right: 0, wrong: 0 };

        if (isCorrect) {
          newStats.perCategory[cat].right++;
          newStats.perDifficulty[diff].right++;
        } else {
          newStats.perCategory[cat].wrong++;
          newStats.perDifficulty[diff].wrong++;
        }

        return newStats;
      });

      // Add to reviewed IDs
      const newReviewedIds = [...reviewedIds, currentCard._id];
      setReviewedIds(newReviewedIds);

      // Load next card
      const res = await axios.post(`${API_URL}/review`, 
        { 
          ...filters, 
          flashcardId: currentCard._id,
          isCorrect: isCorrect,
          reviewedIds: newReviewedIds 
        },
        { withCredentials: true }
      );
      
      if (res.data.success) {
        if (res.data.completed) {
          setCurrentCard(null);
          setReviewFinished(true);
          // You might want to fetch overall stats here
        } else if (res.data.flashcard) {
          setCurrentCard(res.data.flashcard);
          setFlipped(false);
          setCardStats(null);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting answer: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReset = async () => {
    setFilters({ category: "", difficulty: "" });
    setStats({
      total: 0,
      right: 0,
      wrong: 0,
      perCategory: {},
      perDifficulty: {},
    });
    setCurrentCard(null);
    setFlipped(false);
    setCardStats(null);
    setShowOverallStats(false);
    setReviewStats(null);
    setReviewedIds([]);
    setReviewFinished(false);
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/categories`, {
        withCredentials: true
      });
      if (res.data.success) setCategories(res.data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div style={{
      width: "100%",
      minHeight: "calc(100vh - 70px)",
      background: "#d0f4f7",
      fontFamily: "Arial, sans-serif",
      padding: 20,
      boxSizing: "border-box"
    }}>
      <h1 style={{ textAlign: "center", color: "#008B8B", marginBottom: 20 }}>Flashcard Review</h1>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          disabled={loading}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filters.difficulty}
          onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
          disabled={loading}
        >
          <option value="">All Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <button
          onClick={startReview}
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#008B8B",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Loading..." : "Start Review"}
        </button>
      </div>

      {/* Flashcard */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 18, color: "#008B8B" }}>Loading review session...</div>
        </div>
      ) : currentCard ? (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <div
            className={`card ${flipped ? "flip" : ""}`}
            onClick={() => setFlipped(!flipped)}
            style={{
              width: 350,
              height: 220,
              perspective: 1000,
              cursor: "pointer",
              position: "relative",
            }}
          >
            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: 12,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 22,
              textAlign: "center",
              backfaceVisibility: "hidden",
              transition: "transform 0.5s",
              background: "#00CED1",
              color: "#fff",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
            }}>
              {currentCard.question}
            </div>

            <div style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              borderRadius: 12,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 22,
              textAlign: "center",
              backfaceVisibility: "hidden",
              transition: "transform 0.5s",
              background: "#20B2AA",
              color: "#fff",
              transform: flipped ? "rotateY(0deg)" : "rotateY(180deg)"
            }}>
              {currentCard.answer}
            </div>
          </div>
        </div>
      ) : reviewFinished ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <h3 style={{ color: "#006666" }}>Review session completed! 🎉</h3>
          <p>You reviewed {stats.total} flashcards</p>
          <p>Correct: {stats.right} | Incorrect: {stats.wrong}</p>
          <button
            onClick={handleReset}
            style={{
              padding: "10px 20px",
              background: "#008B8B",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              marginTop: 20
            }}
          >
            Start New Session
          </button>
        </div>
      ) : (
        <div style={{ textAlign: "center", padding: 40 }}>
          <h3 style={{ color: "#006666" }}>Select filters and click "Start Review" to begin</h3>
        </div>
      )}

      {/* Action buttons */}
      {currentCard && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
          <button
            onClick={() => handleAnswer(true)}
            style={{
              background: "#008B8B",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ✅ Correct
          </button>

          <button
            onClick={() => handleAnswer(false)}
            style={{
              background: "#C0C0C0",
              color: "#000",
              padding: "10px 20px",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            ❌ Incorrect
          </button>
        </div>
      )}

      {/* Session Stats */}
      {stats.total > 0 && (
        <div style={{
          maxWidth: 400,
          margin: "20px auto",
          background: "#b2fefa",
          padding: 20,
          borderRadius: 10,
          textAlign: "center"
        }}>
          <h3 style={{ color: "#008B8B" }}>Session Stats</h3>
          <p><strong>Total Answered:</strong> {stats.total}</p>
          <p><strong>Correct:</strong> {stats.right}</p>
          <p><strong>Incorrect:</strong> {stats.wrong}</p>
          <p><strong>Accuracy:</strong> {stats.total > 0 ? Math.round((stats.right / stats.total) * 100) : 0}%</p>
        </div>
      )}
    </div>
  );
}