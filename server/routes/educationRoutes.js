import express from "express";

import {
  getEducations,
  getVisibleEducations,
  createEducation,
  updateEducation,
  reorderEducations,
  deleteEducation,
} from "../controllers/educationController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public — only visible education records
router.get("/visible", getVisibleEducations);

// Admin — all education records
router.get("/", protect, admin, getEducations);

// Admin — create education record
router.post("/", protect, admin, createEducation);

// Admin — reorder education records
router.put("/reorder", protect, admin, reorderEducations);

// Admin — update education record
router.put("/:id", protect, admin, updateEducation);

// Admin — delete education record
router.delete("/:id", protect, admin, deleteEducation);

export default router;
