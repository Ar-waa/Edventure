import express from "express";
import {
  createProfile,
  getProfile,
  updateProfile,
  login,
  logout
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", createProfile);
router.post("/login", login);

router.post("/logout", logout);
router.get("/:userId", getProfile);
router.put("/:userId", updateProfile);

export default router;
