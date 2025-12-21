import dotenv from "dotenv";
dotenv.config();

export const serverPort = process.env.SERVER_PORT || 3030;
export const mongodbURL = process.env.MONGODB_ATLAS_URL || "mongodb://localhost:27017/Edventure";
export const API = process.env.OPENAI_API_KEY
