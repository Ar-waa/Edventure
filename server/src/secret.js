import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix for "path is not defined"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This tells dotenv to look one level up from 'src' to find the .env file
dotenv.config({ path: path.join(__dirname, "../.env") });

export const serverPort = process.env.PORT || 5000;
export const mongodbURL = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Edventure";
export const API = process.env.OPENAI_API_KEY;

console.log("My API Key is:", process.env.OPENAI_API_KEY);
