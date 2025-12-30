import OpenAI from "openai";
import { API } from "../secret.js";

const openai = new OpenAI({
  apiKey: API,
});

export const generateMCQs = async (topic) => {
  const prompt = `
Generate 10 multiple choice questions on the topic "${topic}".

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- Clearly mention the correct answer
- Keep difficulty medium
- Output JSON ONLY in the following format:

[
  {
    "question": "",
    "options": {
      "A": "",
      "B": "",
      "C": "",
      "D": ""
    },
    "correctAnswer": "A"
  }
]
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return JSON.parse(response.choices[0].message.content);
};

