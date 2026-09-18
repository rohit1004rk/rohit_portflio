import mongoose from "mongoose";
import validator from "validator";
import Project from "../models/Project.js";

const ALLOWED_FIELDS = [
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

const REQUIRED_FIELDS = [
  "title",
  "slug",
  "overview",
  "problem",
  "whatIBuilt",
  "result",
];

const ARRAY_STRING_FIELDS = [
  "description",
  "workflow",
  "limitations",
  "future",
  "tech",
];

const STRING_FIELDS = [
  "title",
  "slug",
  "category",
  "icon",
  "overview",
  "thumbnail",
  "problem",
  "whatIBuilt",
  "result",
  "repoUrl",
  "liveUrl",
  "status",
];

const MAX_TEXT_LENGTH = 10000;
const MAX_SHORT_TEXT_LENGTH = 500;
const MAX_ARRAY_ITEMS = 100;
const MAX_METRICS = 50;
const MAX_THUMBNAIL_LENGTH = 8 * 1024 * 1024;

/**
 * Keep only fields that actually belong to the Project model.
 */
const pickAllowedFields = (body = {}) => {
  const clean = {};

  for (const field of ALLOWED_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      clean[field] = body[field];
    }
  }

  return clean;
};

/**
 * Convert textarea/string values into the array format
 * required by the Project schema.
 *
 * Existing arrays are preserved.
 *
 * Example:
 * "Line one\nLine two"
 * becomes:
 * ["Line one", "Line two"]
 */
const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    const text = value.trim();

    if (!text) {
      return [];
    }

    return text
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value;
};

/**
 * Convert metrics from either:
 *
 * 1. Existing array:
 *    [{ label: "Accuracy", value: "91%" }]
 *
 * 2. JSON text:
 *    [{"label":"Accuracy","value":"91%"}]
 *
 * 3. Simple textarea lines:
 *    Accuracy: 91%
 *    Performance: Fast
 *
 * into the schema format.
 */
const normalizeMetrics = (value) => {
  if (Array.isArray(value)) {
    return value
      .filter(
        (metric) =>
          metric && typeof metric === "object" && !Array.isArray(metric),
      )
      .map((metric) => ({
        label: String(metric.label ?? "").trim(),
        value: String(metric.value ?? "").trim(),
      }))
      .filter((metric) => metric.label || metric.value);
  }

  if (typeof value !== "string") {
    return value;
  }

  const text = value.trim();

  if (!text) {
    return [];
  }

  // First try JSON because the admin form may contain
  // the original metrics array represented as JSON.
  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return normalizeMetrics(parsed);
    }
  } catch {
    // Not JSON. Continue with normal textarea parsing.
  }

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":");

      if (separatorIndex === -1) {
        return {
          label: "Metric",
          value: line,
        };
      }

      return {
        label: line.slice(0, separatorIndex).trim(),
        value: line.slice(separatorIndex + 1).trim(),
      };
    })
    .filter((metric) => metric.label || metric.value);
};

/**
 * Normalize values before validation/database write.
 */
const normalizeProjectPayload = (payload) => {
  const normalized = { ...payload };

  for (const field of STRING_FIELDS) {
    if (typeof normalized[field] === "string") {
      normalized[field] = normalized[field].trim();
    }
  }

  for (const field of ARRAY_STRING_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(normalized, field)) {
      normalized[field] = normalizeStringArray(normalized[field]);
    }
  }

  if (Object.prototype.hasOwnProperty.call(normalized, "metrics")) {
    normalized.metrics = normalizeMetrics(normalized.metrics);
  }

  if (typeof normalized.slug === "string") {
    normalized.slug = normalized.slug.toLowerCase();
  }

  if (Object.prototype.hasOwnProperty.call(normalized, "order")) {
    normalized.order = Number(normalized.order);
  }

  return normalized;
};

/**
 * Validate Project payload according to the actual Project schema.
 */
