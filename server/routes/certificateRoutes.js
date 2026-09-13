import express from "express";
import multer from "multer";

import {
  getCertificates,
  getCertificateFile,
  createCertificate,
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

router.post(
  "/",
  protect,
  admin,
  upload.single("certificate"),
  createCertificate,
);

router.delete("/:id", protect, admin, deleteCertificate);

export default router;
