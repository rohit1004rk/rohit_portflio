import express from "express";

import {
  getProjects,
  getProjectBySlug,
  getProjectById,
  createProject,
  updateProject,
  reorderProjects,
  deleteProject,
} from "../controllers/projectController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public: get all projects
// Admin: create project
router.route("/").get(getProjects).post(protect, admin, createProject);

// IMPORTANT:
// Reorder route MUST come before /:id
router.put("/reorder", protect, admin, reorderProjects);

// Public: get project by slug
router.get("/slug/:slug", getProjectBySlug);

// Public: get project by ID
// Admin: update/delete project
router
  .route("/:id")
  .get(getProjectById)
  .put(protect, admin, updateProject)
  .delete(protect, admin, deleteProject);

export default router;
