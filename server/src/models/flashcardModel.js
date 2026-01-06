import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema(
    {
    question: {
        type: String,
        required: true,
        trim: true,
    },
    answer: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        // enum: ["math", "science", "history", "general"],
        // default: "general",
        lowercase: true,
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "easy",
        lowercase: true,
    },

    userId: {
            type: String,
            required: true, // Make it required
            default: "", // Empty string for public flashcards
            index: true, // Add index for faster queries
    },
},

    { timestamps: true }
);

const Flashcard = mongoose.model("Flashcard", flashcardSchema);

export default Flashcard;