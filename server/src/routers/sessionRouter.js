import express from "express";
import { saveSession } from "../controllers/sessionController.js";

const sessionRouter = express.Router();

sessionRouter.post("/", saveSession);

export default sessionRouter;