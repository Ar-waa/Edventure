import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        trim: true
    },
    questions: [
        {
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            answer: { type: String, required: true }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;