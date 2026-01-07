import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

export const serverPort = process.env.SERVER_PORT || 3030;
export const mongodbURL = process.env.MONGODB_ATLAS_URL || "mongodb://localhost:27017/Edventure";
export const API = process.env.OPENROUTER_API_KEY
