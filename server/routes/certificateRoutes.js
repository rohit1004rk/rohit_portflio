import express from "express";
import multer from "multer";

import {
  getCertificates,
  getCertificateFile,
  createCertificate,
  updateCertificate,
  reorderCertificates,
  deleteCertificate,
} from "../controllers/certificateController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, JPG, JPEG, PNG and WEBP files are allowed."));
    }
  },
});

// ── Public routes ─────────────────────────────────────────

router.get("/", getCertificates);

router.get("/:id/file", getCertificateFile);

// ── Admin routes ──────────────────────────────────────────

// Save certificate display order
router.put("/reorder", protect, admin, reorderCertificates);

// Upload a new certificate
router.post(
  "/",
  protect,
  admin,
  upload.single("certificate"),
  createCertificate,
);

// Update an existing certificate
// New certificate file is optional during edit.
router.put(
  "/:id",
  protect,
  admin,
  upload.single("certificate"),
  updateCertificate,
);

// Delete a certificate
router.delete("/:id", protect, admin, deleteCertificate);

export default router;