const validateProjectPayload = (payload, { isCreate = false } = {}) => {
  const errors = {};

  /*
   * Required fields from Project schema.
   */
  if (isCreate) {
    for (const field of REQUIRED_FIELDS) {
      const value = payload[field];

      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        errors[field] = `${field} is required.`;
      }
    }
  }

  /*
   * String fields.
   */
  for (const field of STRING_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) {
      continue;
    }

    const value = payload[field];

    /*
     * Optional fields may be empty.
     */
    if (
      (field === "thumbnail" || field === "repoUrl" || field === "liveUrl") &&
      (value === "" || value === null || value === undefined)
    ) {
      continue;
    }

    if (value === null || value === undefined) {
      errors[field] = `${field} must be a string.`;
      continue;
    }

    if (typeof value !== "string") {
      errors[field] = `${field} must be a string.`;
      continue;
    }

    const maxLength =
      field === "title" ||
      field === "slug" ||
      field === "category" ||
      field === "icon"
        ? MAX_SHORT_TEXT_LENGTH
        : MAX_TEXT_LENGTH;

    if (value.length > maxLength) {
      errors[field] = `${field} is too long.`;
    }
  }

  /*
   * Array of strings:
   *
   * description
   * workflow
   * limitations
   * future
   * tech
   */
  for (const field of ARRAY_STRING_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) {
      continue;
    }

    const value = payload[field];

    if (!Array.isArray(value)) {
      errors[field] = `${field} must be an array.`;
      continue;
    }

    if (value.length > MAX_ARRAY_ITEMS) {
      errors[field] = `${field} contains too many items.`;
      continue;
    }

    const invalidItem = value.find(
      (item) => typeof item !== "string" || item.length > MAX_TEXT_LENGTH,
    );

    if (invalidItem !== undefined) {
      errors[field] = `${field} contains an invalid item.`;
    }
  }

  /*
   * Metrics:
   * [
   *   {
   *     label: String,
   *     value: String
   *   }
   * ]
   */
  if (Object.prototype.hasOwnProperty.call(payload, "metrics")) {
    const metrics = payload.metrics;

    if (!Array.isArray(metrics)) {
      errors.metrics = "metrics must be an array.";
    } else if (metrics.length > MAX_METRICS) {
      errors.metrics = "metrics contains too many items.";
    } else {
      const invalidMetric = metrics.find(
        (metric) =>
          !metric ||
          typeof metric !== "object" ||
          Array.isArray(metric) ||
          typeof metric.label !== "string" ||
          typeof metric.value !== "string" ||
          metric.label.length > MAX_SHORT_TEXT_LENGTH ||
          metric.value.length > MAX_SHORT_TEXT_LENGTH,
      );

      if (invalidMetric) {
        errors.metrics = "metrics contains an invalid item.";
      }
    }
  }

  /*
   * Status must match the actual Project schema enum.
   */
  if (Object.prototype.hasOwnProperty.call(payload, "status")) {
    const allowedStatuses = [
      "completed",
      "in-progress",
      "prototype",
      "learning",
    ];

    if (!allowedStatuses.includes(payload.status)) {
      errors.status = "Invalid project status.";
    }
  }

  /*
   * Featured must be boolean.
   */
  if (Object.prototype.hasOwnProperty.call(payload, "featured")) {
    if (typeof payload.featured !== "boolean") {
      errors.featured = "featured must be a boolean.";
    }
  }

  /*
   * Order must be a non-negative finite number.
   */
  if (Object.prototype.hasOwnProperty.call(payload, "order")) {
    const numericOrder = Number(payload.order);

    if (
      typeof payload.order === "boolean" ||
      payload.order === null ||
      payload.order === "" ||
      !Number.isFinite(numericOrder) ||
      numericOrder < 0
    ) {
      errors.order = "order must be a non-negative number.";
    }
  }

  /*
   * Repository and Live Demo URLs.
   */
  for (const field of ["repoUrl", "liveUrl"]) {
    if (!Object.prototype.hasOwnProperty.call(payload, field)) {
      continue;
    }

    const value = payload[field];

    if (value === "" || value === null || value === undefined) {
      continue;
    }

    if (
      typeof value !== "string" ||
      !validator.isURL(value, {
        protocols: ["http", "https"],
        require_protocol: true,
        require_valid_protocol: true,
      })
    ) {
      errors[field] = `${field} must be a valid HTTP/HTTPS URL.`;
    }
  }

  /*
   * Thumbnail:
   *
   * Allowed:
   * - empty
   * - HTTP/HTTPS image URL
   * - supported image data URL
   * - local portfolio thumbnail such as:
   *   /thumbnails/codefixer-ai.svg
   */
  if (Object.prototype.hasOwnProperty.call(payload, "thumbnail")) {
    const thumbnail = payload.thumbnail;

    if (thumbnail !== "" && thumbnail !== null && thumbnail !== undefined) {
      if (typeof thumbnail !== "string") {
        errors.thumbnail = "thumbnail must be a string.";
      } else {
        const isDataImage = /^data:image\/(?:png|jpeg|jpg|webp);base64,/i.test(
          thumbnail,
        );

        const isHttpUrl = validator.isURL(thumbnail, {
          protocols: ["http", "https"],
          require_protocol: true,
          require_valid_protocol: true,
        });

        /*
         * Your portfolio already uses local public thumbnails:
         * /thumbnails/codefixer-ai.svg
         *
         * Only allow a filename directly inside /thumbnails/
         * with a known image extension.
         */
        const isLocalThumbnail =
          /^\/thumbnails\/[A-Za-z0-9._-]+\.(?:png|jpe?g|webp|gif|svg)$/i.test(
            thumbnail,
          );

        if (!isDataImage && !isHttpUrl && !isLocalThumbnail) {
          errors.thumbnail =
            "thumbnail must be a valid HTTP/HTTPS image URL, local thumbnail path, or supported image data.";
        }

        if (thumbnail.length > MAX_THUMBNAIL_LENGTH) {
          errors.thumbnail = "thumbnail is too large.";
        }
      }
    }
  }

  return errors;
};

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
    console.error("GET PROJECTS ERROR:", error);

    res.status(500).json({
      message: "Failed to load projects.",
    });
  }
};

