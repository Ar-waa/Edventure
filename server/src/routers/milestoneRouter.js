import express from "express";
import MilestoneController from "../controllers/milestoneController.js";

const router = express.Router();
const milestoneController = new MilestoneController();

router.post("/:userId/create", (req, res) => milestoneController.createMilestone(req, res));

router.put("/:userId/update", (req, res) => milestoneController.updateMilestone(req, res));

router.get("/:userId", (req, res) => milestoneController.getMilestone(req, res));

export default router;
