import express from "express";
import multer from "multer";

import {
  getCurrentResume,
  getResumeHistory,
  setCurrentResume,
  trackResumeView,
  trackResumeDownload,
  deleteResume,
  createResume,
  getResumeFile,
} from "../controllers/resumeController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   RESUME UPLOAD CONFIGURATION
   ============================================================ */

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const mimeTypeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);

    const originalName = String(file.originalname || "").toLowerCase();

    const extensionAllowed = ALLOWED_EXTENSIONS.some((extension) =>
      originalName.endsWith(extension),
    );

    if (!mimeTypeAllowed || !extensionAllowed) {
      return cb(
        new Error(
          "Unsupported resume format. Allowed formats: PDF, JPG, JPEG, PNG and WEBP.",
        ),
      );
    }

    cb(null, true);
  },
});

/* ============================================================
   PUBLIC RESUME ROUTES
   ============================================================ */

/**
 * Get the resume currently used by
 * the public portfolio.
 */
router.get("/current", getCurrentResume);

/**
 * Open/view the actual uploaded file.
 */
router.get("/:id/file", getResumeFile);

/**
 * Track resume view.
 */
router.post("/:id/view", trackResumeView);

/**
 * Track resume download.
 */
router.post("/:id/download", trackResumeDownload);

/* ============================================================
   ADMIN RESUME ROUTES
   ============================================================ */

/**
 * Upload a new resume version.
 *
 * Authentication:
 * - protect
 * - admin
 *
 * Form field:
 * - resume
 */
router.post("/", protect, admin, upload.single("resume"), createResume);

/**
 * Get complete resume version history.
 */
router.get("/", protect, admin, getResumeHistory);

/**
 * Set an existing version as current.
 */
router.put("/:id/current", protect, admin, setCurrentResume);

/**
 * Delete an archived resume version.
 */
router.delete("/:id", protect, admin, deleteResume);

export default router;
