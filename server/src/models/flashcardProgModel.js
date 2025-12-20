import mongoose from "mongoose";

const progressSchema = new mongoose.Schema(
    {
        flashcard: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Flashcard",
        required: true,
        },
        category: {
        type: String,
        required: true,
        },
        difficulty: {
        type: String,
        required: true,
        },
        isCorrect: {
        type: Boolean,
        required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Progress", progressSchema);
