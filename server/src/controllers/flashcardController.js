import Flashcard from "../models/flashcardModel.js";
import OpenAI from "openai";
import { createRequire } from "module";
import { API } from "../secret.js";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");


const openai = new OpenAI({
    apiKey: API,
    baseURL: "https://openrouter.ai/api/v1",
});


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
                role: "system",
                content: "You are a JSON API.You NEVER explain.You NEVER use markdown.You ONLY output valid JSON."
            },
            {role: "user",
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
    { "question": "string",
    "answer": "string",
    "category": "string",
    "difficulty": "easy"}
    ]
    ${textInput || ""}
            `,
            },
            ],
        },
        ];

        /* ---------- Add text input ---------- */
        if (textInput) {
        messages[1].content.push({
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
            messages[1].content.push({
                type: "text",
                text: extractedText,
            });
            }
        }

        // Images → send directly (NO OCR)
        if (file.mimetype.startsWith("image/")) {
            messages[1].content.push({
            type: "image_url",
            image_url: {
                url: `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
            },
            });
        }
        }

        /* ---------- OpenAI call ---------- */
        const model =
    files.some(f => f.mimetype.startsWith("image/"))
    ? "qwen/qwen-2.5-vl-7b-instruct"
    : "meta-llama/llama-3.2-3b-instruct";
        const completion = await openai.chat.completions.create({

        model,
        messages,
        temperature: 0.2,
        });

const rawOutput = completion.choices[0].message.content;

// Try array first
let jsonText = rawOutput.match(/\[[\s\S]*\]/)?.[0];

// If no array, try object → extract array inside
if (!jsonText) {
            console.error("RAW MODEL OUTPUT:", rawOutput);
            return res.status(500).json({ success: false, message: "AI did not return usable flashcards." });
        }

        let aiFlashcards;
        try {
            aiFlashcards = JSON.parse(jsonText);
        } catch (err) {
            console.error("JSON parse error:", err, rawOutput);
            return res.status(500).json({ success: false, message: "AI returned malformed JSON." });
        }

        const usableFlashcards = aiFlashcards.filter(c => c.question && c.answer && c.category && c.difficulty);

        return res.status(200).json({ success: true, flashcards: usableFlashcards });

    } catch (err) {
        console.error("AI generation error:", err);
        if (err.code === "insufficient_quota" || err.status === 429) {
            return res.status(429).json({ success: false, message: "AI credits exhausted" });
        }
        return res.status(500).json({ success: false, message: "Failed to generate flashcards." });
    }
};

export {
    createFlashcards,
    updateFlashcards,
    deleteFlashcards,
    extractTextFromFile,
};