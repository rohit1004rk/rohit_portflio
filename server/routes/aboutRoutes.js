import express from "express";
import {
  getAbout,
  getAdminAbout,
  updateAbout,
} from "../controllers/aboutController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public About content
router.get("/", getAbout);

// Admin About content
router.get("/admin", protect, admin, getAdminAbout);

// Update About content
router.put("/", protect, admin, updateAbout);

export default router;
