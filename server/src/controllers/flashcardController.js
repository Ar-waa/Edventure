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

// GET flashcards - PRIVATE ONLY
export const getFlashcards = async (req, res) => {
  try {
    const { search, category, difficulty, page = 1, limit = 5 } = req.query;
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to view flashcards'
      });
    }

    const query = { userId: userId }; // ONLY user's own flashcards
    
    if (search) query.question = { $regex: search, $options: "i" };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const total = await Flashcard.countDocuments(query);
    const flashcards = await Flashcard.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: flashcards,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Error getting flashcards:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE a flashcard
export const createFlashcards = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to create flashcards'
      });
    }

    const { question, answer, category, difficulty } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'Question and answer are required'
      });
    }

    const cardData = {
      question: question.trim(),
      answer: answer.trim(),
      category: category ? category.toLowerCase().trim() : 'general',
      difficulty: difficulty || 'easy',
      userId: userId
    };

    const card = await Flashcard.create(cardData);
    res.status(201).json({
      success: true,
      data: card,
    });
  } catch (err) {
    console.error('Error creating flashcard:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// UPDATE a flashcard
export const updateFlashcards = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to update flashcards'
      });
    }

    const flashcard = await Flashcard.findOne({ _id: id, userId: userId });
    
    if (!flashcard) {
      return res.status(404).json({ 
        success: false,
        message: "Flashcard not found or you don't have permission" 
      });
    }

    const updated = await Flashcard.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error('Error updating flashcard:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE a flashcard
export const deleteFlashcards = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to delete flashcards'
      });
    }

    const flashcard = await Flashcard.findOne({ _id: id, userId: userId });
    
    if (!flashcard) {
      return res.status(404).json({ 
        success: false,
        message: "Flashcard not found or you don't have permission" 
      });
    }

    await Flashcard.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Flashcard deleted",
    });
  } catch (err) {
    console.error('Error deleting flashcard:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get categories for current user
export const getCategories = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to view categories'
      });
    }

    const categories = await Flashcard.distinct("category", { userId: userId });
    res.json({ success: true, categories });
  } catch (err) {
    console.error('Error getting categories:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// File extraction function
async function extractTextFromFile(file) {
  const mime = file.mimetype;

  if (mime === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return data.text;
  } else if (mime === "text/plain") {
    return file.buffer.toString("utf-8");
  } else {
    return "";
  }
}

// AI flashcard generation
export const generateFlashcardsFromAI = async (req, res) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'You must be logged in to generate flashcards'
      });
    }

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

      // Images → send directly
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

    // Save AI-generated flashcards to user's collection
    const savedFlashcards = [];
    for (const cardData of usableFlashcards) {
      try {
        const card = await Flashcard.create({
          question: cardData.question.trim(),
          answer: cardData.answer.trim(),
          category: (cardData.category || 'general').toLowerCase().trim(),
          difficulty: cardData.difficulty || 'easy',
          userId: userId
        });
        savedFlashcards.push(card);
      } catch (saveErr) {
        console.error('Error saving AI-generated flashcard:', saveErr);
      }
    }

    return res.status(200).json({ 
      success: true, 
      message: `Generated ${usableFlashcards.length} flashcards`,
      generated: usableFlashcards,
      saved: savedFlashcards 
    });

  } catch (err) {
    console.error("AI generation error:", err);
    if (err.code === "insufficient_quota" || err.status === 429) {
      return res.status(429).json({ success: false, message: "AI credits exhausted" });
    }
    return res.status(500).json({ success: false, message: "Failed to generate flashcards." });
  }
};

export { extractTextFromFile };