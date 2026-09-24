import mongoose from "mongoose";
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
  "enabled",
  "displayNumber",
  "order",
];

const ALLOWED_STATUS = ["completed", "in-progress", "prototype", "learning"];

function pickAllowedFields(source = {}) {
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => ALLOWED_FIELDS.includes(key)),
  );
}

function normalizeString(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim();
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item ?? "").trim()).filter(Boolean);
}

function normalizeMetrics(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => ({
      label: normalizeString(item.label),
      value: normalizeString(item.value),
    }))
    .filter((item) => item.label || item.value);
}

function normalizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();

    if (normalized === "true") {
      return true;
    }

    if (normalized === "false") {
      return false;
    }
  }

  return fallback;
}

function normalizeNumber(value, fallback = 0) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return number;
}

function normalizeProjectData(body = {}, existing = {}) {
  const data = pickAllowedFields(body);

  if ("title" in data) {
    data.title = normalizeString(data.title, existing.title || "");
  }

  if ("slug" in data) {
    data.slug = normalizeString(data.slug, existing.slug || "").toLowerCase();
  }

  if ("category" in data) {
    data.category = normalizeString(
      data.category,
      existing.category || "AI/ML",
    );
  }

  if ("icon" in data) {
    data.icon = normalizeString(data.icon, existing.icon || "💻");
  }

  if ("overview" in data) {
    data.overview = normalizeString(data.overview, existing.overview || "");
  }

  if ("thumbnail" in data) {
    data.thumbnail = normalizeString(data.thumbnail, existing.thumbnail || "");
  }

  if ("problem" in data) {
    data.problem = normalizeString(data.problem, existing.problem || "");
  }

  if ("whatIBuilt" in data) {
    data.whatIBuilt = normalizeString(
      data.whatIBuilt,
      existing.whatIBuilt || "",
    );
  }

  if ("result" in data) {
    data.result = normalizeString(data.result, existing.result || "");
  }

  if ("repoUrl" in data) {
    data.repoUrl = normalizeString(data.repoUrl, existing.repoUrl || "");
  }

  if ("liveUrl" in data) {
    data.liveUrl = normalizeString(data.liveUrl, existing.liveUrl || "");
  }

  if ("description" in data) {
    data.description = normalizeStringArray(data.description);
  }

  if ("workflow" in data) {
    data.workflow = normalizeStringArray(data.workflow);
  }

  if ("limitations" in data) {
    data.limitations = normalizeStringArray(data.limitations);
  }

  if ("future" in data) {
    data.future = normalizeStringArray(data.future);
  }

  if ("tech" in data) {
    data.tech = normalizeStringArray(data.tech);
  }

  if ("metrics" in data) {
    data.metrics = normalizeMetrics(data.metrics);
  }

  if ("featured" in data) {
    data.featured = normalizeBoolean(data.featured, existing.featured || false);
  }

  if ("enabled" in data) {
    data.enabled = normalizeBoolean(data.enabled, existing.enabled !== false);
  }

  if ("displayNumber" in data) {
    data.displayNumber = Math.max(
      0,
      Math.floor(
        normalizeNumber(data.displayNumber, existing.displayNumber || 0),
      ),
    );
  }

  if ("order" in data) {
    data.order = Math.max(
      0,
      Math.floor(normalizeNumber(data.order, existing.order || 0)),
    );
  }

  if ("status" in data) {
    const status = normalizeString(
      data.status,
      existing.status || "in-progress",
    );

    if (ALLOWED_STATUS.includes(status)) {
      data.status = status;
    } else {
      data.status = existing.status || "in-progress";
    }
  }

  return data;
}

function validateRequiredProjectFields(data) {
  const required = [
    "title",
    "slug",
    "overview",
    "problem",
    "whatIBuilt",
    "result",
  ];

  const missing = required.filter(
    (field) => !data[field] || String(data[field]).trim() === "",
  );

  return missing;
}

function normalizeProjectResponse(project) {
  if (!project) {
    return null;
  }

  const item =
    typeof project.toObject === "function" ? project.toObject() : project;

  return {
    ...item,
    enabled: item.enabled !== false,
    displayNumber: Number.isFinite(Number(item.displayNumber))
      ? Number(item.displayNumber)
      : 0,
    order: Number.isFinite(Number(item.order)) ? Number(item.order) : 0,
  };
}

