import mongoose from "mongoose";
import Experience from "../models/Experience.js";

// GET all experiences
export const getExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find().sort({
      order: 1,
      startDate: -1,
      createdAt: 1,
    });

    res.json(experiences);
  } catch (error) {
    console.error("Get experiences error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// GET only visible experiences
export const getVisibleExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({
      visible: true,
    }).sort({
      order: 1,
      startDate: -1,
      createdAt: 1,
    });

    res.json(experiences);
  } catch (error) {
    console.error("Get visible experiences error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// CREATE experience
export const createExperience = async (req, res) => {
  try {
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
    } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Experience title is required",
      });
    }

    if (!company || typeof company !== "string" || !company.trim()) {
      return res.status(400).json({
        message: "Company or organization is required",
      });
    }

    if (!startDate || typeof startDate !== "string" || !startDate.trim()) {
      return res.status(400).json({
        message: "Start date is required",
      });
    }

    const numericOrder = Number(order);

    if (
      order !== undefined &&
      (!Number.isFinite(numericOrder) || numericOrder < 0)
    ) {
      return res.status(400).json({
        message: "Order must be a number greater than or equal to 0",
      });
    }

    const experience = await Experience.create({
      title: title.trim(),
      company: company.trim(),
      type:
        typeof type === "string" && type.trim() ? type.trim() : "Experience",
      location: typeof location === "string" ? location.trim() : "",
      startDate: startDate.trim(),
      endDate:
        current === true
          ? ""
          : typeof endDate === "string"
            ? endDate.trim()
            : "",
      current: current === true,
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
      order: order === undefined ? 0 : numericOrder,
      visible: visible !== false,
    });

    res.status(201).json(experience);
  } catch (error) {
    console.error("Create experience error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

// UPDATE experience
export const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid experience ID",
      });
    }

    const experience = await Experience.findById(id);

    if (!experience) {
      return res.status(404).json({
        message: "Experience not found",
      });
    }

    const allowedFields = [
      "title",
      "company",
      "type",
      "location",
      "startDate",
      "endDate",
      "current",
      "domain",
      "duration",
      "description",
      "learnings",
      "technologies",
      "certificateId",
      "grade",
      "icon",
      "order",
      "visible",
    ];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        experience[field] = req.body[field];
      }
    });

    if (req.body.title !== undefined) {
      if (typeof req.body.title !== "string" || !req.body.title.trim()) {
        return res.status(400).json({
          message: "Experience title is required",
        });
      }

      experience.title = req.body.title.trim();
    }

    if (req.body.company !== undefined) {
      if (typeof req.body.company !== "string" || !req.body.company.trim()) {
        return res.status(400).json({
          message: "Company or organization is required",
        });
      }

      experience.company = req.body.company.trim();
    }

    if (req.body.type !== undefined) {
      experience.type =
        typeof req.body.type === "string" ? req.body.type.trim() : "Experience";
    }

    if (req.body.location !== undefined) {
      experience.location =
        typeof req.body.location === "string" ? req.body.location.trim() : "";
    }

    if (req.body.startDate !== undefined) {
      if (
        typeof req.body.startDate !== "string" ||
        !req.body.startDate.trim()
      ) {
        return res.status(400).json({
          message: "Start date is required",
        });
      }

      experience.startDate = req.body.startDate.trim();
    }

    if (req.body.endDate !== undefined) {
      experience.endDate =
        typeof req.body.endDate === "string" ? req.body.endDate.trim() : "";
    }

    if (req.body.current !== undefined) {
      experience.current = req.body.current === true;

      if (experience.current) {
        experience.endDate = "";
      }
    }

    if (req.body.domain !== undefined) {
      experience.domain =
        typeof req.body.domain === "string" ? req.body.domain.trim() : "";
    }

    if (req.body.duration !== undefined) {
      experience.duration =
        typeof req.body.duration === "string" ? req.body.duration.trim() : "";
    }

    if (req.body.description !== undefined) {
      experience.description =
        typeof req.body.description === "string"
          ? req.body.description.trim()
          : "";
    }

    if (req.body.learnings !== undefined) {
      if (!Array.isArray(req.body.learnings)) {
        return res.status(400).json({
          message: "Learnings must be an array",
        });
      }

      experience.learnings = req.body.learnings
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (req.body.technologies !== undefined) {
      if (!Array.isArray(req.body.technologies)) {
        return res.status(400).json({
          message: "Technologies must be an array",
        });
      }

      experience.technologies = req.body.technologies
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (req.body.certificateId !== undefined) {
      experience.certificateId =
        typeof req.body.certificateId === "string"
          ? req.body.certificateId.trim()
          : "";
    }

    if (req.body.grade !== undefined) {
      experience.grade =
        typeof req.body.grade === "string" ? req.body.grade.trim() : "";
    }

    if (req.body.icon !== undefined) {
      experience.icon =
        typeof req.body.icon === "string" && req.body.icon.trim()
          ? req.body.icon.trim()
          : "💼";
    }

    if (req.body.order !== undefined) {
      const numericOrder = Number(req.body.order);

      if (!Number.isFinite(numericOrder) || numericOrder < 0) {
        return res.status(400).json({
          message: "Order must be a number greater than or equal to 0",
        });
      }

      experience.order = numericOrder;
    }

    if (req.body.visible !== undefined) {
      experience.visible = req.body.visible === true;
    }

    await experience.save();

    res.json(experience);
  } catch (error) {
    console.error("Update experience error:", error);

    res.status(400).json({
      message: error.message,
    });
  }
};

// REORDER experiences
export const reorderExperiences = async (req, res) => {
  try {
    const { experienceIds } = req.body;

    if (!Array.isArray(experienceIds) || experienceIds.length === 0) {
      return res.status(400).json({
        message: "experienceIds must be a non-empty array",
      });
    }

    const uniqueIds = new Set(experienceIds);

    if (uniqueIds.size !== experienceIds.length) {
      return res.status(400).json({
        message: "Duplicate experience IDs are not allowed",
      });
    }

    const invalidId = experienceIds.find(
      (id) => !mongoose.Types.ObjectId.isValid(id),
    );

    if (invalidId) {
      return res.status(400).json({
        message: "One or more experience IDs are invalid",
      });
    }

    const existingExperiences = await Experience.find();

    if (existingExperiences.length !== experienceIds.length) {
      return res.status(400).json({
        message: "All experience records must be included when saving order",
      });
    }

    const existingIds = new Set(
      existingExperiences.map((experience) => experience._id.toString()),
    );

    const missingId = experienceIds.find((id) => !existingIds.has(id));

    if (missingId) {
      return res.status(400).json({
        message: "One or more experience records were not found",
      });
    }

    const operations = experienceIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
            order: index + 1,
          },
        },
      },
    }));

    await Experience.bulkWrite(operations);

    const experiences = await Experience.find().sort({
      order: 1,
      startDate: -1,
      createdAt: 1,
    });

    res.json(experiences);
  } catch (error) {
    console.error("Reorder experiences error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};

// DELETE one experience
export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
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

    res.json({
      message: "Experience removed successfully",
    });
  } catch (error) {
    console.error("Delete experience error:", error);

    res.status(500).json({
      message: error.message,
    });
  }
};
