import express from "express";
import multer from "multer";

import {
  getCurrentResume,
  getResumeHistory,
  createResume,
  updateResume,
  enableResume,
  disableResume,
  setCurrentResume,
  deleteResume,
  permanentlyDeleteResume,
  getResumeFile,
  trackResumeView,
  trackResumeDownload,
} from "../controllers/resumeController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/*
 * ============================================================
 * MULTER CONFIGURATION
 * ============================================================
 *
 * Resume PDF memory में temporarily रहेगा.
 * MongoDB में save controller करेगा.
 */
const storage = multer.memoryStorage();

/*
 * ============================================================
 * FILE FILTER
 * ============================================================
 *
 * केवल PDF allow होगा.
 * ============================================================
 */
const fileFilter = (req, file, cb) => {
  const originalName = String(file.originalname || "")
    .trim()
    .toLowerCase();

  const isPdfMime = file.mimetype === "application/pdf";

  const isPdfExtension = originalName.endsWith(".pdf");

  if (!isPdfMime || !isPdfExtension) {
    return cb(new Error("Only PDF resume files are allowed."), false);
  }

  cb(null, true);
};

/*
 * ============================================================
 * MULTER
 * ============================================================
 *
 * Maximum 10 MB.
 */
const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter,
});

/*
 * ============================================================
 * PUBLIC RESUME ROUTES
 * ============================================================
 */

/*
 * Get currently active/public resume.
 *
 * GET /api/resume/current
 */
router.get("/current", getCurrentResume);

/*
 * Get actual PDF file.
 *
 * GET /api/resume/:id/file
 *
 * IMPORTANT:
 * This route must stay BEFORE /:id
 * related management routes.
 */
router.get("/:id/file", getResumeFile);

/*
 * Track resume view.
 *
 * POST /api/resume/:id/view
 */
router.post("/:id/view", trackResumeView);

/*
 * Track resume download.
 *
 * POST /api/resume/:id/download
 */
router.post("/:id/download", trackResumeDownload);

/*
 * ============================================================
 * ADMIN RESUME MANAGEMENT
 * ============================================================
 */

/*
 * Upload new resume.
 *
 * POST /api/resume
 *
 * Authentication:
 * protect + admin
 */
router.post(
  "/",
  protect,
  admin,
  (req, res, next) => {
    upload.single("resume")(req, res, (error) => {
      if (error) {
        console.error("Resume upload middleware error:", error);

        if (error instanceof multer.MulterError) {
          if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              message: "Resume file must be 10 MB or smaller.",
            });
          }

          return res.status(400).json({
            message: error.message || "Resume upload failed.",
          });
        }

        return res.status(400).json({
          message: error.message || "Only PDF resume files are allowed.",
        });
      }

      next();
    });
  },
  createResume,
);

/*
 * ============================================================
 * ADMIN HISTORY
 * ============================================================
 *
 * Includes:
 * - Current
 * - Archived
 * - Disabled
 * - Deleted
 *
 * GET /api/resume
 */
router.get("/", protect, admin, getResumeHistory);

/*
 * ============================================================
 * EDIT RESUME
 * ============================================================
 *
 * PUT /api/resume/:id
 *
 * Only metadata/title is edited.
 * Original PDF data remains untouched.
 */
router.put("/:id", protect, admin, updateResume);

/*
 * ============================================================
 * ENABLE RESUME
 * ============================================================
 *
 * PUT /api/resume/:id/enable
 */
router.put("/:id/enable", protect, admin, enableResume);

/*
 * ============================================================
 * DISABLE RESUME
 * ============================================================
 *
 * PUT /api/resume/:id/disable
 */
router.put("/:id/disable", protect, admin, disableResume);

/*
 * ============================================================
 * SET CURRENT RESUME
 * ============================================================
 *
 * PUT /api/resume/:id/current
 */
router.put("/:id/current", protect, admin, setCurrentResume);

/*
 * ============================================================
 * SOFT DELETE
 * ============================================================
 *
 * DELETE /api/resume/:id
 *
 * Record + PDF remain in MongoDB.
 * Resume moves to Deleted History.
 */
router.delete("/:id", protect, admin, deleteResume);

/*
 * ============================================================
 * PERMANENT DELETE
 * ============================================================
 *
 * DELETE /api/resume/:id/permanent
 *
 * IMPORTANT:
 * This actually deletes the MongoDB document.
 *
 * The stored PDF Buffer inside that document is also removed.
 */
router.delete("/:id/permanent", protect, admin, permanentlyDeleteResume);

/*
 * ============================================================
 * MULTER ERROR HANDLER
 * ============================================================
 *
 * Handles unexpected upload errors.
 */
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      message: error.message || "Resume upload failed.",
    });
  }

  if (error) {
    return res.status(400).json({
      message: error.message || "Resume request failed.",
    });
  }

  next();
});

export default router;
