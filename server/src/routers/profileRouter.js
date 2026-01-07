import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserStats,
} from "../controllers/profileController.js";

const profileRouter = express.Router();

// Get user profile and stats (was having issues since controller was trying to create new user)
profileRouter.get("/:userId", getProfile);
profileRouter.get("/:userId/stats", getUserStats);

// Update user profile and password
profileRouter.put("/:userId", updateProfile);
profileRouter.put("/:userId/password", changePassword);

export default profileRouter;