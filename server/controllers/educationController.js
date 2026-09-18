import mongoose from "mongoose";
import Education from "../models/Education.js";

// GET all education records
export const getEducations = async (req, res) => {
  try {
    const educations = await Education.find().sort({
      order: 1,
      years: -1,
      createdAt: 1,
    });

    res.json(educations);
  } catch (error) {
    console.error("Get education error:", error);

    res.status(500).json({
      message: "Failed to fetch education records",
    });
  }
};

// GET only visible education records
export const getVisibleEducations = async (req, res) => {
  try {
    const educations = await Education.find({
      visible: true,
    }).sort({
      order: 1,
      years: -1,
      createdAt: 1,
    });

    res.json(educations);
  } catch (error) {
    console.error("Get visible education error:", error);

    res.status(500).json({
      message: "Failed to fetch visible education records",
    });
  }
};

// CREATE education record
export const createEducation = async (req, res) => {
  try {
    const {
      years,
      title,
      place,
      location,
      detail,
      cgpa,
      percentage,
      icon,
      order,
      visible,
    } = req.body;

    // Required fields
    if (!years || typeof years !== "string" || !years.trim()) {
      return res.status(400).json({
        message: "Education years are required",
      });
    }

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({
        message: "Education title is required",
      });
    }

    if (!place || typeof place !== "string" || !place.trim()) {
      return res.status(400).json({
        message: "Institution name is required",
      });
    }

    // Validate order
    const numericOrder = Number(order);

    if (
      order !== undefined &&
      (!Number.isFinite(numericOrder) || numericOrder < 0)
    ) {
      return res.status(400).json({
        message: "Order must be a number greater than or equal to 0",
      });
    }

    const education = await Education.create({
      years: years.trim(),
      title: title.trim(),
      place: place.trim(),

      location: typeof location === "string" ? location.trim() : "",

      detail: typeof detail === "string" ? detail.trim() : "",

      cgpa: typeof cgpa === "string" ? cgpa.trim() : "",

      percentage: typeof percentage === "string" ? percentage.trim() : "",

      icon: typeof icon === "string" && icon.trim() ? icon.trim() : "🎓",

      order: order === undefined ? 0 : numericOrder,

      visible: visible !== false,
    });

    res.status(201).json(education);
  } catch (error) {
    console.error("Create education error:", error);

    res.status(400).json({
      message: "Failed to create education record",
    });
  }
};

// UPDATE education record
export const updateEducation = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid education ID",
      });
    }

    const education = await Education.findById(id);

    if (!education) {
      return res.status(404).json({
        message: "Education record not found",
      });
    }

    // Only these fields can be updated
    const allowedFields = [
      "years",
      "title",
      "place",
      "location",
      "detail",
      "cgpa",
      "percentage",
      "icon",
      "order",
      "visible",
    ];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        education[field] = req.body[field];
      }
    });

    // Validate years
    if (req.body.years !== undefined) {
      if (typeof req.body.years !== "string" || !req.body.years.trim()) {
        return res.status(400).json({
          message: "Education years are required",
        });
      }

      education.years = req.body.years.trim();
    }

    // Validate title
    if (req.body.title !== undefined) {
      if (typeof req.body.title !== "string" || !req.body.title.trim()) {
        return res.status(400).json({
          message: "Education title is required",
        });
      }

      education.title = req.body.title.trim();
    }

    // Validate institution
    if (req.body.place !== undefined) {
      if (typeof req.body.place !== "string" || !req.body.place.trim()) {
        return res.status(400).json({
          message: "Institution name is required",
        });
      }

      education.place = req.body.place.trim();
    }

    // Location
    if (req.body.location !== undefined) {
      education.location =
        typeof req.body.location === "string" ? req.body.location.trim() : "";
    }

    // Detail
    if (req.body.detail !== undefined) {
      education.detail =
        typeof req.body.detail === "string" ? req.body.detail.trim() : "";
    }

    // CGPA
    if (req.body.cgpa !== undefined) {
      education.cgpa =
        typeof req.body.cgpa === "string" ? req.body.cgpa.trim() : "";
    }

    // Percentage
    if (req.body.percentage !== undefined) {
      education.percentage =
        typeof req.body.percentage === "string"
          ? req.body.percentage.trim()
          : "";
    }

    // Icon
    if (req.body.icon !== undefined) {
      education.icon =
        typeof req.body.icon === "string" && req.body.icon.trim()
          ? req.body.icon.trim()
          : "🎓";
    }

    // Order
    if (req.body.order !== undefined) {
      const numericOrder = Number(req.body.order);

      if (!Number.isFinite(numericOrder) || numericOrder < 0) {
        return res.status(400).json({
          message: "Order must be a number greater than or equal to 0",
        });
      }

      education.order = numericOrder;
    }

    // Visibility
    if (req.body.visible !== undefined) {
      education.visible = req.body.visible === true;
    }

    await education.save();

    res.json(education);
  } catch (error) {
    console.error("Update education error:", error);

    res.status(400).json({
      message: "Failed to update education record",
    });
  }
};

// REORDER education records
export const reorderEducations = async (req, res) => {
  try {
    const { educationIds } = req.body;

    if (!Array.isArray(educationIds) || educationIds.length === 0) {
      return res.status(400).json({
        message: "educationIds must be a non-empty array",
      });
    }

    // Prevent duplicate IDs
    const uniqueIds = new Set(educationIds);

    if (uniqueIds.size !== educationIds.length) {
      return res.status(400).json({
        message: "Duplicate education IDs are not allowed",
      });
    }

    // Validate all IDs
    const invalidId = educationIds.find(
      (id) => !mongoose.Types.ObjectId.isValid(id),
    );

    if (invalidId) {
      return res.status(400).json({
        message: "One or more education IDs are invalid",
      });
    }

    const existingEducations = await Education.find();

    if (existingEducations.length !== educationIds.length) {
      return res.status(400).json({
        message: "All education records must be included when saving order",
      });
    }

    const existingIds = new Set(
      existingEducations.map((education) => education._id.toString()),
    );

    const missingId = educationIds.find((id) => !existingIds.has(id));

    if (missingId) {
      return res.status(400).json({
        message: "One or more education records were not found",
      });
    }

    const operations = educationIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
            order: index + 1,
          },
        },
      },
    }));

    await Education.bulkWrite(operations);

    const educations = await Education.find().sort({
      order: 1,
      years: -1,
      createdAt: 1,
    });

    res.json(educations);
  } catch (error) {
    console.error("Reorder education error:", error);

    res.status(500).json({
      message: "Failed to reorder education records",
    });
  }
};

// DELETE one education record
export const deleteEducation = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid education ID",
      });
    }

    const education = await Education.findByIdAndDelete(id);

    if (!education) {
      return res.status(404).json({
        message: "Education record not found",
      });
    }

    res.json({
      message: "Education record removed successfully",
    });
  } catch (error) {
    console.error("Delete education error:", error);

    res.status(500).json({
      message: "Failed to delete education record",
    });
  }
};
