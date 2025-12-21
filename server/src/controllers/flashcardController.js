import Flashcard from "../models/flashcardModel.js";
import OpenAI from "openai";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

async function extractTextFromFile(file) {
    const mime = file.mimetype;

    if (mime === "application/pdf") {
        const data = await pdfParse(file.buffer);
        return data.text;
    // } else if (mime.startsWith("image/")) {
    //     // GPT-4V can handle image directly
    //     return file.buffer.toString("base64"); // send base64
    } else if (mime === "text/plain") {
        return file.buffer.toString("utf-8");
    } else {
        return "";
    }
};

    export const generateFlashcardsFromAI = async (req, res) => {
    try {
        const { textInput } = req.body;
        const files = req.files || [];

        if (!textInput && files.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No input provided",
        });
        }

        /* ---------- Build multimodal message ---------- */
        const messages = [
        {
            role: "user",
            content: [
            {
                type: "text",
                text: `
    You are an AI assistant.
    Generate exactly 4 flashcards.

    Each flashcard must include:
    - question
    - answer
    - category
    - difficulty (easy | medium | hard)

    Return ONLY a valid JSON array like:
    [
    { "question": "...", "answer": "...", "category": "...", "difficulty": "easy" }
    ]
            `,
            },
            ],
        },
        ];

        /* ---------- Add text input ---------- */
        if (textInput) {
        messages[0].content.push({
            type: "text",
            text: textInput,
        });
        }

        /* ---------- Add files ---------- */
        for (const file of files) {
        // PDFs / TXT → extract text
        if (
            file.mimetype === "application/pdf" ||
            file.mimetype === "text/plain"
        ) {
            const extractedText = await extractTextFromFile(file);
            if (extractedText) {
            messages[0].content.push({
                type: "text",
                text: extractedText,
            });
            }
        }

        // Images → send directly (NO OCR)
        if (file.mimetype.startsWith("image/")) {
            messages[0].content.push({
            type: "image_url",
            image_url: {
                url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            },
            });
        }
        }

        /* ---------- OpenAI call ---------- */
        const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages,
        temperature: 0.7,
        });

        const rawOutput = completion.choices[0].message.content;

        /* ---------- Parse AI output ---------- */
        let aiFlashcards;
        try {
        aiFlashcards = JSON.parse(rawOutput);
        } catch {
        return res.status(500).json({
            success: false,
            message: "AI returned invalid JSON. Try shorter input.",
        });
        }

        if (!Array.isArray(aiFlashcards) || aiFlashcards.length === 0) {
        return res.status(500).json({
            success: false,
            message: "AI did not generate valid flashcards.",
        });
        }

        return res.status(200).json({
        success: true,
        flashcards: aiFlashcards,
        });

    } catch (err) {
        console.error("AI generation error:", err);

        if (err.code === "insufficient_quota" || err.status === 429) {
        return res.status(429).json({
            success: false,
            message: "AI credits exhausted",
        });
        }

        return res.status(500).json({
        success: false,
        message: "Failed to generate flashcards.",
        });
    }
};

export {
    createFlashcards,
    updateFlashcards,
    deleteFlashcards,
    extractTextFromFile,
};