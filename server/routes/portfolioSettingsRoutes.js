import express from "express";

import {
  getSettings,
  updateSettings,
} from "../controllers/portfolioSettingsController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get portfolio settings
router.get("/", protect, admin, getSettings);

// Update portfolio settings
router.put("/", protect, admin, updateSettings);

export default router;
