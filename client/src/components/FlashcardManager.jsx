// FlashcardManager.jsx
import { useEffect, useState } from "react";
import {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  generateFlashcards,
} from "../api/flashcardApi";

export default function FlashcardManager() {
  const [flashcards, setFlashcards] = useState([]);
  const [form, setForm] = useState({
    question: "",
    answer: "",
    category: "",
    difficulty: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [sparkles, setSparkles] = useState([]); // For neon sparkles on card hover

  // ------------------- Handlers -------------------
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchFlashcardsHandler = async () => {
    const res = await getFlashcards({}, 1, 20);
    if (res.success) setFlashcards(res.data);
  };

  const startEditing = (fc) => {
    setEditingId(fc._id);
    setForm({
      question: fc.question,
      answer: fc.answer,
      category: fc.category,
      difficulty: fc.difficulty,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setForm({ question: "", answer: "", category: "", difficulty: "" });
  };

  const handleAddOrUpdate = async () => {
    if (editingId) {
      const res = await updateFlashcard(editingId, form);
      if (res.success) cancelEditing();
    } else {
      const res = await createFlashcard(form);
      if (res.success)
        setForm({ question: "", answer: "", category: "", difficulty: "" });
    }
    fetchFlashcardsHandler();
  };

  const handleDelete = async (id) => {
    const res = await deleteFlashcard(id);
    if (res.success) fetchFlashcardsHandler();
  };

  useEffect(() => {
    fetchFlashcardsHandler();
  }, []);

  // ------------------- RENDER -------------------
  return (
    <div className="flashcard-container">
      <h2 className="flashcard-title">💎 FLASHCARD ARMORY</h2>

      {/* Add/Edit Form */}
      <div className="flashcard-form">
        <input
          name="question"
          placeholder="Question"
          value={form.question}
          onChange={handleInputChange}
        />
        <input
          name="answer"
          placeholder="Answer"
          value={form.answer}
          onChange={handleInputChange}
        />
        <input
          name="category"
          placeholder="Category"
          value={form.category}
          onChange={handleInputChange}
        />
        <select
          name="difficulty"
          value={form.difficulty}
          onChange={handleInputChange}
        >
          <option value="">Select Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={handleAddOrUpdate}>
          {editingId ? "Update" : "Add"}
        </button>
        {editingId && <button onClick={cancelEditing}>Cancel</button>}
      </div>

      {/* Flashcards */}
      <div className="flashcards-grid">
        {flashcards.map((fc) => (
          <div
            key={fc._id}
            className="flashcard"
            onMouseEnter={() =>
              setSparkles((prev) => [...prev, { id: fc._id + Date.now() }])
            }
          >
            <div className="flashcard-inner">
              <div className="flashcard-front">{fc.question}</div>
              <div className="flashcard-back">
                {fc.answer}
                <div className="flashcard-buttons">
                  <button onClick={() => startEditing(fc)}>Edit</button>
                  <button onClick={() => handleDelete(fc._id)}>Delete</button>
                </div>
              </div>
            </div>

            {/* Sparkles */}
            {sparkles
              .filter((s) => s.id.includes(fc._id))
              .map((s) => (
                <span
                  key={s.id}
                  className="flashcard-sparkle"
                  onAnimationEnd={() =>
                    setSparkles((prev) => prev.filter((sp) => sp.id !== s.id))
                  }
                ></span>
              ))}
          </div>
        ))}
      </div>

      {/* ---------------- CSS ---------------- */}
      <style jsx>{`
        .flashcard-container {
          width: 100vw;
          height: 100vh; 
          padding: 20px;
          box-sizing: border-box;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          font-family: "Press Start 2P", monospace;
          color: #fff;
          display: flex;
          flex-direction: column;
        }

        .flashcard-title {
          text-align: center;
          font-size: 2rem;
          color: #00ffea;
          text-shadow: 0 0 10px #0ff, 0 0 20px #0ff;
          margin-bottom: 20px;
        }

        .flashcard-form {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 30px;
        }

        .flashcard-form input,
        .flashcard-form select {
          padding: 10px;
          border-radius: 5px;
          border: none;
          background: #111;
          color: #0ff;
          font-family: "Press Start 2P", monospace;
        }

        .flashcard-form button {
          padding: 10px 15px;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          background-color: #00ffea;
          color: #111;
          transition: 0.3s;
        }

        .flashcard-form button:hover {
          box-shadow: 0 0 10px #0ff, 0 0 20px #0ff;
        }

        .flashcards-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          flex-grow: 1;
          overflow-y: auto;
          padding: 10px;
          justify-content: flex-start;
        }

        .flashcard {
          width: 200px;
          height: 150px;
          perspective: 1000px;
          position: relative;
        }

        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.6s;
          transform-style: preserve-3d;
          cursor: pointer;
        }

        .flashcard:hover .flashcard-inner {
          transform: rotateY(180deg);
        }

        .flashcard-front,
        .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 10px;
          font-weight: bold;
          padding: 10px;
        }

        .flashcard-front {
          background: linear-gradient(135deg, #1d6fc1, #87CEEB);
          box-shadow: 0 0 10px #0ff, 0 0 20px #00ffff;
          color:  #111;
        }

        .flashcard-back {
          background: #1a1a2e;
          color: #0ff;
          transform: rotateY(180deg);
          flex-direction: column;
          box-shadow: 0 0 10px #0ff, 0 0 20px #00ffff;
        }

        .flashcard-buttons {
          display: flex;
          gap: 5px;
          margin-top: 10px;
        }

        .flashcard-buttons button {
          background-color: #00ffea;
          color: #111;
          border-radius: 5px;
          padding: 5px 10px;
          cursor: pointer;
          font-weight: bold;
        }

        .flashcard-buttons button:hover {
          box-shadow: 0 0 10px #0ff, 0 0 20px #0ff;
        }

        .flashcard-sparkle {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: radial-gradient(circle, #0ff, #fff);
          top: 50%;
          left: 50%;
          animation: sparkleAnim 0.8s ease-out forwards;
          pointer-events: none;
        }

        @keyframes sparkleAnim {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          50% {
            opacity: 0.7;
            transform: translate(-5px, -5px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translate(5px, -10px) scale(0.5);
          }
        }
      `}</style>
    </div>
  );
}
