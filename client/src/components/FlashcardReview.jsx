import { useEffect, useState } from "react";
import {
    getReviewFlashcards,
    submitReviewAnswer,
    resetReviewSession,
    } from "../api/reviewApi";

    export default function FlashcardReview() {
    const [cards, setCards] = useState([]);
    const [index, setIndex] = useState(0);
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

    // Load cards whenever filters change
    useEffect(() => {
        const fetchCards = async () => {
        try {
            const res = await getReviewFlashcards(filters);
            if (res.success) {
            setCards(res.data);
            setIndex(0);
            setFlipped(false);

            // Get unique categories dynamically
            const cats = [...new Set(res.data.map((fc) => fc.category))];
            setCategories(cats);

            if (res.stats) setStats(res.stats);
            }
        } catch (err) {
            console.error("Error loading flashcards:", err);
        }
        };

        fetchCards();
    }, [filters]);

    const currentCard = cards[index];

    const handleAnswer = async (isCorrect) => {
        if (!currentCard) return;

        await submitReviewAnswer({ flashcardId: currentCard._id, isCorrect });

        setStats((prev) => {
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

        setFlipped(false);
        setIndex((prev) => (prev + 1 < cards.length ? prev + 1 : prev));
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
    };

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
                <option key={cat} value={cat}>
                {cat}
                </option>
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
        </div>

        {/* Flashcard */}
        {currentCard ? (
            <div
            onClick={() => setFlipped(!flipped)}
            style={{
                width: 300,
                height: 200,
                margin: "auto",
                background: flipped ? "#C0C0C0" : "#B388EB", // silver / purple
                color: "#000",
                borderRadius: 12,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                fontSize: 20,
                cursor: "pointer",
                transition: "0.5s",
                transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
            }}
            >
            {flipped ? currentCard.answer : currentCard.question}
            </div>
        ) : (
            <h3>No more flashcards to review.</h3>
        )}

        {/* Action buttons */}
        {currentCard && (
            <div style={{ marginTop: 20 }}>
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

        {/* Stats */}
        <div
            style={{
            marginTop: 30,
            padding: 20,
            background: "#F3E5FF",
            borderRadius: 10,
            width: 350,
            marginLeft: "auto",
            marginRight: "auto",
            }}
        >
            <h3 style={{ color: "#6A0DAD" }}>Review Stats</h3>
            <p>
            <strong>Total Answered:</strong> {stats.total}
            </p>
            <p>
            <strong>Right:</strong> {stats.right}
            </p>
            <p>
            <strong>Wrong:</strong> {stats.wrong}
            </p>

            <h4>Category Breakdown</h4>
            {Object.entries(stats.perCategory).map(([cat, data]) => (
            <p key={cat}>
                {cat}: ✅ {data.right} | ❌ {data.wrong}
            </p>
            ))}

            <h4>Difficulty Breakdown</h4>
            {Object.entries(stats.perDifficulty).map(([diff, data]) => (
            <p key={diff}>
                {diff}: ✅ {data.right} | ❌ {data.wrong}
            </p>
            ))}

            <button
            onClick={handleReset}
            style={{
                marginTop: 15,
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
        </div>
    );
    }
