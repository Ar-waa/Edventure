import mongoose from "mongoose";

const plannerSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  date: { type: String, required: true },
  text: { type: String, required: true },
  type: {
    type: String,
    enum: ["exam", "assignment", "quiz", "homework"], 
  },
  completed: { type: Boolean, default: false },
});


const Planner = mongoose.model("Planner", plannerSchema);

export default Planner;  

