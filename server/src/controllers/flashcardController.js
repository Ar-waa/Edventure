// // controllers/flashcardController.js
// const Flashcard = require("../models/flashcardModel");

// // GET all flashcards
// const getFlashcards = async (req, res, next) => {
//     try {
//         const flashcards = await Flashcard.find();
//         res.status(200).json({
//         success: true,
//         data: flashcards,
//         });
//     } catch (err) {
//         next(err);
//     }
// };

import Flashcard from "../models/flashcardModel.js";

export const getFlashcards = async (req, res) => {
    try {
        const { search, category, difficulty, page = 1, limit = 5 } = req.query;

        const query = {};
        if (search) query.question = { $regex: search, $options: "i" };
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        const total = await Flashcard.countDocuments(query); // total matching docs
        const flashcards = await Flashcard.find(query)
            .skip((page - 1) * limit)  // skip previous pages
            .limit(Number(limit));     // limit per page

        res.status(200).json({
            success: true,
            data: flashcards,
            totalPages: Math.ceil(total / limit),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// CREATE a flashcard
const createFlashcards = async (req, res, next) => {
    try {
        const card = await Flashcard.create(req.body);
        res.status(201).json({
        success: true,
        data: card,
        });
    } catch (err) {
        next(err);
    }
};

// UPDATE a flashcard
const updateFlashcards = async (req, res, next) => {
    try {
        const updated = await Flashcard.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
        );

        if (!updated) {
        return res.status(404).json({ message: "Flashcard not found" });
        }

        res.status(200).json({
        success: true,
        data: updated,
        });
    } catch (err) {
        next(err);
    }
};

// DELETE a flashcard
const deleteFlashcards = async (req, res, next) => {
    try {
        const deleted = await Flashcard.findByIdAndDelete(req.params.id);

        if (!deleted) {
        return res.status(404).json({ message: "Flashcard not found" });
        }

        res.status(200).json({
        success: true,
        message: "Flashcard deleted",
        });
    } catch (err) {
        next(err);
    }
};

export {
    createFlashcards,
    updateFlashcards,
    deleteFlashcards,
};