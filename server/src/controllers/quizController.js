import openai from '../utils/openaiClient.js';
import Quiz from '../models/quizModel.js';

export const generateQuizByTopic = async (req, res) => {
    const { topic } = req.body;

    try {
        const response = await openai.chat.completions.create({
            // OpenRouter will try these in order if one is rate-limited
            model: "google/gemini-2.0-flash-exp:free", 
            extra_body: {
                "models": [
                    "meta-llama/llama-3.1-8b-instruct:free",
                    "mistralai/mistral-7b-instruct:free",
                    "qwen/qwen-2.5-72b-instruct:free"
                ]
            },
            messages: [
                { 
                    role: "system", 
                    content: "You are a quiz generator. Output ONLY a raw JSON array of 10 MCQs. No markdown, no intro text." 
                },
                { 
                    role: "user", 
                    content: `Topic: ${topic}. Format: [{"question": "...", "options": ["a", "b", "c", "d"], "answer": "correct string"}]` 
                }
            ],
            response_format: { type: "json_object" }
        });

        let rawContent = response.choices[0].message.content;

        // Clean markdown if the AI ignored the "no markdown" instruction
        if (rawContent.includes("```")) {
            rawContent = rawContent.replace(/```json|```/g, "").trim();
        }

        const quizData = JSON.parse(rawContent);

        // --- NEW: SAVE TO DATABASE ---
        // We handle cases where AI might wrap the array in an object like { "quizzes": [...] }
        const questionsArray = Array.isArray(quizData) ? quizData : (quizData.quizzes || quizData.questions);

        const savedQuiz = await Quiz.create({
            topic: topic,
            questions: questionsArray
        });

        res.status(200).json({
            success: true,
            data: quizData
        });

    } catch (error) {
        console.error("Quiz Generation/Saving Error:", error.message);
        
        // Distinguish between AI errors and Database errors
        const statusCode = error.name === 'ValidationError' ? 400 : 500;
        res.status(error.status || statusCode).json({ 
            success: false, 
            message: error.message || "An error occurred while generating your quiz." 
        });
    }
};