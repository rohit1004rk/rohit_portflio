import mongoose from "mongoose";

/**
 * PortfolioSettingsRevision
 *
 * Purpose:
 * - Keeps a historical snapshot of PortfolioSettings.
 * - Supports safe change history.
 * - Supports future reset/restore operations.
 * - Does NOT modify or delete Projects, Skills, Experience, Education,
 *   Certificates, Achievements, Testimonials, or Blog records.
 *
 * Important:
 * This collection is an audit/history layer only.
 */

const portfolioSettingsRevisionSchema = new mongoose.Schema(
  {
    // =========================================================
    // REVISION NUMBER
    // =========================================================
    revision: {
      type: Number,
      required: true,
      min: 0,
    },

    // =========================================================
    // ACTION
    // =========================================================
    action: {
      type: String,
      enum: [
        "create",
        "update",
        "reset_section",
        "reset_field",
        "restore_revision",
        "restore_defaults",
      ],
      required: true,
    },

    // =========================================================
    // ADMIN WHO MADE THE CHANGE
    // =========================================================
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    changedByEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
      default: "",
    },

    // =========================================================
    // CHANGED SECTIONS
    // =========================================================
    changedSections: {
      type: [String],
      default: [],
    },

    // =========================================================
    // OPTIONAL RESET TARGET
    // =========================================================
    resetTarget: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    // =========================================================
    // HUMAN-READABLE DESCRIPTION
    // =========================================================
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    // =========================================================
    // COMPLETE SETTINGS SNAPSHOT
    // =========================================================
    //
    // Mixed is intentional here.
    //
    // PortfolioSettings itself remains the live source of truth.
    // This document is only a historical snapshot.
    //
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    // =========================================================
    // OPTIONAL METADATA
    // =========================================================
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

// =========================================================
// INDEXES
// =========================================================

// Fast lookup of revision history.
portfolioSettingsRevisionSchema.index({
  revision: -1,
});

// Fast lookup by admin.
portfolioSettingsRevisionSchema.index({
  changedBy: 1,
  createdAt: -1,
});

// Fast chronological history lookup.
portfolioSettingsRevisionSchema.index({
  createdAt: -1,
});

const PortfolioSettingsRevision = mongoose.model(
  "PortfolioSettingsRevision",
  portfolioSettingsRevisionSchema,
);

export default PortfolioSettingsRevision;
