import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    /* ========================================================
       BASIC INFORMATION
       ======================================================== */

    title: {
      type: String,
      trim: true,
      default: "Resume",
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
    },

    /* ========================================================
       FILE STORAGE
       ======================================================== */

    /*
     * fileUrl is optional because the current implementation
     * stores the actual uploaded file directly in MongoDB
     * using the data Buffer field.
     */
    fileUrl: {
      type: String,
      trim: true,
      default: "",
    },

    data: {
      type: Buffer,
      required: true,
      select: false,
    },

    storageType: {
      type: String,
      enum: [
        "local",
        "cloudinary",
        "external",
      ],
      default: "local",
    },

    /* ========================================================
       VERSION MANAGEMENT
       ======================================================== */

    version: {
      type: Number,
      required: true,
      min: 1,
    },

    isCurrent: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* ========================================================
       FILE METADATA
       ======================================================== */

    fileSize: {
      type: Number,
      default: null,
      min: 0,
    },

    mimeType: {
      type: String,
      trim: true,
      default: "application/pdf",
    },

    /* ========================================================
       DATE / TIME
       ======================================================== */

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    /* ========================================================
       ANALYTICS
       ======================================================== */

    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    downloadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

/* ============================================================
   INDEXES
   ============================================================ */

resumeSchema.index({
  isCurrent: 1,
  uploadedAt: -1,
});

resumeSchema.index({
  version: -1,
});

/* ============================================================
   MODEL
   ============================================================ */

const Resume = mongoose.model(
  "Resume",
  resumeSchema,
);

export default Resume;