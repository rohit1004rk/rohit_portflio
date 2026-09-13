import mongoose from "mongoose";
import Project from "../models/Project.js";

// @desc    Get all projects
// @route   GET /api/projects
// @access  Public
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({
      order: 1,
      createdAt: -1,
    });

    res.json(projects);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to load projects.",
    });
  }
};

// @desc    Get single project by slug
// @route   GET /api/projects/slug/:slug
// @access  Public
export const getProjectBySlug = async (req, res) => {
  try {
    const project = await Project.findOne({
      slug: req.params.slug,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to load project.",
    });
  }
};

// @desc    Get single project by id
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to load project.",
    });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);

    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({
      message: error.message || "Failed to create project.",
    });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
//
// IMPORTANT:
// This updates the selected project only.
// No other project is touched or deleted.
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    /*
     * Only fields belonging to the Project model are accepted.
     * This prevents accidental/unrelated fields from being written.
     */
    const allowedFields = [
      "title",
      "slug",
      "category",
      "icon",
      "overview",
      "thumbnail",
      "description",
      "problem",
      "whatIBuilt",
      "result",
      "workflow",
      "limitations",
      "future",
      "metrics",
      "tech",
      "repoUrl",
      "liveUrl",
      "status",
      "featured",
      "order",
    ];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        project[field] = req.body[field];
      }
    }

    /*
     * Thumbnail is OPTIONAL.
     *
     * Empty thumbnail means:
     * - project is allowed to have no thumbnail
     * - do not reject the update
     */
    if (
      Object.prototype.hasOwnProperty.call(req.body, "thumbnail") &&
      (req.body.thumbnail === null || req.body.thumbnail === undefined)
    ) {
      project.thumbnail = "";
    }

    /*
     * Keep project order valid.
     * Reordering should normally use /reorder,
     * but manual Display Order editing is still supported.
     */
    if (Object.prototype.hasOwnProperty.call(req.body, "order")) {
      const numericOrder = Number(req.body.order);

      if (Number.isFinite(numericOrder) && numericOrder >= 0) {
        project.order = numericOrder;
      }
    }

    const updatedProject = await project.save();

    res.json(updatedProject);
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    res.status(400).json({
      message: error.message || "Failed to update project.",
    });
  }
};

// @desc    Reorder projects
// @route   PUT /api/projects/reorder
// @access  Private/Admin
//
// IMPORTANT:
// This endpoint changes ONLY the "order" field.
// Project content remains untouched.
export const reorderProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({
        message: "projectIds must be a non-empty array.",
      });
    }

    // Validate all IDs before changing anything.
    const invalidId = projectIds.find(
      (id) => !mongoose.Types.ObjectId.isValid(id),
    );

    if (invalidId) {
      return res.status(400).json({
        message: "One or more project IDs are invalid.",
      });
    }

    // No duplicate projects.
    const uniqueIds = new Set(projectIds);

    if (uniqueIds.size !== projectIds.length) {
      return res.status(400).json({
        message: "Duplicate project IDs are not allowed.",
      });
    }

    // Get every existing project.
    const existingProjects = await Project.find().select("_id");

    /*
     * The complete list is required.
     * This prevents accidentally overwriting the order
     * of projects that were not included in the request.
     */
    if (existingProjects.length !== projectIds.length) {
      return res.status(400).json({
        message: "The complete project list is required for reordering.",
      });
    }

    const existingIdSet = new Set(
      existingProjects.map((project) => project._id.toString()),
    );

    const unknownId = projectIds.find(
      (id) => !existingIdSet.has(id.toString()),
    );

    if (unknownId) {
      return res.status(400).json({
        message: "Project list contains an unknown project.",
      });
    }

    /*
     * ONLY the order field is updated.
     *
     * Nothing else is modified:
     * title
     * description
     * thumbnail
     * tech
     * GitHub
     * Live Demo
     * featured
     * status
     * etc.
     */
    const operations = projectIds.map((projectId, index) => ({
      updateOne: {
        filter: {
          _id: projectId,
        },
        update: {
          $set: {
            order: index + 1,
          },
        },
      },
    }));

    await Project.bulkWrite(operations);

    const projects = await Project.find().sort({
      order: 1,
      createdAt: -1,
    });

    res.json({
      message: "Project order updated successfully.",
      projects,
    });
  } catch (error) {
    console.error("REORDER PROJECTS ERROR:", error);

    res.status(500).json({
      message: error.message || "Failed to reorder projects.",
    });
  }
};

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private/Admin
export const deleteProject = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json({
      message: "Project removed",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to delete project.",
    });
  }
};
