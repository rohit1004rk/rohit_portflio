import mongoose from "mongoose";
import Experience from "../models/Experience.js";

const sanitizeExperiencePayload = (body = {}) => {
  const {
    title,
    company,
    type,
    location,
    startDate,
    endDate,
    current,
    domain,
    duration,
    description,
    learnings,
    technologies,
    certificateId,
    grade,
    icon,
    order,
    visible,
  } = body;

  return {
    title: typeof title === "string" ? title.trim() : title,
    company: typeof company === "string" ? company.trim() : company,
    type: typeof type === "string" ? type.trim() : "Experience",
    location: typeof location === "string" ? location.trim() : "",
    startDate: typeof startDate === "string" ? startDate.trim() : startDate,
    endDate: typeof endDate === "string" ? endDate.trim() : "",
    current: Boolean(current),
    domain: typeof domain === "string" ? domain.trim() : "",
    duration: typeof duration === "string" ? duration.trim() : "",
    description: typeof description === "string" ? description.trim() : "",
    learnings: Array.isArray(learnings)
      ? learnings
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    technologies: Array.isArray(technologies)
      ? technologies
          .filter((item) => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      : [],
    certificateId:
      typeof certificateId === "string" ? certificateId.trim() : "",
    grade: typeof grade === "string" ? grade.trim() : "",
    icon: typeof icon === "string" && icon.trim() ? icon.trim() : "💼",
    order: Number.isFinite(Number(order)) ? Number(order) : 0,
    visible: visible !== false,
  };
};

// ─────────────────────────────────────────────────────────────
// GET ALL EXPERIENCES — ADMIN
// ─────────────────────────────────────────────────────────────

export const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.status(200).json(experiences);
  } catch (error) {
    console.error("Get experiences error:", error);

    res.status(500).json({
      message: "Failed to fetch experiences",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// GET VISIBLE EXPERIENCES — PUBLIC
// ─────────────────────────────────────────────────────────────

export const getVisibleExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({
      visible: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.status(200).json(experiences);
  } catch (error) {
    console.error("Get visible experiences error:", error);

    res.status(500).json({
      message: "Failed to fetch visible experiences",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE EXPERIENCE — ADMIN
// ─────────────────────────────────────────────────────────────

export const createExperience = async (req, res) => {
  try {
    const payload = sanitizeExperiencePayload(req.body);

    if (!payload.title) {
      return res.status(400).json({
        message: "Experience title is required",
      });
    }

    if (!payload.company) {
      return res.status(400).json({
        message: "Company is required",
      });
    }

    if (!payload.startDate) {
      return res.status(400).json({
        message: "Start date is required",
      });
    }

    const experience = await Experience.create(payload);

    res.status(201).json(experience);
  } catch (error) {
    console.error("Create experience error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid experience data",
      });
    }

    res.status(500).json({
      message: "Failed to create experience",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE EXPERIENCE — ADMIN
// ─────────────────────────────────────────────────────────────

export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid experience ID",
      });
    }

    const payload = sanitizeExperiencePayload(req.body);

    if (!payload.title) {
      return res.status(400).json({
        message: "Experience title is required",
      });
    }

    if (!payload.company) {
      return res.status(400).json({
        message: "Company is required",
      });
    }

    if (!payload.startDate) {
      return res.status(400).json({
        message: "Start date is required",
      });
    }

    const experience = await Experience.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!experience) {
      return res.status(404).json({
        message: "Experience not found",
      });
    }

    res.status(200).json(experience);
  } catch (error) {
    console.error("Update experience error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid experience data",
      });
    }

    res.status(500).json({
      message: "Failed to update experience",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// REORDER EXPERIENCES — ADMIN
// ─────────────────────────────────────────────────────────────

export const reorderExperiences = async (req, res) => {
  try {
    const { experienceIds } = req.body;

    if (!Array.isArray(experienceIds)) {
      return res.status(400).json({
        message: "experienceIds must be an array",
      });
    }

    const validIds = experienceIds.filter((id) => mongoose.isValidObjectId(id));

    if (validIds.length !== experienceIds.length) {
      return res.status(400).json({
        message: "One or more experience IDs are invalid",
      });
    }

    const operations = validIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
            order: index + 1,
          },
        },
      },
    }));

    if (operations.length > 0) {
      await Experience.bulkWrite(operations);
    }

    const experiences = await Experience.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();

    res.status(200).json(experiences);
  } catch (error) {
    console.error("Reorder experiences error:", error);

    res.status(500).json({
      message: "Failed to reorder experiences",
    });
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE EXPERIENCE — ADMIN
// ─────────────────────────────────────────────────────────────

export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid experience ID",
      });
    }

    const experience = await Experience.findByIdAndDelete(id);

    if (!experience) {
      return res.status(404).json({
        message: "Experience not found",
      });
    }

    res.status(200).json({
      message: "Experience deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Delete experience error:", error);

    res.status(500).json({
      message: "Failed to delete experience",
    });
  }
};
