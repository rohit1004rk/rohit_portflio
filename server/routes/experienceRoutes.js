import express from "express";

import {
  getExperiences,
  getVisibleExperiences,
  createExperience,
  updateExperience,
  reorderExperiences,
  deleteExperience,
} from "../controllers/experienceController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Public ────────────────────────────────────────────────
// Only visible experiences are returned to the portfolio.
router.get("/visible", getVisibleExperiences);

// ── Admin ─────────────────────────────────────────────────
// Get all experiences.
router.get("/", protect, admin, getExperiences);

// Create a new experience.
router.post("/", protect, admin, createExperience);

// Save drag-and-drop display order.
router.put("/reorder", protect, admin, reorderExperiences);

// Update one experience.
router.put("/:id", protect, admin, updateExperience);

// Delete one experience.
router.delete("/:id", protect, admin, deleteExperience);

export default router;