async function normalizeProjectOrders() {
  const projects = await Project.find({})
    .sort({
      order: 1,
      displayNumber: 1,
      createdAt: 1,
      _id: 1,
    })
    .select("_id order displayNumber");

  if (!projects.length) {
    return [];
  }

  const bulkOperations = projects.map((project, index) => ({
    updateOne: {
      filter: { _id: project._id },
      update: {
        $set: {
          order: index,
          displayNumber: index + 1,
        },
      },
    },
  }));

  if (bulkOperations.length) {
    await Project.bulkWrite(bulkOperations);
  }

  return projects;
}

/*
|--------------------------------------------------------------------------
| GET ALL PROJECTS
|--------------------------------------------------------------------------
*/
export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .sort({
        order: 1,
        displayNumber: 1,
        createdAt: 1,
        _id: 1,
      })
      .lean();

    const publicProjects = projects.filter(
      (project) => project.enabled !== false,
    );

    res.json(publicProjects.map(normalizeProjectResponse));
  } catch (error) {
    console.error("GET PROJECTS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch projects.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PROJECT BY SLUG
|--------------------------------------------------------------------------
*/
export const getProjectBySlug = async (req, res) => {
  try {
    const slug = normalizeString(req.params.slug).toLowerCase();

    if (!slug) {
      return res.status(400).json({
        message: "Project slug is required.",
      });
    }

    const project = await Project.findOne({
      slug,
      enabled: { $ne: false },
    }).lean();

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    return res.json(normalizeProjectResponse(project));
  } catch (error) {
    console.error("GET PROJECT BY SLUG ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch project.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| GET PROJECT BY ID
|--------------------------------------------------------------------------
*/
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const project = await Project.findOne({
      _id: id,
      enabled: { $ne: false },
    }).lean();

    if (!project) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    return res.json(normalizeProjectResponse(project));
  } catch (error) {
    console.error("GET PROJECT BY ID ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch project.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| CREATE PROJECT
|--------------------------------------------------------------------------
*/
export const createProject = async (req, res) => {
  try {
    const data = normalizeProjectData(req.body);

    const missing = validateRequiredProjectFields(data);

    if (missing.length) {
      return res.status(400).json({
        message: "Required project fields are missing.",
        fields: missing,
      });
    }

    if (!data.status) {
      data.status = "in-progress";
    }

    if (!("enabled" in data)) {
      data.enabled = true;
    }

    if (!("featured" in data)) {
      data.featured = false;
    }

    const existingSlug = await Project.findOne({
      slug: data.slug,
    }).select("_id");

    if (existingSlug) {
      return res.status(409).json({
        message: "A project with this slug already exists.",
      });
    }

    const lastProject = await Project.findOne({})
      .sort({ order: -1 })
      .select("order displayNumber");

    const nextOrder = lastProject
      ? Math.max(
          normalizeNumber(lastProject.order, 0),
          normalizeNumber(lastProject.displayNumber, 1) - 1,
        ) + 1
      : 0;

    if (!Number.isFinite(Number(data.order)) || data.order < 0) {
      data.order = nextOrder;
    }

    if (
      !Number.isFinite(Number(data.displayNumber)) ||
      data.displayNumber <= 0
    ) {
      data.displayNumber = data.order + 1;
    }

    const project = await Project.create(data);

    await normalizeProjectOrders();

    const createdProject = await Project.findById(project._id).lean();

    return res.status(201).json({
      message: "Project created successfully.",
      project: normalizeProjectResponse(createdProject),
    });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "A project with this slug already exists.",
      });
    }

    return res.status(500).json({
      message: "Failed to create project.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| UPDATE PROJECT
|--------------------------------------------------------------------------
*/
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

    const data = normalizeProjectData(req.body, project.toObject());

    if ("title" in data && !data.title) {
      return res.status(400).json({
        message: "Project title is required.",
      });
    }

    if ("slug" in data && !data.slug) {
      return res.status(400).json({
        message: "Project slug is required.",
      });
    }

    if ("slug" in data) {
      const duplicate = await Project.findOne({
        slug: data.slug,
        _id: { $ne: id },
      }).select("_id");

      if (duplicate) {
        return res.status(409).json({
          message: "A project with this slug already exists.",
        });
      }
    }

    Object.assign(project, data);

    await project.save();

    await normalizeProjectOrders();

    const updatedProject = await Project.findById(id).lean();

    return res.json({
      message: "Project updated successfully.",
      project: normalizeProjectResponse(updatedProject),
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);

    if (error?.code === 11000) {
      return res.status(409).json({
        message: "A project with this slug already exists.",
      });
    }

    return res.status(500).json({
      message: "Failed to update project.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| REORDER PROJECTS
|--------------------------------------------------------------------------
*/
export const reorderProjects = async (req, res) => {
  try {
    const incoming = Array.isArray(req.body?.projects)
      ? req.body.projects
      : Array.isArray(req.body)
        ? req.body
        : [];

    if (!incoming.length) {
      return res.status(400).json({
        message: "A non-empty projects array is required.",
      });
    }

    const normalizedIds = incoming
      .map((item) => {
        if (typeof item === "string") {
          return {
            id: item,
            order: null,
            displayNumber: null,
          };
        }

        return {
          id: item?.id || item?._id,
          order: item?.order,
          displayNumber: item?.displayNumber,
        };
      })
      .filter((item) => mongoose.Types.ObjectId.isValid(item.id));

    if (!normalizedIds.length) {
      return res.status(400).json({
        message: "No valid project IDs were supplied.",
      });
    }

    const uniqueIds = [
      ...new Set(normalizedIds.map((item) => String(item.id))),
    ];

    const existingProjects = await Project.find({
      _id: { $in: uniqueIds },
    }).select("_id");

    const existingIds = new Set(
      existingProjects.map((project) => String(project._id)),
    );

    const operations = [];

    normalizedIds.forEach((item, index) => {
      if (!existingIds.has(String(item.id))) {
        return;
      }

      operations.push({
        updateOne: {
          filter: {
            _id: item.id,
          },
          update: {
            $set: {
              order: index,
              displayNumber: index + 1,
            },
          },
        },
      });
    });

    if (!operations.length) {
      return res.status(400).json({
        message: "No matching projects were found.",
      });
    }

    await Project.bulkWrite(operations);

    /*
      Projects not included in the incoming list are
      preserved. They are appended after the reordered
      projects instead of being deleted or overwritten.
    */
    const reorderedIdSet = new Set(
      normalizedIds.map((item) => String(item.id)),
    );

    const remainingProjects = await Project.find({
      _id: {
        $nin: [...reorderedIdSet],
      },
    })
      .sort({
        order: 1,
        displayNumber: 1,
        createdAt: 1,
        _id: 1,
      })
      .select("_id");

    if (remainingProjects.length) {
      const remainingOperations = remainingProjects.map((project, index) => ({
        updateOne: {
          filter: {
            _id: project._id,
          },
          update: {
            $set: {
              order: normalizedIds.length + index,
              displayNumber: normalizedIds.length + index + 1,
            },
          },
        },
      }));

      await Project.bulkWrite(remainingOperations);
    }

    const projects = await Project.find({})
      .sort({
        order: 1,
        displayNumber: 1,
        createdAt: 1,
        _id: 1,
      })
      .lean();

    return res.json({
      message: "Project order updated successfully.",
      projects: projects.map(normalizeProjectResponse),
    });
  } catch (error) {
    console.error("REORDER PROJECTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to reorder projects.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| MOVE PROJECT UP
|--------------------------------------------------------------------------
*/
export const moveProjectUp = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const projects = await Project.find({}).sort({
      order: 1,
      displayNumber: 1,
      createdAt: 1,
      _id: 1,
    });

    const index = projects.findIndex(
      (project) => String(project._id) === String(id),
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    if (index === 0) {
      return res.json({
        message: "Project is already at the top.",
        projects: projects.map(normalizeProjectResponse),
      });
    }

    const previous = projects[index - 1];
    const current = projects[index];

    const currentOrder = current.order;
    const currentDisplay = current.displayNumber;

    current.order = previous.order;
    current.displayNumber = previous.displayNumber;

    previous.order = currentOrder;
    previous.displayNumber = currentDisplay;

    await current.save();
    await previous.save();

    const updatedProjects = await Project.find({})
      .sort({
        order: 1,
        displayNumber: 1,
        createdAt: 1,
        _id: 1,
      })
      .lean();

    return res.json({
      message: "Project moved up successfully.",
      projects: updatedProjects.map(normalizeProjectResponse),
    });
  } catch (error) {
    console.error("MOVE PROJECT UP ERROR:", error);

    return res.status(500).json({
      message: "Failed to move project up.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| MOVE PROJECT DOWN
|--------------------------------------------------------------------------
*/
export const moveProjectDown = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid project ID.",
      });
    }

    const projects = await Project.find({}).sort({
      order: 1,
      displayNumber: 1,
      createdAt: 1,
      _id: 1,
    });

    const index = projects.findIndex(
      (project) => String(project._id) === String(id),
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Project not found.",
      });
    }

    if (index === projects.length - 1) {
      return res.json({
        message: "Project is already at the bottom.",
        projects: projects.map(normalizeProjectResponse),
      });
    }

    const current = projects[index];
    const next = projects[index + 1];

    const currentOrder = current.order;
    const currentDisplay = current.displayNumber;

    current.order = next.order;
    current.displayNumber = next.displayNumber;

    next.order = currentOrder;
    next.displayNumber = currentDisplay;

    await current.save();
    await next.save();

    const updatedProjects = await Project.find({})
      .sort({
        order: 1,
        displayNumber: 1,
        createdAt: 1,
        _id: 1,
      })
      .lean();

    return res.json({
      message: "Project moved down successfully.",
      projects: updatedProjects.map(normalizeProjectResponse),
    });
  } catch (error) {
    console.error("MOVE PROJECT DOWN ERROR:", error);

    return res.status(500).json({
      message: "Failed to move project down.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| SWAP TWO PROJECTS
|--------------------------------------------------------------------------
*/
export const swapProjects = async (req, res) => {
  try {
    const firstId = req.body?.firstId || req.body?.projectId || req.body?.id;

    const secondId =
      req.body?.secondId || req.body?.targetId || req.body?.targetProjectId;

    if (
      !mongoose.Types.ObjectId.isValid(firstId) ||
      !mongoose.Types.ObjectId.isValid(secondId)
    ) {
      return res.status(400).json({
        message: "Two valid project IDs are required.",
      });
    }

    if (String(firstId) === String(secondId)) {
      return res.status(400).json({
        message: "The two projects must be different.",
      });
    }

    const [first, second] = await Promise.all([
      Project.findById(firstId),
      Project.findById(secondId),
    ]);

    if (!first || !second) {
      return res.status(404).json({
        message: "One or both projects were not found.",
      });
    }

    const firstOrder = first.order;
    const firstDisplay = first.displayNumber;

    first.order = second.order;
    first.displayNumber = second.displayNumber;

    second.order = firstOrder;
    second.displayNumber = firstDisplay;

    await first.save();
    await second.save();

    const projects = await Project.find({})
      .sort({
        order: 1,
        displayNumber: 1,
        createdAt: 1,
        _id: 1,
      })
      .lean();

    return res.json({
      message: "Projects swapped successfully.",
      projects: projects.map(normalizeProjectResponse),
    });
  } catch (error) {
    console.error("SWAP PROJECTS ERROR:", error);

    return res.status(500).json({
      message: "Failed to swap projects.",
    });
  }
};

/*
|--------------------------------------------------------------------------
| DELETE PROJECT
|--------------------------------------------------------------------------
*/
export const deleteProject = async (req, res) => {
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
      Delete is intentionally explicit and remains protected
      by the admin route middleware.

      No related projects, settings or other data are removed.
    */
    await Project.deleteOne({
      _id: id,
    });

    await normalizeProjectOrders();

    return res.json({
      message: "Project deleted successfully.",
      deletedProjectId: id,
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete project.",
    });
  }
};
