import { useEffect, useState, useCallback } from "react";
import {
    getReviewFlashcards,
    getReviewStats,
    resetReviewSession,
    getCategories 
} from "../api/reviewApi";

export default function FlashcardReview() {
    const [currentCard, setCurrentCard] = useState(null);
    const [flipped, setFlipped] = useState(false);
    const [filters, setFilters] = useState({ category: "", difficulty: "" });
    const [categories, setCategories] = useState([]);
    const [totalInSession, setTotalInSession] = useState(0); 
    const [streak, setStreak] = useState(0); 
    const [totalXp, setTotalXp] = useState(0); // XP State
    const [stats, setStats] = useState({
        total: 0,
        right: 0,
        wrong: 0,
        perCategory: {},
        perDifficulty: {},
    });
    const [reviewFinished, setReviewFinished] = useState(false);
    const [reviewedIds, setReviewedIds] = useState(new Set());

    const startReview = useCallback(async () => {
        setReviewFinished(false);
        setStats({ total: 0, right: 0, wrong: 0, perCategory: {}, perDifficulty: {} });
        setReviewedIds(new Set());
        setStreak(0);
        setTotalXp(0); // Reset XP

        try {
            const [cardRes, statsRes] = await Promise.all([
                getReviewFlashcards(filters),
                getReviewStats() 
            ]);

            if (cardRes.success && cardRes.flashcard) {
                setCurrentCard(cardRes.flashcard);
                setTotalInSession(statsRes.total || cardRes.totalCount || 1);
            } else {
                setCurrentCard(null);
            }
        } catch (err) {
            console.error(err);
        }
    }, [filters]);

    const handleAnswer = async (isCorrect) => {
        if (!currentCard) return;

        try {
            const nextReviewedIds = Array.from(reviewedIds).concat(currentCard._id);
            setReviewedIds(new Set(nextReviewedIds));

            // Logic for XP and Streak
            if (isCorrect) {
                const newStreak = streak + 1;
                setStreak(newStreak);
                // +15 XP Base, +5 XP Streak Bonus
                setTotalXp(prev => prev + 15 + 5);
            } else {
                setStreak(0);
            }

            setStats(prev => {
                const newStats = { ...prev };
                newStats.total += 1;
                if (isCorrect) newStats.right += 1;
                else newStats.wrong += 1;

                const cat = currentCard.category || "Uncategorized";
                const diff = currentCard.difficulty || "Normal";

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

            const res = await getReviewFlashcards({ 
                ...filters, 
                reviewedIds: nextReviewedIds, 
                flashcardId: currentCard._id, 
                isCorrect: isCorrect 
            });

            if (res.success && res.flashcard) {
                setCurrentCard(res.flashcard);
                setFlipped(false);
            } else {
                setCurrentCard(null);
                setReviewFinished(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReset = async () => {
        await resetReviewSession();
        setFilters({ category: "", difficulty: "" });
        setReviewFinished(false);
        setCurrentCard(null);
        setFlipped(false);
        setReviewedIds(new Set());
        setTotalInSession(0);
        setStreak(0);
        setTotalXp(0);
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCategories();
                if (res.success) setCategories(res.categories);
            } catch (err) { console.error(err); }
        };
        fetchCategories();
    }, []);

    const accuracy = stats.total > 0 ? Math.round((stats.right / stats.total) * 100) : 0;
    const progressPercent = totalInSession > 0 ? (stats.total / totalInSession) * 100 : 0;

    return (
        <div className="flashcard-container">
            <h1 className="flashcard-title">FLASHCARD REVIEW</h1>

            {/* HUD: PROGRESS, STREAK, XP */}
            {currentCard && (
                <div className="hud-display">
                    <div className="progress-bar-wrapper">
                        <div className="progress-meta">
                            <span>STAGE {stats.total + 1} / {totalInSession}</span>
                            <span className="xp-count">XP: {totalXp}</span>
                        </div>
                        <div className="progress-track">
                            <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>
                    
                    <div className={`streak-badge ${streak > 4 ? 'mega-streak' : ''}`}>
                        <div className="streak-label">STREAK</div>
                        <div className="streak-count">{streak}</div>
                    </div>
                </div>
            )}

            <div className="filter-bar">
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                    <option value="">ALL CATEGORIES</option>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}>
                    <option value="">ALL DIFFICULTY</option>
                    <option value="easy">EASY</option>
                    <option value="medium">MEDIUM</option>
                    <option value="hard">HARD</option>
                </select>
                <button onClick={startReview}>START SESSION</button>
                <button className="reset-btn" onClick={handleReset}>RESET</button>
            </div>

            <div className="main-display">
                {currentCard ? (
                    <div className="review-ui">
                        <div className={`arcade-card ${flipped ? "is-flipped" : ""}`} onClick={() => setFlipped(!flipped)}>
                            <div className="card-inner">
                                <div className="card-front">
                                    <span className="label">QUESTION</span>
                                    <p className="card-text">{currentCard.question}</p>
                                    <small className="blink">CLICK TO FLIP</small>
                                </div>
                                <div className="card-back">
                                    <span className="label">ANSWER</span>
                                    <p className="card-text">{currentCard.answer}</p>
                                </div>
                            </div>
                        </div>
                        <div className="controls">
                            <button className="btn-success" onClick={(e) => {e.stopPropagation(); handleAnswer(true)}}>
                                [I KNEW IT]
                            </button>
                            <button className="btn-danger" onClick={(e) => {e.stopPropagation(); handleAnswer(false)}}>
                                [I MISSED IT]
                            </button>
                        </div>
                    </div>
                ) : reviewFinished ? (
                    <div className="stats-modal">
                        <h2 className="modal-title">MISSION COMPLETE</h2>
                        
                        <div className="xp-summary">
                            TOTAL XP GAINED: <span className="yellow-text">+{totalXp}</span>
                        </div>

                        <div className="overall-accuracy">
                            ACCURACY: <span className="neon-text">{accuracy}%</span>
                        </div>

                        <div className="stats-columns">
                            <div className="stat-group">
                                <h3>BY CATEGORY</h3>
                                {Object.entries(stats.perCategory).map(([cat, val]) => (
                                    <div key={cat} className="stat-row">
                                        {cat}: <span className="cyan">{val.right}R</span> / <span className="pink">{val.wrong}W</span>
                                    </div>
                                ))}
                            </div>
                            <div className="stat-group">
                                <h3>BY DIFFICULTY</h3>
                                {Object.entries(stats.perDifficulty).map(([diff, val]) => (
                                    <div key={diff} className="stat-row">
                                        {diff.toUpperCase()}: <span className="cyan">{val.right}R</span> / <span className="pink">{val.wrong}W</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button className="save-all-btn" onClick={handleReset}>REPLAY ARCADE</button>
                    </div>
                ) : (
                    <div className="empty-state"><p className="blink">INSERT COIN (SELECT FILTERS & START)</p></div>
                )}
            </div>

            <style jsx>{`
                .flashcard-container {
                    width: 100vw; min-height: 100vh; padding: 40px 20px; box-sizing: border-box;
                    background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
                    font-family: "Press Start 2P", monospace; color: #fff;
                    display: flex; flex-direction: column; align-items: center;
                }
                .flashcard-title { font-size: 2rem; color: #00ffea; text-shadow: 0 0 10px #0ff; margin-bottom: 30px; }

                /* HUD */
                .hud-display { width: 100%; max-width: 600px; display: flex; align-items: flex-end; gap: 20px; margin-bottom: 30px; }
                .progress-bar-wrapper { flex: 1; }
                .progress-meta { display: flex; justify-content: space-between; font-size: 0.5rem; color: #00ffea; margin-bottom: 10px; }
                .xp-count { color: #ffff00; text-shadow: 0 0 5px #ff0; }
                .progress-track { width: 100%; height: 12px; background: #111; border: 2px solid #00ffea; border-radius: 6px; overflow: hidden; }
                .progress-fill { height: 100%; background: #00ffea; box-shadow: 0 0 15px #0ff; transition: width 0.4s ease-out; }

                /* STREAK */
                .streak-badge { 
                    padding: 8px 12px; border: 2px solid #0ff; border-radius: 8px; text-align: center;
                    background: rgba(0, 255, 234, 0.1); transition: 0.3s;
                }
                .mega-streak { 
                    border-color: #fff; background: rgba(255, 255, 255, 0.2); 
                    box-shadow: 0 0 20px #0ff, inset 0 0 10px #fff; transform: scale(1.1);
                }
                .streak-label { font-size: 0.35rem; color: #0ff; margin-bottom: 5px; }
                .streak-count { font-size: 1rem; color: #fff; text-shadow: 0 0 5px #0ff; }

                .filter-bar { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 40px; }
                .filter-bar select, .filter-bar button {
                    padding: 12px; border-radius: 5px; border: none; background: #111; color: #0ff;
                    font-family: "Press Start 2P", monospace; font-size: 0.6rem; outline: none;
                }
                .filter-bar button { background-color: #00ffea; color: #111; cursor: pointer; }
                .filter-bar .reset-btn { background-color: #ff00ff; color: #fff; }

                .arcade-card { width: 380px; height: 240px; perspective: 1000px; cursor: pointer; }
                .card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
                .is-flipped .card-inner { transform: rotateY(180deg); }
                .card-front, .card-back {
                    position: absolute; width: 100%; height: 100%; backface-visibility: hidden;
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    border: 4px solid #00ffea; border-radius: 15px; padding: 20px; background: #000;
                }
                .card-back { border-color: #ff00ff; transform: rotateY(180deg); }
                .card-text { font-size: 0.9rem; line-height: 1.4; text-align: center; }
                .label { position: absolute; top: 12px; left: 12px; font-size: 0.4rem; color: #555; }

                .controls { display: flex; gap: 20px; margin-top: 30px; justify-content: center; width: 100%; }
                .btn-success, .btn-danger {
                    padding: 40px 20px; border: 2px solid #00ffea; background: transparent; 
                    color: #00ffea; font-family: "Press Start 2P", monospace; font-size: 0.6rem; cursor: pointer;
                }
                .btn-danger { border-color: #ff00ff; color: #ff00ff; }

                /* STATS MODAL */
                .stats-modal {
                    background: #111; border: 4px solid #ff00ff; padding: 40px;
                    width: 700px; box-shadow: 0 0 30px #ff00ff; text-align: center;
                }
                .modal-title { font-size: 1.8rem; color: #ff00ff; margin-bottom: 30px; }
                .xp-summary { font-size: 1.2rem; color: #fff; margin-bottom: 10px; }
                .yellow-text { color: #ffff00; text-shadow: 0 0 10px #ff0; }
                .overall-accuracy { margin-bottom: 35px; font-size: 1.2rem; border-bottom: 2px dashed #444; padding-bottom: 20px; }
                .stats-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; text-align: left; }
                .stat-group h3 { font-size: 0.8rem; color: #00ffea; margin-bottom: 20px; text-decoration: underline; }
                .stat-row { font-size: 0.75rem; margin-bottom: 12px; color: #eee; }
                .cyan { color: #00ffea; }
                .pink { color: #ff00ff; }
                .neon-text { color: #00ffea; text-shadow: 0 0 5px #0ff; }
                .save-all-btn { width: 100%; background: #00ffea; color: #111; padding: 18px; margin-top: 40px; cursor: pointer; font-family: "Press Start 2P"; }

                .blink { animation: blinker 1.5s linear infinite; font-size: 0.5rem; margin-top: 15px; color: #555; }
                @keyframes blinker { 50% { opacity: 0; } }
                .empty-state { margin-top: 100px; text-align: center; color: #0ff; }
            `}</style>
        </div>
    );
}