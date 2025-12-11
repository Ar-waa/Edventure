import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  _id: String,
  userId: String,
  type: String,   // "focus" or "break"
  durationSeconds: Number,
  date: String
});

export default mongoose.model("StudySession", sessionSchema);
