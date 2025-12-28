<<<<<<< Updated upstream
const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/profileController");

router.get("/:userID", getProfile);

module.exports = router;
=======
import express from "express";
import {
  getProfile,
  updateProfile,
  changePassword,
  getUserStats,
  updateUserStats,
} from "../controllers/ProfileController.js";

const profileRouter = express.Router();

profileRouter.get("/:userId", getProfile);
profileRouter.put("/:userId", updateProfile);
profileRouter.put("/:userId/password", changePassword);
profileRouter.get("/:userId/stats", getUserStats);
profileRouter.post("/:userId/stats", updateUserStats);

export default profileRouter;
>>>>>>> Stashed changes
