
import { useEffect, useState } from "react";
import {
    getFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
} from "../api/flashcardApi";

export default function FlashcardManager() {
    const [flashcards, setFlashcards] = useState([]);
    const [form, setForm] = useState({
        question: "",
        answer: "",
        category: "",
        difficulty: "",
    });


    const [filters, setFilters] = useState({
        search: "",
        category: "",
        difficulty: "",
    });

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 5,
        totalPages: 1,
    });

    const [editingId, setEditingId] = useState(null);

    // ------------------- HANDLERS -------------------
    const handleInputChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
    };

    const handleAddOrUpdate = async () => {
        if (editingId) {
            const res = await updateFlashcard(editingId, form);
            if (res.success) cancelEditing();
        } else {
            const res = await createFlashcard(form);
            if (res.success) setForm({ question: "", answer: "", category: "", difficulty: "" });
        }
        fetchFlashcardsHandler();
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
        else alert(res.message);
    };

    const handlePrevPage = () => {
        setPagination(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }));
    };

    const handleNextPage = () => {
        setPagination(prev => ({ ...prev, page: Math.min(prev.page + 1, prev.totalPages) }));
    };

    const resetFilters = () => setFilters({search: "", category: "", difficulty: "" });


    // ------------------- FETCHING -------------------
    // const fetchFlashcards = async (appliedFilters = filters) => {
    //     try {
    //         const res = await getFlashcards(appliedFilters, pagination.page, pagination.limit);
    //         if (res.success) {
    //             setFlashcards(res.data);
    //             setPagination(prev => ({ ...prev, totalPages: res.totalPages }));
    //         }
    //     } catch (err) {
    //         console.error("Error fetching flashcards:", err);
    //     }
    // };

    const fetchFlashcardsHandler = async () => {
        const res = await getFlashcards(filters, pagination.page, pagination.limit);
        if (res.success) {
        setFlashcards(res.data);
        setPagination(prev => ({ ...prev, totalPages: res.totalPages || 1}));
        }
    };

    useEffect(() => {
        fetchFlashcardsHandler();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters, pagination.page, pagination.limit]);

    // ------------------- RENDER -------------------
    return (
        <div>
            <h2>Flashcards Manager</h2>

            {/* Filters */}
            <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
                <input name="category" placeholder="Filter Category" value={filters.category} onChange={handleFilterChange} />
                <select name="difficulty" value={filters.difficulty} onChange={handleFilterChange} style={{ marginLeft: 5 }}>
                    <option value="">All Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <button onClick={resetFilters} style={{ marginLeft: 5 }}>Reset</button>
            </div>

            {/* Add/Edit Form */}
            <div style={{ marginBottom: 20 }}>
                <input name="question" placeholder="Question" value={form.question} onChange={handleInputChange} />
                <input name="answer" placeholder="Answer" value={form.answer} onChange={handleInputChange} />
                <input name="category" placeholder="Category" value={form.category} onChange={handleInputChange} />
                <select name="difficulty" value={form.difficulty} onChange={handleInputChange}>
                    <option value="">Select Difficulty</option>
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                </select>
                <button onClick={handleAddOrUpdate}>{editingId ? "Update" : "Add"}</button>
                {editingId && <button onClick={cancelEditing}>Cancel</button>}
            </div>

            {/* Flashcards */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
                {flashcards.map(fc => (
                    <div key={fc._id} className="flashcard">
                        <div className="flashcard-inner">
                            <div className="flashcard-front">
                                {fc.question}
                            </div>
                            <div className="flashcard-back">
                                {fc.answer}
                                <div style={{ marginTop: 10 }}>
                                    <button onClick={() => startEditing(fc)}>Edit</button>
                                    <button onClick={() => handleDelete(fc._id)}>Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Pagination */}
            {<div style={{ marginTop: 20 }}>
                <button disabled={pagination.page <= 1} onClick={handlePrevPage}>Previous</button>
                <span style={{ margin: "0 10px" }}>
                    Page {pagination.page} of {pagination.totalPages}
                </span>
                <button disabled={pagination.page >= pagination.totalPages} onClick={handleNextPage}>Next</button>
            </div>
}

            {/* ---------------- CSS ---------------- */}
            <style jsx>{`
                .flashcard {
                    width: 200px;
                    height: 150px;
                    perspective: 1000px;
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
                    color: white;
                    font-weight: bold;
                }
                .flashcard-front {
                    background: purple;
                }
                .flashcard-back {
                    background: silver;
                    color: black;
                    transform: rotateY(180deg);
                    flex-direction: column;
                }
                button {
                    margin: 5px;
                    padding: 5px 10px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    background-color: purple;
                    color: white;
                }
                button:hover {
                    background-color: darkviolet;
                }
            `}</style>
        </div>
    );
};