// @desc    Get single project by slug
// @route   GET /api/projects/slug/:slug
// @access  Public
export const getProjectBySlug = async (req, res) => {
  try {
    const slug = String(req.params.slug || "")
      .trim()
      .toLowerCase();

    if (!slug || slug.length > 200) {
      return res.status(400).json({
        message: "Invalid project slug.",
      });
    }

    const project = await Project.findOne({ slug });

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.json(project);
  } catch (error) {
    console.error("GET PROJECT BY SLUG ERROR:", error);

    res.status(500).json({
      message: "Failed to load project.",
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
    console.error("GET PROJECT BY ID ERROR:", error);

    res.status(500).json({
      message: "Failed to load project.",
    });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
export const createProject = async (req, res) => {
  try {
    const payload = normalizeProjectPayload(pickAllowedFields(req.body));

    const errors = validateProjectPayload(payload, {
      isCreate: true,
    });

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: Object.values(errors)[0],
        errors,
      });
    }

    const project = await Project.create(payload);

    res.status(201).json(project);
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "A project with this slug already exists.",
      });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "Project data is invalid.",
      });
    }

    res.status(400).json({
      message: "Failed to create project.",
    });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
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

    const payload = normalizeProjectPayload(pickAllowedFields(req.body));

    /*
     * Thumbnail is optional.
     * Empty/null/undefined means no thumbnail.
     */
    if (
      Object.prototype.hasOwnProperty.call(payload, "thumbnail") &&
      (payload.thumbnail === null || payload.thumbnail === undefined)
    ) {
      payload.thumbnail = "";
    }

    const errors = validateProjectPayload(payload);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: Object.values(errors)[0],
        errors,
      });
    }

    /*
     * Update ONLY allowed Project fields.
     */
    for (const field of ALLOWED_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(payload, field)) {
        project[field] = payload[field];
      }
    }

    const updatedProject = await project.save();

    res.json(updatedProject);
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "A project with this slug already exists.",
      });
    }

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "Project data is invalid.",
      });
    }

    res.status(400).json({
      message: "Failed to update project.",
    });
  }
};

// @desc    Reorder projects
// @route   PUT /api/projects/reorder
// @access  Private/Admin
export const reorderProjects = async (req, res) => {
  try {
    const { projectIds } = req.body;

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({
        message: "projectIds must be a non-empty array.",
      });
    }

    if (projectIds.length > 1000) {
      return res.status(400).json({
        message: "Too many project IDs.",
      });
    }

    const invalidId = projectIds.find(
      (id) => typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id),
    );

    if (invalidId) {
      return res.status(400).json({
        message: "One or more project IDs are invalid.",
      });
    }

    const uniqueIds = new Set(projectIds);

    if (uniqueIds.size !== projectIds.length) {
      return res.status(400).json({
        message: "Duplicate project IDs are not allowed.",
      });
    }

    const existingProjects = await Project.find().select("_id");

    /*
     * Require the complete project list so projects not
     * included in the request cannot accidentally lose order.
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
     * ONLY order is changed.
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
      message: "Failed to reorder projects.",
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
    console.error("DELETE PROJECT ERROR:", error);

    res.status(500).json({
      message: "Failed to delete project.",
    });
  }
};
