import mongoose from "mongoose";
import Skill from "../models/Skill.js";

// @desc    Get all skill categories
// @route   GET /api/skills
// @access  Public
export const getSkills = async (req, res) => {
  try {
    const skills = await Skill.find().sort({ order: 1, createdAt: 1 });

    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a skill category
// @route   POST /api/skills
// @access  Private/Admin
export const createSkill = async (req, res) => {
  try {
    const { category, icon, items, order, visible } = req.body;

    const skill = await Skill.create({
      category,
      icon,
      items: Array.isArray(items) ? items : [],
      order: Number(order) || 0,
      visible: visible !== false,
    });

    res.status(201).json(skill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a skill category
// @route   PUT /api/skills/:id
// @access  Private/Admin
export const updateSkill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid skill ID",
      });
    }

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    const allowedFields = ["category", "icon", "items", "order", "visible"];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        skill[field] = req.body[field];
      }
    });

    if (req.body.order !== undefined) {
      const numericOrder = Number(req.body.order);

      if (!Number.isFinite(numericOrder) || numericOrder < 0) {
        return res.status(400).json({
          message: "Order must be a number greater than or equal to 0",
        });
      }

      skill.order = numericOrder;
    }

    if (req.body.items !== undefined && !Array.isArray(req.body.items)) {
      return res.status(400).json({
        message: "Items must be an array",
      });
    }

    await skill.save();

    res.json(skill);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

// @desc    Reorder skill categories
// @route   PUT /api/skills/reorder
// @access  Private/Admin
export const reorderSkills = async (req, res) => {
  try {
    const { skillIds } = req.body;

    if (!Array.isArray(skillIds) || skillIds.length === 0) {
      return res.status(400).json({
        message: "skillIds must be a non-empty array",
      });
    }

    const uniqueIds = new Set(skillIds);

    if (uniqueIds.size !== skillIds.length) {
      return res.status(400).json({
        message: "Duplicate skill IDs are not allowed",
      });
    }

    const invalidId = skillIds.find(
      (id) => !mongoose.Types.ObjectId.isValid(id),
    );

    if (invalidId) {
      return res.status(400).json({
        message: "One or more skill IDs are invalid",
      });
    }

    const existingSkills = await Skill.find();

    if (existingSkills.length !== skillIds.length) {
      return res.status(400).json({
        message: "All skill categories must be included when saving order",
      });
    }

    const existingIds = new Set(
      existingSkills.map((skill) => skill._id.toString()),
    );

    const missingId = skillIds.find((id) => !existingIds.has(id));

    if (missingId) {
      return res.status(400).json({
        message: "One or more skill categories were not found",
      });
    }

    const operations = skillIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
            order: index + 1,
          },
        },
      },
    }));

    await Skill.bulkWrite(operations);

    const skills = await Skill.find().sort({
      order: 1,
      createdAt: 1,
    });

    res.json(skills);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// @desc    Delete a skill category
// @route   DELETE /api/skills/:id
// @access  Private/Admin
export const deleteSkill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid skill ID",
      });
    }

    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({
        message: "Skill not found",
      });
    }

    res.json({
      message: "Skill removed",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
