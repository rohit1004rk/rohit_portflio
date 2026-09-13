import express from "express";

import {
  getSkills,
  createSkill,
  updateSkill,
  reorderSkills,
  deleteSkill,
} from "../controllers/skillController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public
router.route("/").get(getSkills).post(protect, admin, createSkill);

// Reorder — Admin only
router.put("/reorder", protect, admin, reorderSkills);

// Update / Delete — Admin only
router
  .route("/:id")
  .put(protect, admin, updateSkill)
  .delete(protect, admin, deleteSkill);

export default router;
