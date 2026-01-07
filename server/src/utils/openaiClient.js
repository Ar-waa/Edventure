import OpenAI from 'openai';
import { API } from '../secret.js';

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1", // This routes requests to OpenRouter
    apiKey: API,
    defaultHeaders: {
        "HTTP-Referer": "http://127.0.0.1:5173", // Optional, for OpenRouter rankings
        "X-Title": "Edventure Quiz App", 
    }
});

export default openai;