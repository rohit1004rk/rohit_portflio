import express from "express";
import {
  getHome,
  getAdminHome,
  updateHome,
} from "../controllers/homeController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public Home data
router.get("/", getHome);

// Admin Home settings
router.get("/admin", protect, admin, getAdminHome);
router.put("/", protect, admin, updateHome);

export default router;
