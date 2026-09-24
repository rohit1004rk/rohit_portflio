import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
      default: "Resume",
    },

    originalName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    fileUrl: {
      type: String,
      trim: true,
      default: "",
    },

    storageType: {
      type: String,
      trim: true,
      default: "local",
    },

    /*
     * ============================================================
     * STORED FILE DATA
     * ============================================================
     *
     * Actual PDF data MongoDB में stored रहेगा.
     *
     * Soft Delete / Disable के समय यह data delete नहीं होगा.
     * Permanent Delete के समय पूरा MongoDB document delete होगा.
     */
    data: {
      type: Buffer,
      select: false,
    },

    /*
     * ============================================================
     * RESUME VERSION
     * ============================================================
     */
    version: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },

    /*
     * ============================================================
     * CURRENT RESUME
     * ============================================================
     *
     * true  = वर्तमान live/current resume
     * false = पुराने/archived resume
     */
    isCurrent: {
      type: Boolean,
      default: false,
      index: true,
    },

    /*
     * ============================================================
     * ENABLE / DISABLE
     * ============================================================
     *
     * true  = Resume enabled
     * false = Resume disabled
     *
     * Disable करने पर database record और PDF सुरक्षित रहेगा.
     */
    isEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },

    disabledAt: {
      type: Date,
      default: null,
    },

    /*
     * ============================================================
     * SOFT DELETE
     * ============================================================
     *
     * Delete करने पर document MongoDB से delete नहीं होगा.
     *
     * केवल:
     * isDeleted = true
     * deletedAt = deletion date
     *
     * इससे Deleted History बनी रहेगी.
     */
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    /*
     * ============================================================
     * FILE INFORMATION
     * ============================================================
     */
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

    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    /*
     * ============================================================
     * ANALYTICS
     * ============================================================
     */
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

/*
 * ============================================================
 * INDEXES
 * ============================================================
 */

/*
 * Current + Enabled + Non-deleted resume
 */
resumeSchema.index({
  isCurrent: 1,
  isEnabled: 1,
  isDeleted: 1,
});

/*
 * Resume version history
 */
resumeSchema.index({
  version: -1,
  uploadedAt: -1,
});

/*
 * Deleted resume history
 */
resumeSchema.index({
  isDeleted: 1,
  uploadedAt: -1,
});

/*
 * Enabled / Disabled resume management
 */
resumeSchema.index({
  isEnabled: 1,
  uploadedAt: -1,
});

/*
 * ============================================================
 * MODEL
 * ============================================================
 *
 * Existing model को reuse किया जाएगा.
 * इससे hot reload के दौरान OverwriteModelError नहीं आएगा.
 */
const Resume = mongoose.models.Resume || mongoose.model("Resume", resumeSchema);

export default Resume;
