import { useEffect, useState, useCallback } from "react";
import {
    getReviewFlashcards,
    getReviewStats,
    resetReviewSession,
    getFlashcardDetailedStats,
    getCategories 
} from "../api/reviewApi";

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
    const [reviewedIds, setReviewedIds] = useState(new Set());

    const startReview = useCallback(async () => {
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
        setReviewedIds(new Set());

        try {
            const res = await getReviewFlashcards(filters);
            setCurrentCard(res.success ? res.flashcard || null : null);
        } catch (err) {
            console.error(err);
        }
    }, [filters]);

    const handleAnswer = async (isCorrect) => {
        if (!currentCard) return;

        try {
            setReviewedIds(prev => new Set(prev).add(currentCard._id));

            // Update stats
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

            // Load next card
            const res = await getReviewFlashcards({ ...filters, reviewedIds: Array.from(reviewedIds) });
            if (res.success && res.flashcard) {
                setCurrentCard(res.flashcard);
                setFlipped(false);
                setCardStats(null);
            } else {
                setCurrentCard(null);
                setReviewFinished(true);
                const statsRes = await getReviewStats();
                if (statsRes.success) {
                    setReviewStats(statsRes);
                    setShowOverallStats(true);
                }
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReset = async () => {
        await resetReviewSession();
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
        setReviewedIds(new Set());
        await startReview();
    };

    const fetchCardStats = async (id) => {
        try {
            const res = await getFlashcardDetailedStats(id);
            if (res.success) setCardStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCategories();
                if (res.success) setCategories(res.categories);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div style={{
            width: "100%",
            minHeight: "calc(100vh - 70px)", // full screen minus navbar
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
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>

                <select
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                >
                    <option value="">All Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>

                <button
                    onClick={startReview}
                    style={{
                        padding: "8px 16px",
                        background: "#008B8B",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer"
                    }}
                >
                    Start Review
                </button>
            </div>

            {/* Flashcard */}
            {currentCard ? (
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
                <h3 style={{ textAlign: "center", color: "#006666" }}>Review session completed!</h3>
            ) : (
                <h3 style={{ textAlign: "center", color: "#006666" }}>Click "Start Review" to begin</h3>
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
                        ✅ Right
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
                        ❌ Wrong
                    </button>
                </div>
            )}

            {/* Reset Session Button */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <button
                    onClick={handleReset}
                    style={{
                        padding: "8px 20px",
                        background: "#008B8B",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        cursor: "pointer",
                    }}
                >
                    Reset Session
                </button>
            </div>

            {/* Overall stats */}
            {showOverallStats && reviewStats && (
                <div style={{
                    maxWidth: 400,
                    margin: "auto",
                    background: "#b2fefa",
                    padding: 20,
                    borderRadius: 10,
                    textAlign: "center"
                }}>
                    <h3 style={{ color: "#008B8B" }}>Review Stats</h3>
                    <p><strong>Total Answered:</strong> {stats.total}</p>
                    <p><strong>Right:</strong> {stats.right}</p>
                    <p><strong>Wrong:</strong> {stats.wrong}</p>

                    <h4>Category Breakdown</h4>
                    {stats.perCategory && Object.entries(stats.perCategory).map(([cat, data]) => (
                        <p key={cat}>{cat}: ✅ {data.right} | ❌ {data.wrong}</p>
                    ))}

                    <h4>Difficulty Breakdown</h4>
                    {stats.perDifficulty && Object.entries(stats.perDifficulty).map(([diff, data]) => (
                        <p key={diff}>{diff}: ✅ {data.right} | ❌ {data.wrong}</p>
                    ))}

                    <p><strong>Total Reviewed (All Time):</strong> {reviewStats.totalReviewed}</p>
                    <p><strong>Accuracy (All Time):</strong> {reviewStats.accuracy}%</p>
                </div>
            )}
        </div>
    );
}
