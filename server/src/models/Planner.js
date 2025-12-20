import mongoose from "mongoose";

const plannerSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // you can extend this if you add authentication
  date: { type: String, required: true },
  text: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const Planner = mongoose.model("Planner", plannerSchema);

export default Planner;  

