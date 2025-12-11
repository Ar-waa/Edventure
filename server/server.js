import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import sessionRoutes from "./routes/sessionRoutes.js";

const app = express();

app.use(express.json());
app.use(cors());

 
// Mongo connection
mongoose.connect("mongodb+srv://maimunafairuzesha:zl6uxTNg96VNevcC@cluster0.xjk5thi.mongodb.net/")
  .then(() => console.log("Atlas connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/session", sessionRoutes);

// Start server
app.listen(4000, () => console.log("Server running on http://localhost:4000"));
