import { useEffect, useState, useCallback } from "react";
import {
    getReviewFlashcards,
    getReviewStats,
    resetReviewSession,
    getFlashcardDetailedStats,
    getCategories
} from "../api/reviewApi";

export default function FlashcardReview() {
    // -------------------- STATE --------------------
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

    // -------------------- FUNCTIONS --------------------

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
            if (res.success) setCurrentCard(res.flashcard || null);
            else setCurrentCard(null);
        } catch (err) {
            console.error("Error starting review:", err);
        }
    }, [filters]);

    const handleAnswer = async (isCorrect) => {
        if (!currentCard) return;

        try {
            setReviewedIds(prev => new Set(prev).add(currentCard._id));
            await getReviewFlashcards({ flashcardId: currentCard._id, isCorrect });

            // Update session stats
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

            // Load next flashcard
            const res = await getReviewFlashcards({
                ...filters,
                reviewedIds: Array.from(reviewedIds),
            });

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
            console.error("Error submitting answer:", err);
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
            console.error("Error fetching card stats:", err);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCategories();
                if (res.success) setCategories(res.categories);
            } catch (err) {
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // -------------------- RENDER --------------------
    return (
        <div style={{ padding: 30, fontFamily: "Arial" }}>
            <h1 style={{ color: "#6A0DAD" }}>Flashcard Review</h1>

            {/* Filters */}
            <div style={{ marginBottom: 20 }}>
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
                    style={{ marginLeft: 10 }}
                >
                    <option value="">All Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>

                <button onClick={startReview} style={{ marginLeft: 10, padding: "6px 12px" }}>
                    Start Review
                </button>
            </div>

            {/* Flashcard */}
            {currentCard ? (
                <div style={{ textAlign: "center", position: "relative" }}>
                    <div
                        className={`card ${flipped ? "flip" : ""}`}
                        onClick={() => setFlipped(!flipped)}
                    >
                        <div className="card-face card-front">
                            {currentCard.question}
                        </div>
                        <div className="card-face card-back">
                            {currentCard.answer}
                        </div>
                    </div>

                    <button
                        onClick={() => currentCard?._id && fetchCardStats(currentCard._id)}
                        style={{ marginTop: 20, padding: "6px 12px" }}
                    >
                        View Card Stats
                    </button>

                    {cardStats && (
                        <div style={{ marginTop: 10, background: "#EEE", padding: 10, borderRadius: 8 }}>
                            <p><strong>Category:</strong> {cardStats.category}</p>
                            <p><strong>Difficulty:</strong> {cardStats.difficulty}</p>
                            <p><strong>Total Reviewed:</strong> {cardStats.total}</p>
                            <p><strong>Correct:</strong> {cardStats.correct}</p>
                            <p><strong>Accuracy:</strong> {cardStats.accuracy?.toFixed(2)}%</p>
                        </div>
                    )}
                </div>
            ) : reviewFinished ? (
                <h3>Review session completed!</h3>
            ) : (
                <h3>Click "Start Review" to begin</h3>
            )}

            {/* Action buttons */}
            {currentCard && (
                <div style={{ marginTop: 20, textAlign: "center" }}>
                    <button
                        onClick={() => handleAnswer(true)}
                        style={{
                            background: "#6A0DAD",
                            color: "white",
                            padding: "10px 20px",
                            marginRight: 10,
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
            <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                    onClick={handleReset}
                    style={{
                        padding: "8px 20px",
                        background: "#6A0DAD",
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
            {reviewStats && (
                <>
                    <p><strong>Total Reviewed (All Time):</strong> {reviewStats.totalReviewed}</p>
                    <p><strong>Accuracy (All Time):</strong> {reviewStats.accuracy}%</p>
                </>
            )}

            {showOverallStats && (
                <div style={{
                    marginTop: 30,
                    padding: 20,
                    background: "#F3E5FF",
                    borderRadius: 10,
                    width: 350,
                    marginLeft: "auto",
                    marginRight: "auto"
                }}>
                    <h3 style={{ color: "#6A0DAD" }}>Review Stats</h3>
                    <p><strong>Total Answered:</strong> {stats.total}</p>
                    <p><strong>Right:</strong> {stats.right}</p>
                    <p><strong>Wrong:</strong> {stats.wrong}</p>

                    <h4>Category Breakdown</h4>
                    {stats.perCategory &&
                        Object.entries(stats.perCategory).map(([cat, data]) => (
                            <p key={cat}>{cat}: ✅ {data.right} | ❌ {data.wrong}</p>
                        ))}

                    <h4>Difficulty Breakdown</h4>
                    {stats.perDifficulty &&
                        Object.entries(stats.perDifficulty).map(([diff, data]) => (
                            <p key={diff}>{diff}: ✅ {data.right} | ❌ {data.wrong}</p>
                        ))}
                </div>
            )}

            {/* ---------------- CSS ---------------- */}
            <style jsx>{`
                .card {
                    width: 300px;
                    height: 200px;
                    perspective: 1000px;
                    margin: auto;
                    cursor: pointer;
                }

                .card-face {
                    width: 100%;
                    height: 100%;
                    border-radius: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 20px;
                    position: absolute;
                    backface-visibility: hidden;
                    transition: transform 0.5s;
                    text-align: center;
                }

                .card-front {
                    background-color: #B388EB;
                }

                .card-back {
                    background-color: #C0C0C0;
                    transform: rotateY(180deg);
                }

                .card.flip .card-front {
                    transform: rotateY(180deg);
                }

                .card.flip .card-back {
                    transform: rotateY(0deg);
                }
            `}</style>
        </div>
    );
}
