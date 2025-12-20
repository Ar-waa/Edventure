const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const { serverPort } = require("./secret");

const plannerRouter = require("./routers/plannerRouter");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/edventure") // replace with your URI if using Atlas
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/planner", plannerRouter);

app.listen(serverPort, () => {
  console.log(`Server running at http://localhost:${serverPort}`);
});




