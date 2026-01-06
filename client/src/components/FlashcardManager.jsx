import { useEffect, useState} from "react";
import {
  getFlashcards,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
  generateFlashcards,
} from "../api/flashcardApi";

export default function FlashcardManager() {
  const [flashcards, setFlashcards] = useState([]);
  const [form, setForm] = useState({ question: "", answer: "", category: "", difficulty: "" });
  const [editingId, setEditingId] = useState(null);
  const [sparkles, setSparkles] = useState([]);
  
  // New States for Filters and AI
  const [filters, setFilters] = useState({ search: "", category: "", difficulty: "" });
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiGeneratedCards, setAiGeneratedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [textInput, setTextInput] = useState("");

  // ------------------- Handlers -------------------
  const fetchFlashcardsHandler = async () => {
    // Pass filters to the API
    const res = await getFlashcards(filters, 1, 20);
    if (res.success) setFlashcards(res.data);
  };

  useEffect(() => {
    fetchFlashcardsHandler();
  }, [filters]); // Re-run when any filter changes

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async () => {
    if (editingId) {
      const res = await updateFlashcard(editingId, form);
      if (res.success) cancelEditing();
    } else {
      await createFlashcard(form);
    }
    setForm({ question: "", answer: "", category: "", difficulty: "" });
    fetchFlashcardsHandler();
  };

  const handleResetFilters = () => {
    setFilters({ search: "", category: "", difficulty: "" });
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

    const handleDelete = async (id) => {
    const res = await deleteFlashcard(id);
    if (res.success) fetchFlashcardsHandler();
  };

  useEffect(() => {
    fetchFlashcardsHandler();
  }, []);

  // ------------------- AI Handlers -------------------
  const handleAiGenerate = async () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("textInput", textInput);
    selectedFiles.forEach(file => formData.append("files", file));

try {
        // IMPORTANT: Pass an object that matches the destructuring in your API helper:
        // { files: Array, text: String }
        const res = await generateFlashcards({ 
            files: selectedFiles, 
            text: textInput 
        });

        if (res.success) {
            setAiGeneratedCards(res.flashcards);
        }
    } catch (err) {
        console.error("AI Error:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Generation failed");
    } finally {
        setLoading(false);
    }
};

  const saveAiCards = async () => {
    for (const card of aiGeneratedCards) {
      await createFlashcard(card);
    }
    setAiGeneratedCards([]);
    setIsAiModalOpen(false);
    fetchFlashcardsHandler();
  };

  // ------------------- RENDER -------------------
  return (
    <div className="flashcard-container">
      <h2 className="flashcard-title">💎 FLASHCARD ARMORY</h2>

      {/* NEW: Filter Bar */}
      <div className="filter-bar">
        <input 
          placeholder="Search..." 
          value={filters.search} 
          onChange={(e) => setFilters({...filters, search: e.target.value})} 
        />
        <input 
          placeholder="Category" 
          value={filters.category} 
          onChange={(e) => setFilters({...filters, category: e.target.value})} 
        />
        <select 
          value={filters.difficulty} 
          onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
        >
          <option value="">All Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={handleResetFilters} className="reset-btn">RESET</button>
      </div>

      {/* Original Add/Edit Form */}
      <div className="flashcard-form">
        <input name="question" placeholder="Question" value={form.question} onChange={handleInputChange} />
        <input name="answer" placeholder="Answer" value={form.answer} onChange={handleInputChange} />
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
        <button onClick={handleAddOrUpdate}>{editingId ? "Update" : "Add"}</button>
        <button onClick={() => setIsAiModalOpen(true)} className="ai-trigger-btn">✨ AI GEN</button>
        {editingId && <button onClick={cancelEditing}>Cancel</button>}
      </div>

      {/* Original Grid */}
      <div className="flashcards-grid">
        {flashcards.map((fc) => (
          <div key={fc._id} className="flashcard" onMouseEnter={() => setSparkles((p) => [...p, { id: fc._id + Date.now() }])}>
            <div className="flashcard-inner">
              <div className="flashcard-front">{fc.question}</div>
              <div className="flashcard-back">
                {fc.answer}
                <div className="flashcard-buttons">
                  <button onClick={() => { startEditing(fc) }}>Edit</button>
                  <button onClick={() => handleDelete(fc._id)}>Delete</button>
                </div>
              </div>
            </div>
            {sparkles.filter((s) => s.id.includes(fc._id)).map((s) => (
              <span key={s.id} className="flashcard-sparkle" onAnimationEnd={() => setSparkles((p) => p.filter((sp) => sp.id !== s.id))}></span>
            ))}
          </div>
        ))}
      </div>

{/* --- FIXED MODAL --- */}
{isAiModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3 className="modal-title">🤖 AI Generated Flashcards</h3>
      <textarea 
        placeholder="PASTE YOUR NOTES HERE..." 
        value={textInput} 
        onChange={(e) => setTextInput(e.target.value)} 
      />
      <div className="file-input-wrapper">
        <input 
          type="file" 
          multiple 
          onChange={(e) => setSelectedFiles(Array.from(e.target.files))} 
        />
      </div>
      <div className="flashcard-buttons" style={{ justifyContent: 'center', marginTop: '20px' }}>
        <button onClick={handleAiGenerate} disabled={loading}>
          {loading ? "PROCESSING..." : "START SCAN"}
        </button>
        <button onClick={() => setIsAiModalOpen(false)}>ABORT</button>
      </div>

      {/* --- AI PREVIEW SECTION --- */}
      {aiGeneratedCards.length > 0 && (
        <div className="ai-preview-panel">
          <h4 style={{ color: '#ff00ff', fontSize: '0.7rem', marginBottom: '15px' }}>
            VERIFY DATA BEFORE COMMIT
          </h4>
          
          {aiGeneratedCards.map((card, idx) => (
            <div key={idx} className="ai-edit-row">
              {/* Row 1: Q & A */}
              <div className="ai-input-group">
                <input 
                  placeholder="Question"
                  value={card.question} 
                  onChange={(e) => {
                    const updated = [...aiGeneratedCards];
                    updated[idx].question = e.target.value;
                    setAiGeneratedCards(updated);
                  }} 
                />
                <input 
                  placeholder="Answer"
                  value={card.answer} 
                  onChange={(e) => {
                    const updated = [...aiGeneratedCards];
                    updated[idx].answer = e.target.value;
                    setAiGeneratedCards(updated);
                  }} 
                />
              </div>

              {/* Row 2: Category & Difficulty */}
              <div className="ai-input-group secondary">
                <input 
                  placeholder="Category (e.g. Science)"
                  value={card.category || ""} 
                  onChange={(e) => {
                    const updated = [...aiGeneratedCards];
                    updated[idx].category = e.target.value;
                    setAiGeneratedCards(updated);
                  }} 
                />
                <select 
                  value={card.difficulty || "medium"} 
                  onChange={(e) => {
                    const updated = [...aiGeneratedCards];
                    updated[idx].difficulty = e.target.value;
                    setAiGeneratedCards(updated);
                  }}
                >
                  <option value="easy">EASY</option>
                  <option value="medium">MEDIUM</option>
                  <option value="hard">HARD</option>
                </select>
              </div>
            </div>
          ))} {/* <--- Ensure .map() closes here */}
          
          <button className="save-all-btn" onClick={saveAiCards}>
            COMMIT TO ARMORY
          </button>
        </div>
      )}
    </div>
  </div>
)}

      <style jsx>{`
        /* --- THE MODAL OVERLAY (The Pop-up logic) --- */
        .modal-overlay { 
          position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
          background: rgba(0,0,0,0.9); display: flex; justify-content: center; 
          align-items: center; z-index: 9999; /* Highest priority */
        }
        .modal-content { 
          background: #111; border: 4px solid #ff00ff; padding: 30px; width: 85%; 
          max-width: 800px; max-height: 85vh; overflow-y: auto; 
          box-shadow: 0 0 30px #ff00ff; font-family: "Press Start 2P", monospace;
        }
        .modal-title { color: #ff00ff; text-shadow: 0 0 10px #ff00ff; text-align: center; margin-bottom: 20px; }
        .modal-content textarea { 
          width: 100%; height: 120px; background: #000; color: #0ff; 
          border: 1px solid #0ff; padding: 10px; font-family: "Press Start 2P", monospace; 
          font-size: 0.6rem; margin-bottom: 15px; 
        }
        .file-input-wrapper { background: #222; padding: 10px; border: 1px dashed #ff00ff; margin-bottom: 10px; font-size: 0.5rem; }
        
        .ai-preview-panel { 
  margin-top: 30px; 
  border-top: 2px dashed #ff00ff; 
  padding-top: 20px; 
}

.ai-edit-row { 
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  padding: 10px;
  background: rgba(255, 0, 255, 0.05); /* Slight pink tint for grouping */
  border-radius: 5px;
}

.ai-input-group { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 10px; 
}

.ai-input-group input, 
.ai-input-group select { 
  background: #000; 
  border: 1px solid #444; 
  color: #fff; 
  padding: 8px; 
  font-family: "Press Start 2P", monospace; 
  font-size: 0.45rem; 
  border-radius: 4px;
}

.ai-input-group input:focus {
  border-color: #0ff;
  outline: none;
}

/* Make the category/difficulty row look slightly different */
.ai-input-group.secondary input,
.ai-input-group.secondary select {
  border-color: #555;
  color: #0ff; /* Cyan text for secondary data */
}
        .save-all-btn { 
          width: 100%; background: #00ffea; color: #111; padding: 15px; 
          font-family: "Press Start 2P", monospace; border: none; cursor: pointer; 
          margin-top: 20px; box-shadow: 0 0 15px #00ffea;
        }
        
        .flashcard-sparkle { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle, #0ff, #fff); top: 50%; left: 50%; animation: sparkleAnim 0.8s ease-out forwards; pointer-events: none; }
        @keyframes sparkleAnim { 
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(5px, -10px) scale(0.5); }
        }

              /* --- FILTER BAR: MATCHING ORIGINAL FORM AESTHETIC --- */
        .filter-bar { 
          display: flex; 
          flex-wrap: wrap; 
          gap: 10px; 
          margin-bottom: 20px; 
          padding: 10px;
        }

        /* Matching your .flashcard-form input/select exactly */
        .filter-bar input, 
        .filter-bar select {
          padding: 10px; 
          border-radius: 5px; 
          border: none; 
          background: #111; 
          color: #0ff;
          font-family: "Press Start 2P", monospace; 
          font-size: 0.6rem;
        }

        /* Matching your .flashcard-form button exactly */
        .filter-bar button {
          padding: 10px 15px; 
          border: none; 
          border-radius: 5px; 
          cursor: pointer;
          background-color: #00ffea; 
          color: #111;
          font-family: "Press Start 2P", monospace;
          font-size: 0.6rem;
          font-weight: bold; 
          transition: 0.3s;
        }

        /* Matching your .flashcard-form button:hover exactly */
        .filter-bar button:hover {
          box-shadow: 0 0 10px #0ff, 0 0 20px #0ff;
        }

        /* Special styling for Reset to keep the Arcade feel but distinguish it */
        .filter-bar .reset-btn {
          background-color: #ff4444; /* Retro Red */
          color: #fff;
        }

        .filter-bar .reset-btn:hover {
          box-shadow: 0 0 10px #ff4444, 0 0 20px #ff4444;
        }

        /* --- KEEPING YOUR ORIGINAL CSS --- */
        .flashcard-container {
          width: 100vw; height: 100vh; padding: 20px; box-sizing: border-box;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          font-family: "Press Start 2P", monospace; color: #fff;
          display: flex; flex-direction: column;
        }
        .flashcard-title {
          text-align: center; font-size: 2rem; color: #00ffea;
          text-shadow: 0 0 10px #0ff, 0 0 20px #0ff; margin-bottom: 20px;
        }
        .flashcard-form { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 30px; }
        .flashcard-form input, .flashcard-form select {
          padding: 10px; border-radius: 5px; border: none; background: #111; color: #0ff;
          font-family: "Press Start 2P", monospace; font-size: 0.6rem;
        }
        .flashcard-form button {
          padding: 10px 15px; border: none; border-radius: 5px; cursor: pointer;
          background-color: #00ffea; color: #111;font-weight: bold; transition: 0.3s;
        }
        .flashcard-form button:hover {
          box-shadow: 0 0 10px #0ff, 0 0 20px #0ff;}

        .flashcards-grid { display: flex; flex-wrap: wrap; gap: 20px; overflow-y: auto; padding: 10px;
          justify-content: flex-start;}

        .flashcard { width: 200px; height: 150px; perspective: 1000px; position: relative; }
        .flashcard-inner {
          position: relative; width: 100%; height: 100%; text-align: center;
          transition: transform 0.6s; transform-style: preserve-3d; cursor: pointer;
        }
        .flashcard:hover .flashcard-inner { transform: rotateY(180deg); }
        .flashcard-front, .flashcard-back {
          position: absolute; width: 100%; height: 100%; backface-visibility: hidden;
          display: flex; justify-content: center; align-items: center; border-radius: 10px; padding: 10px; font-weight: bold;
        }
        .flashcard-front { background: linear-gradient(135deg, #1d6fc1, #87CEEB); box-shadow: 0 0 10px #0ff; color: #111; }
        .flashcard-back { background: #1a1a2e; color: #0ff; transform: rotateY(180deg); flex-direction: column; box-shadow: 0 0 10px #0ff; }
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

        .flashcard-sparkle { position: absolute; width: 10px; height: 10px; border-radius: 50%; background: radial-gradient(circle, #0ff, #fff); top: 50%; left: 50%; animation: sparkleAnim 0.8s ease-out forwards; pointer-events: none; }
        @keyframes sparkleAnim { 0% {
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

        
      `}</style>
    </div>
  );
}