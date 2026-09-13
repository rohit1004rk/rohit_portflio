import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";

const emptyProject = {
  title: "",
  slug: "",
  category: "",
  icon: "",
  overview: "",
  thumbnail: "",
  description: "",
  problem: "",
  whatIBuilt: "",
  result: "",
  workflow: "",
  limitations: "",
  future: "",
  metrics: "",
  tech: "",
  repoUrl: "",
  liveUrl: "",
  status: "completed",
  featured: false,
  order: 0,
};

const toFormText = (value) => {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => toFormText(item)).join("\n");
  }

  if (typeof value === "object") {
    if (typeof value.text === "string") return value.text;
    if (typeof value.content === "string") return value.content;
    if (typeof value.description === "string") return value.description;

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "";
    }
  }

  return "";
};

const cleanText = (value) => toFormText(value).trim();

const basicFields = [
  {
    name: "title",
    label: "Project Title",
    type: "text",
    placeholder: "Enter project title",
    required: true,
    half: true,
  },
  {
    name: "slug",
    label: "Slug",
    type: "text",
    placeholder: "project-slug",
    half: true,
  },
  {
    name: "category",
    label: "Category",
    type: "text",
    placeholder: "AI / Full Stack / Web",
    half: true,
  },
  {
    name: "icon",
    label: "Project Icon",
    type: "text",
    placeholder: "💻",
    half: true,
  },
  {
    name: "order",
    label: "Display Order",
    type: "number",
    placeholder: "0",
    half: true,
  },
];

const textareaFields = [
  {
    name: "overview",
    label: "Overview",
    placeholder: "Short project overview...",
    rows: 3,
  },
  {
    name: "description",
    label: "Description",
    placeholder: "Detailed project description...",
    rows: 4,
  },
  {
    name: "problem",
    label: "Problem",
    placeholder: "What problem does this project solve?",
    rows: 3,
  },
  {
    name: "whatIBuilt",
    label: "What I Built",
    placeholder: "What did you build?",
    rows: 3,
  },
  {
    name: "result",
    label: "Result",
    placeholder: "Project result or outcome...",
    rows: 3,
  },
  {
    name: "workflow",
    label: "Workflow",
    placeholder: "How does the project work?",
    rows: 3,
  },
  {
    name: "limitations",
    label: "Limitations",
    placeholder: "Known limitations...",
    rows: 3,
  },
  {
    name: "future",
    label: "Future Improvements",
    placeholder: "Future improvements...",
    rows: 3,
  },
  {
    name: "metrics",
    label: "Metrics",
    placeholder: "Performance or project metrics...",
    rows: 3,
  },
];

function AdminProjectsPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyProject);
  const [originalProject, setOriginalProject] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [thumbnailFileName, setThumbnailFileName] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    loadProjects();
  }, [token, navigate]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/projects");

      if (!response.ok) {
        throw new Error("Failed to load projects.");
      }

      const data = await response.json();

      const projectList = Array.isArray(data)
        ? data
        : Array.isArray(data?.projects)
          ? data.projects
          : [];

      const sortedProjects = [...projectList].sort(
        (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
      );

      setProjects(sortedProjects);
      setOrderDirty(false);
    } catch (err) {
      setError(err.message || "Could not load projects.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleThumbnailFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    // Keep the MongoDB payload reasonably sized while supporting
    // local image uploads without changing the Project schema.
    if (file.size > 5 * 1024 * 1024) {
      setError("Thumbnail image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((current) => ({
        ...current,
        thumbnail: String(reader.result || ""),
      }));
      setThumbnailFileName(file.name);
      setError("");
      setSuccess("");
    };

    reader.onerror = () => {
      setError("Could not read the selected image.");
    };

    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setForm(emptyProject);
    setOriginalProject(null);
    setEditingId(null);
    setThumbnailFileName("");
    setError("");
    setSuccess("");
  };

  const handleEdit = (project) => {
    setEditingId(project._id);
    setOriginalProject(project);
    setThumbnailFileName("");

    setForm({
      title: toFormText(project.title),
      slug: toFormText(project.slug),
      category: toFormText(project.category),
      icon: toFormText(project.icon),
      overview: toFormText(project.overview),
      thumbnail: toFormText(project.thumbnail),
      description: toFormText(project.description),
      problem: toFormText(project.problem),
      whatIBuilt: toFormText(project.whatIBuilt),
      result: toFormText(project.result),
      workflow: toFormText(project.workflow),
      limitations: toFormText(project.limitations),
      future: toFormText(project.future),
      metrics: toFormText(project.metrics),
      tech: Array.isArray(project.tech)
        ? project.tech.map((item) => toFormText(item)).join(", ")
        : toFormText(project.tech),
      repoUrl: toFormText(project.repoUrl),
      liveUrl: toFormText(project.liveUrl),
      status: (() => {
        const status = toFormText(project.status).trim().toLowerCase();
        if (status === "completed") return "completed";
        if (status === "in progress" || status === "in-progress")
          return "in-progress";
        if (status === "prototype") return "prototype";
        if (status === "learning") return "learning";
        return "in-progress";
      })(),
      featured: Boolean(project.featured),
      order: project.order ?? 0,
    });

    setSuccess("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // -----------------------------
  // Project ordering
  // -----------------------------

  const normalizeProjectOrder = (list) =>
    list.map((project, index) => ({
      ...project,
      order: index + 1,
    }));

  const handleDragStart = (event, projectId) => {
    setDraggedProjectId(projectId);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", projectId);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event, targetProjectId) => {
    event.preventDefault();

    const sourceProjectId =
      event.dataTransfer.getData("text/plain") || draggedProjectId;

    if (!sourceProjectId || sourceProjectId === targetProjectId) {
      setDraggedProjectId(null);
      return;
    }

    setProjects((current) => {
      const sourceIndex = current.findIndex(
        (project) => project._id === sourceProjectId,
      );

      const targetIndex = current.findIndex(
        (project) => project._id === targetProjectId,
      );

      if (sourceIndex === -1 || targetIndex === -1) {
        return current;
      }

      const reordered = [...current];

      const [movedProject] = reordered.splice(sourceIndex, 1);

      reordered.splice(targetIndex, 0, movedProject);

      setOrderDirty(true);
      setSuccess("");
      setError("");

      return reordered.map((project, index) => ({
        ...project,
        order: index + 1,
      }));
    });

    setDraggedProjectId(null);
  };

  const handleDragEnd = () => {
    setDraggedProjectId(null);
  };

  const handleSaveOrder = async () => {
    if (!orderDirty || projects.length === 0) {
      return;
    }

    try {
      setOrderSaving(true);
      setError("");
      setSuccess("");

      const orderedProjects = projects;

      const response = await fetch("/api/projects/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          projectIds: orderedProjects.map((project) => project._id),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to save project order.");
      }

      const savedProjects = Array.isArray(data.projects)
        ? data.projects
        : orderedProjects;

      setProjects(normalizeProjectOrder(savedProjects));
      setOrderDirty(false);
      setSuccess("Project order saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save project order.");
    } finally {
      setOrderSaving(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!cleanText(form.title)) {
      setError("Project title is required.");
      return;
    }

    try {
      setSaving(true);

      const formValue = (name) => cleanText(form[name]);

      const unchangedValue = (name) => {
        if (!editingId || !originalProject) {
          return formValue(name);
        }

        const originalValue = originalProject[name];
        const originalFormValue = toFormText(originalValue);

        if (formValue(name) === originalFormValue.trim()) {
          return originalValue;
        }

        return formValue(name);
      };

      const payload = {
        ...form,
        title: formValue("title"),
        slug: formValue("slug"),
        category: formValue("category"),
        icon: formValue("icon"),
        overview: unchangedValue("overview"),
        thumbnail: formValue("thumbnail"),
        description: unchangedValue("description"),
        problem: unchangedValue("problem"),
        whatIBuilt: unchangedValue("whatIBuilt"),
        result: unchangedValue("result"),
        workflow: unchangedValue("workflow"),
        limitations: unchangedValue("limitations"),
        future: unchangedValue("future"),
        metrics: unchangedValue("metrics"),
        repoUrl: formValue("repoUrl"),
        liveUrl: formValue("liveUrl"),
        tech: formValue("tech")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        order: Number(form.order) || 0,
        featured: Boolean(form.featured),
      };

      const url = editingId ? `/api/projects/${editingId}` : "/api/projects";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to save project.");
      }

      const wasEditing = Boolean(editingId);

      resetForm();
      setSuccess(
        wasEditing
          ? "Project updated successfully."
          : "Project added successfully.",
      );

      await loadProjects();
    } catch (err) {
      setError(err.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete project.");
      }

      setProjects((current) => current.filter((project) => project._id !== id));

      if (editingId === id) {
        resetForm();
      }

      setSuccess("Project deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete project.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <>
        <style>{adminProjectsStyles}</style>

        <div className="admin-projects-loading">
          <div className="admin-loading-spinner" />
          <p>Loading projects...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{adminProjectsStyles}</style>

      <div className="admin-projects-layout">
        <AdminSidebar onLogout={handleLogout} />

        <main className="admin-projects-main">
          <div className="admin-projects-container">
            {/* Header */}
            <header className="projects-page-header">
              <div>
                <div className="projects-breadcrumb">
                  ADMIN PANEL <span>/</span> PROJECTS
                </div>

                <h1>Projects Management</h1>

                <p>
                  Add, edit and manage the projects displayed on your portfolio.
                </p>
              </div>

              <button
                type="button"
                className="projects-dashboard-btn"
                onClick={() => navigate("/admin")}
              >
                <span>←</span>
                Dashboard
              </button>
            </header>

            {/* Alerts */}
            {error && (
              <div className="projects-alert projects-alert-error">
                <span className="alert-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="projects-alert projects-alert-success">
                <span className="alert-icon">✓</span>
                <span>{success}</span>
              </div>
            )}

            {/* Form */}
            <section className="projects-card">
              <div className="projects-card-header">
                <div className="section-icon">✦</div>

                <div>
                  <h2>{editingId ? "Edit Project" : "Add New Project"}</h2>

                  <p>
                    {editingId
                      ? "Update the selected project information."
                      : "Create a new project for your portfolio."}
                  </p>
                </div>

                {editingId && (
                  <button
                    type="button"
                    className="cancel-edit-btn"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Basic Information */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>01</span>
                    Basic Information
                  </div>

                  <div className="projects-form-grid">
                    {basicFields.map((field) => (
                      <div
                        className={`project-field ${
                          field.half ? "field-half" : ""
                        }`}
                        key={field.name}
                      >
                        <label htmlFor={`project-${field.name}`}>
                          {field.label}
                          {field.required && (
                            <span className="required">*</span>
                          )}
                        </label>

                        <input
                          id={`project-${field.name}`}
                          name={field.name}
                          type={field.type}
                          value={form[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          required={field.required}
                          min={field.type === "number" ? "0" : undefined}
                          maxLength={field.type === "text" ? 200 : undefined}
                        />
                      </div>
                    ))}

                    <div className="project-field field-half">
                      <label htmlFor="project-status">Status</label>

                      <select
                        id="project-status"
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                      >
                        <option value="completed">Completed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="prototype">Prototype</option>
                        <option value="learning">Learning</option>
                      </select>
                    </div>

                    <div className="project-field field-half">
                      <label htmlFor="project-tech">Tech Stack</label>

                      <input
                        id="project-tech"
                        name="tech"
                        type="text"
                        value={form.tech}
                        onChange={handleChange}
                        placeholder="React, Node.js, MongoDB"
                      />

                      <small>Separate technologies with commas.</small>
                    </div>
                  </div>

                  {/* Thumbnail - Optional: URL OR Device Upload */}
                  <div className="thumbnail-field standalone-thumbnail-field">
                    <div className="thumbnail-field-header">
                      <label htmlFor="project-thumbnail-url">
                        Thumbnail Image
                      </label>
                      <span className="optional-label">Optional</span>
                    </div>

                    <input
                      id="project-thumbnail-url"
                      name="thumbnail"
                      type="text"
                      value={
                        String(form.thumbnail || "").startsWith("data:image/")
                          ? ""
                          : form.thumbnail
                      }
                      onChange={(event) => {
                        handleChange(event);
                        setThumbnailFileName("");
                      }}
                      placeholder="Paste image URL (https://...)"
                    />

                    <div className="thumbnail-upload-divider">
                      <span>OR</span>
                    </div>

                    <label
                      htmlFor="project-thumbnail-file"
                      className="thumbnail-upload-label"
                    >
                      <span>↥</span>
                      <span>
                        {thumbnailFileName
                          ? thumbnailFileName
                          : "Upload image from device"}
                      </span>
                    </label>

                    <input
                      id="project-thumbnail-file"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailFile}
                      className="thumbnail-file-input"
                    />

                    {form.thumbnail && (
                      <div className="thumbnail-preview">
                        <img
                          src={form.thumbnail}
                          alt="Thumbnail preview"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <span>Preview</span>
                      </div>
                    )}

                    <small>
                      Optional. Use an image URL OR upload an image from your
                      device. You can also leave the thumbnail empty.
                    </small>
                  </div>
                </div>

                {/* Links */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>02</span>
                    Project Links
                  </div>

                  <div className="projects-form-grid">
                    <div className="project-field field-half">
                      <label htmlFor="project-repo">GitHub Repository</label>

                      <div className="input-with-icon">
                        <span>↗</span>

                        <input
                          id="project-repo"
                          name="repoUrl"
                          type="url"
                          value={form.repoUrl}
                          onChange={handleChange}
                          placeholder="https://github.com/..."
                        />
                      </div>
                    </div>

                    <div className="project-field field-half">
                      <label htmlFor="project-live">Live Demo</label>

                      <div className="input-with-icon">
                        <span>↗</span>

                        <input
                          id="project-live"
                          name="liveUrl"
                          type="url"
                          value={form.liveUrl}
                          onChange={handleChange}
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="form-section">
                  <div className="form-section-title">
                    <span>03</span>
                    Project Content
                  </div>

                  <div className="project-textarea-grid">
                    {textareaFields.map((field) => (
                      <div className="project-field" key={field.name}>
                        <label htmlFor={`project-${field.name}`}>
                          {field.label}
                        </label>

                        <textarea
                          id={`project-${field.name}`}
                          name={field.name}
                          value={form[field.name]}
                          onChange={handleChange}
                          rows={field.rows}
                          placeholder={field.placeholder}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured */}
                <div className="project-featured-box">
                  <label className="featured-control">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={form.featured}
                      onChange={handleChange}
                    />

                    <span className="custom-checkbox">
                      {form.featured ? "✓" : ""}
                    </span>

                    <span>
                      <strong>Featured Project</strong>
                      <small>
                        Show this project in the featured section of your
                        portfolio.
                      </small>
                    </span>
                  </label>
                </div>

                {/* Actions */}
                <div className="project-form-actions">
                  <button
                    type="button"
                    className="projects-secondary-btn"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="projects-primary-btn"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="button-spinner" />
                        Saving...
                      </>
                    ) : editingId ? (
                      <>
                        Update Project
                        <span>→</span>
                      </>
                    ) : (
                      <>
                        Add Project
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            {/* Existing Projects */}
            <section className="projects-card existing-projects-card">
              <div className="projects-card-header">
                <div className="section-icon section-icon-blue">▣</div>

                <div>
                  <h2>Existing Projects</h2>
                  <p>
                    {projects.length} project
                    {projects.length !== 1 ? "s" : ""} in your portfolio. Drag
                    projects to change their display order.
                  </p>
                </div>

                <div className="existing-projects-header-actions">
                  {orderDirty && (
                    <span className="order-unsaved-label">Order changed</span>
                  )}

                  <button
                    type="button"
                    className="save-order-btn"
                    onClick={handleSaveOrder}
                    disabled={!orderDirty || orderSaving}
                  >
                    {orderSaving ? (
                      <>
                        <span className="button-spinner" />
                        Saving Order...
                      </>
                    ) : (
                      <>
                        Save Order
                        <span>✓</span>
                      </>
                    )}
                  </button>

                  <div className="project-count">{projects.length}</div>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="projects-empty-state">
                  <div>▣</div>
                  <h3>No projects found</h3>
                  <p>Add your first project using the form above.</p>
                </div>
              ) : (
                <div className="projects-table-wrapper">
                  <table className="projects-management-table">
                    <thead>
                      <tr>
                        <th>PROJECT</th>
                        <th>CATEGORY</th>
                        <th>STATUS</th>
                        <th>FEATURED</th>
                        <th>ORDER</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {projects.map((project, index) => (
                        <tr
                          key={project._id}
                          draggable
                          onDragStart={(event) =>
                            handleDragStart(event, project._id)
                          }
                          onDragOver={handleDragOver}
                          onDrop={(event) => handleDrop(event, project._id)}
                          onDragEnd={handleDragEnd}
                          className={
                            draggedProjectId === project._id
                              ? "project-row-dragging"
                              : ""
                          }
                        >
                          <td>
                            <div className="project-table-name">
                              <button
                                type="button"
                                className="project-drag-handle"
                                draggable={false}
                                aria-label={`Drag ${project.title || "project"} to change position`}
                                title="Drag to change position"
                              >
                                ⋮⋮
                              </button>

                              <div className="project-table-icon">
                                {project.icon || "▣"}
                              </div>

                              <div>
                                <strong>
                                  {project.title || "Untitled Project"}
                                </strong>

                                <span>{project.slug || "No slug"}</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="category-pill">
                              {project.category || "—"}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`status-pill status-${String(
                                project.status || "",
                              )
                                .toLowerCase()
                                .replace(/\s+/g, "-")}`}
                            >
                              <span />
                              {project.status || "—"}
                            </span>
                          </td>

                          <td>
                            {project.featured ? (
                              <span className="featured-yes">✓ Featured</span>
                            ) : (
                              <span className="featured-no">Not Featured</span>
                            )}
                          </td>

                          <td>
                            <span className="order-number">{index + 1}</span>
                          </td>

                          <td>
                            <div className="project-actions">
                              <button
                                type="button"
                                className="table-edit-btn"
                                onClick={() => handleEdit(project)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="table-delete-btn"
                                onClick={() => handleDelete(project._id)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <div className="projects-footer-note">
              <span>●</span>
              Changes are saved directly to your portfolio database.
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

const adminProjectsStyles = `
  .admin-projects-layout {
    min-height: 100vh;
    background:
      radial-gradient(circle at 85% 10%, rgba(45, 212, 191, 0.06), transparent 30%),
      #0a0f14;
    color: #f1f5f9;
  }

  .admin-projects-main {
    min-height: 100vh;
    margin-left: 250px;
  }

  .admin-projects-container {
    width: min(1380px, calc(100% - 56px));
    margin: 0 auto;
    padding: 42px 0 70px;
  }

  .projects-page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 30px;
    margin-bottom: 30px;
  }

  .projects-breadcrumb {
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .projects-breadcrumb span {
    color: #334155;
    margin: 0 8px;
  }

  .projects-page-header h1 {
    margin: 0;
    font-size: clamp(28px, 3vw, 40px);
    line-height: 1.1;
    font-weight: 750;
    letter-spacing: -0.035em;
    color: #f8fafc;
  }

  .projects-page-header p {
    margin: 11px 0 0;
    color: #8190a3;
    font-size: 14px;
  }

  .projects-dashboard-btn,
  .cancel-edit-btn,
  .projects-secondary-btn,
  .projects-primary-btn,
  .table-edit-btn,
  .table-delete-btn {
    font: inherit;
    cursor: pointer;
    border: 0;
  }

  .projects-dashboard-btn {
    display: inline-flex;
    align-items: center;
    gap: 9px;
    min-height: 42px;
    padding: 0 16px;
    border: 1px solid #263442;
    border-radius: 9px;
    background: #111923;
    color: #cbd5e1;
    font-size: 13px;
    font-weight: 600;
    transition: 0.2s ease;
    white-space: nowrap;
  }

  .projects-dashboard-btn:hover {
    background: #17212d;
    border-color: #3b4b5d;
    transform: translateY(-1px);
  }

  .projects-alert {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 0 15px;
    margin-bottom: 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
  }

  .projects-alert-error {
    border: 1px solid rgba(248, 113, 113, 0.2);
    background: rgba(127, 29, 29, 0.18);
    color: #fca5a5;
  }

  .projects-alert-success {
    border: 1px solid rgba(45, 212, 191, 0.2);
    background: rgba(13, 148, 136, 0.11);
    color: #5eead4;
  }

  .alert-icon {
    width: 23px;
    height: 23px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: rgba(255,255,255,0.06);
    flex: 0 0 auto;
  }

  .projects-card {
    background: rgba(14, 21, 29, 0.92);
    border: 1px solid #1e2a36;
    border-radius: 15px;
    box-shadow: 0 18px 50px rgba(0,0,0,0.16);
    overflow: hidden;
    margin-bottom: 24px;
  }

  .projects-card-header {
    min-height: 84px;
    padding: 22px 25px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid #1e2a36;
  }

  .projects-card-header h2 {
    margin: 0;
    color: #f8fafc;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .projects-card-header p {
    margin: 5px 0 0;
    color: #718096;
    font-size: 12px;
  }

  .section-icon {
    width: 38px;
    height: 38px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid rgba(45, 212, 191, 0.18);
    border-radius: 9px;
    background: rgba(45, 212, 191, 0.08);
    color: #2dd4bf;
    font-size: 16px;
  }

  .section-icon-blue {
    border-color: rgba(96, 165, 250, 0.18);
    background: rgba(96, 165, 250, 0.08);
    color: #60a5fa;
  }

  .cancel-edit-btn {
    margin-left: auto;
    padding: 9px 13px;
    border: 1px solid #344354;
    border-radius: 8px;
    background: transparent;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 600;
  }

  .cancel-edit-btn:hover {
    color: #f8fafc;
    border-color: #64748b;
  }

  .form-section {
    padding: 26px;
    border-bottom: 1px solid #1e2a36;
  }

  .form-section-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    color: #cbd5e1;
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .form-section-title span {
    color: #2dd4bf;
    font-variant-numeric: tabular-nums;
  }

  .projects-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 19px 22px;
  }

  .project-field {
    min-width: 0;
  }

  .field-half {
    min-width: 0;
  }

  .project-field label {
    display: block;
    margin-bottom: 8px;
    color: #cbd5e1;
    font-size: 12px;
    font-weight: 650;
  }

  .required {
    color: #f87171;
    margin-left: 4px;
  }

  .project-field input,
  .project-field select,
  .project-field textarea {
    width: 100%;
    box-sizing: border-box;
    border: 1px solid #293746;
    border-radius: 9px;
    outline: none;
    background: #0b1219;
    color: #e2e8f0;
    font-family: inherit;
    font-size: 13px;
    transition:
      border-color 0.18s ease,
      box-shadow 0.18s ease,
      background 0.18s ease;
  }

  .project-field input,
  .project-field select {
    height: 43px;
    padding: 0 13px;
  }

  .project-field textarea {
    min-height: 96px;
    padding: 12px 13px;
    resize: vertical;
    line-height: 1.55;
  }

  .project-field input::placeholder,
  .project-field textarea::placeholder {
    color: #475569;
  }

  .project-field input:hover,
  .project-field select:hover,
  .project-field textarea:hover {
    border-color: #3b4c5e;
  }

  .project-field input:focus,
  .project-field select:focus,
  .project-field textarea:focus {
    border-color: #2dd4bf;
    background: #0d161f;
    box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.08);
  }

  .project-field select {
    cursor: pointer;
  }

  .project-field small {
    display: block;
    margin-top: 6px;
    color: #59697a;
    font-size: 10px;
  }

  .input-with-icon {
    position: relative;
  }

  .input-with-icon > span {
    position: absolute;
    left: 13px;
    top: 50%;
    transform: translateY(-50%);
    color: #64748b;
    pointer-events: none;
    z-index: 1;
  }

  .input-with-icon input {
    padding-left: 34px;
  }

  .project-textarea-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 22px;
  }

  .project-textarea-grid .project-field:first-child {
    grid-column: 1 / -1;
  }

  .project-featured-box {
    margin: 22px 26px 0;
    padding: 15px 17px;
    border: 1px solid #253442;
    border-radius: 10px;
    background: rgba(45, 212, 191, 0.035);
  }

  .featured-control {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
  }

  .featured-control input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .custom-checkbox {
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid #405263;
    border-radius: 5px;
    background: #0b1219;
    color: #061313;
    font-size: 13px;
    font-weight: 900;
  }

  .featured-control input:checked + .custom-checkbox {
    border-color: #2dd4bf;
    background: #2dd4bf;
  }

  .featured-control strong {
    display: block;
    color: #dbeafe;
    font-size: 13px;
    font-weight: 650;
  }

  .featured-control small {
    display: block;
    margin-top: 3px;
    color: #64748b;
    font-size: 11px;
  }

  .project-form-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: 22px 26px;
  }

  .projects-secondary-btn,
  .projects-primary-btn {
    min-height: 43px;
    padding: 0 17px;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 700;
    transition: 0.2s ease;
  }

  .projects-secondary-btn {
    border: 1px solid #2b3948;
    background: transparent;
    color: #94a3b8;
  }

  .projects-secondary-btn:hover:not(:disabled) {
    border-color: #526273;
    color: #e2e8f0;
    background: #111923;
  }

  .projects-primary-btn {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    min-width: 145px;
    background: #2dd4bf;
    color: #06211e;
    box-shadow: 0 7px 22px rgba(45, 212, 191, 0.13);
  }

  .projects-primary-btn:hover:not(:disabled) {
    background: #5eead4;
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(45, 212, 191, 0.18);
  }

  .projects-primary-btn:disabled,
  .projects-secondary-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .button-spinner,
  .admin-loading-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: adminProjectSpin 0.7s linear infinite;
  }

  @keyframes adminProjectSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .project-count {
    margin-left: auto;
    min-width: 32px;
    height: 32px;
    display: grid;
    place-items: center;
    padding: 0 9px;
    border: 1px solid #293746;
    border-radius: 8px;
    background: #0b1219;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 700;
  }

  .projects-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .projects-management-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 850px;
  }

  .projects-management-table th {
    padding: 13px 20px;
    border-bottom: 1px solid #202c38;
    background: #0b1219;
    color: #607084;
    text-align: left;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.11em;
    white-space: nowrap;
  }

  .projects-management-table td {
    padding: 16px 20px;
    border-bottom: 1px solid #1b2732;
    color: #94a3b8;
    font-size: 12px;
    vertical-align: middle;
  }

  .projects-management-table tbody tr {
    transition: background 0.16s ease;
  }

  .projects-management-table tbody tr:hover {
    background: rgba(255,255,255,0.018);
  }

  .projects-management-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .existing-projects-header-actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: max-content;
  }

  .order-unsaved-label {
    color: #fbbf24;
    font-size: 10px;
    font-weight: 700;
    white-space: nowrap;
  }

  .save-order-btn {
    min-height: 34px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 12px;
    border: 1px solid rgba(45, 212, 191, 0.3);
    border-radius: 7px;
    background: rgba(45, 212, 191, 0.08);
    color: #5eead4;
    font: inherit;
    font-size: 10px;
    font-weight: 750;
    cursor: pointer;
    transition: 0.18s ease;
    white-space: nowrap;
  }

  .save-order-btn:hover:not(:disabled) {
    background: rgba(45, 212, 191, 0.15);
    border-color: rgba(45, 212, 191, 0.5);
    transform: translateY(-1px);
  }

  .save-order-btn:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  .project-row-dragging {
    opacity: 0.48;
  }

  .project-drag-handle {
    width: 25px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    padding: 0;
    border: 1px solid #263544;
    border-radius: 7px;
    background: #0b1219;
    color: #64748b;
    font-size: 14px;
    line-height: 1;
    cursor: grab;
    touch-action: none;
  }

  .project-drag-handle:hover {
    border-color: #3b4c5e;
    color: #2dd4bf;
    background: #101923;
  }

  .project-drag-handle:active {
    cursor: grabbing;
  }

  .order-number {
    font-variant-numeric: tabular-nums;
  }


  .thumbnail-field {
    position: relative;
  }

  .standalone-thumbnail-field {
    margin-top: 22px;
    padding: 18px;
    border: 1px solid #253442;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.012);
  }

  .thumbnail-field-header {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 8px;
  }

  .thumbnail-field-header label {
    margin-bottom: 0;
  }

  .optional-label {
    padding: 3px 7px;
    border: 1px solid #2a3947;
    border-radius: 5px;
    color: #64748b;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .thumbnail-upload-divider {
    display: flex;
    align-items: center;
    gap: 9px;
    margin: 9px 0;
    color: #536275;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .thumbnail-upload-divider::before,
  .thumbnail-upload-divider::after {
    content: "";
    height: 1px;
    flex: 1;
    background: #22303d;
  }

  .thumbnail-upload-label {
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 12px;
    border: 1px dashed #344554;
    border-radius: 8px;
    background: #0b1219;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 650;
    cursor: pointer;
    transition: 0.18s ease;
  }

  .thumbnail-upload-label:hover {
    border-color: #2dd4bf;
    color: #5eead4;
    background: rgba(45, 212, 191, 0.045);
  }

  .thumbnail-upload-label > span:first-child {
    color: #2dd4bf;
    font-size: 15px;
  }

  .thumbnail-file-input {
    display: none;
  }

  .thumbnail-preview {
    position: relative;
    min-height: 110px;
    margin-top: 10px;
    overflow: hidden;
    border: 1px solid #293746;
    border-radius: 9px;
    background: #080e14;
  }

  .thumbnail-preview img {
    width: 100%;
    height: 110px;
    display: block;
    object-fit: cover;
  }

  .thumbnail-preview span {
    position: absolute;
    left: 9px;
    bottom: 8px;
    padding: 4px 7px;
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 5px;
    background: rgba(5, 10, 15, 0.82);
    color: #cbd5e1;
    font-size: 9px;
    font-weight: 700;
  }

  .project-table-name {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 220px;
  }

  .project-table-icon {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid #2a3947;
    border-radius: 8px;
    background: #0b1219;
    color: #cbd5e1;
    font-size: 16px;
  }

  .project-table-name strong {
    display: block;
    max-width: 260px;
    overflow: hidden;
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .project-table-name span {
    display: block;
    margin-top: 3px;
    color: #536275;
    font-size: 10px;
  }

  .category-pill {
    display: inline-flex;
    max-width: 180px;
    overflow: hidden;
    padding: 5px 8px;
    border: 1px solid #263544;
    border-radius: 6px;
    background: #0b1219;
    color: #94a3b8;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  .status-pill > span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #64748b;
  }

  .status-completed {
    color: #5eead4;
  }

  .status-completed > span {
    background: #2dd4bf;
  }

  .status-in-progress {
    color: #fbbf24;
  }

  .status-in-progress > span {
    background: #fbbf24;
  }

  .status-prototype {
    color: #a78bfa;
  }

  .status-prototype > span {
    background: #8b5cf6;
  }

  .status-learning {
    color: #60a5fa;
  }

  .status-learning > span {
    background: #60a5fa;
  }

  .featured-yes {
    color: #5eead4;
    font-size: 11px;
    font-weight: 650;
    white-space: nowrap;
  }

  .featured-no {
    color: #59697a;
    font-size: 11px;
    white-space: nowrap;
  }

  .order-number {
    display: inline-grid;
    place-items: center;
    min-width: 27px;
    height: 27px;
    border-radius: 6px;
    background: #101923;
    color: #94a3b8;
    font-size: 11px;
  }

  .project-actions {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .table-edit-btn,
  .table-delete-btn {
    min-height: 31px;
    padding: 0 10px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    transition: 0.18s ease;
  }

  .table-edit-btn {
    border: 1px solid #2b4650;
    background: rgba(45, 212, 191, 0.06);
    color: #5eead4;
  }

  .table-edit-btn:hover {
    background: rgba(45, 212, 191, 0.13);
    border-color: #39727a;
  }

  .table-delete-btn {
    border: 1px solid rgba(248, 113, 113, 0.18);
    background: rgba(248, 113, 113, 0.045);
    color: #f87171;
  }

  .table-delete-btn:hover {
    background: rgba(248, 113, 113, 0.11);
    border-color: rgba(248, 113, 113, 0.32);
  }

  .projects-empty-state {
    padding: 65px 25px;
    text-align: center;
  }

  .projects-empty-state > div {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    margin: 0 auto 15px;
    border: 1px solid #263544;
    border-radius: 12px;
    background: #0b1219;
    color: #64748b;
  }

  .projects-empty-state h3 {
    margin: 0;
    color: #cbd5e1;
    font-size: 15px;
  }

  .projects-empty-state p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 12px;
  }

  .projects-footer-note {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    color: #526174;
    font-size: 10px;
  }

  .projects-footer-note span {
    color: #2dd4bf;
    font-size: 8px;
  }

  .admin-projects-loading {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 14px;
    background: #0a0f14;
    color: #64748b;
    font-size: 13px;
  }

  .admin-projects-loading .admin-loading-spinner {
    width: 28px;
    height: 28px;
    color: #2dd4bf;
    border-width: 3px;
  }

  /* Tablet */
  @media (max-width: 1100px) {
    .admin-projects-main {
      margin-left: 220px;
    }

    .admin-projects-container {
      width: min(100% - 36px, 1000px);
    }

    .projects-form-grid,
    .project-textarea-grid {
      grid-template-columns: 1fr;
    }

    .project-textarea-grid .project-field:first-child {
      grid-column: auto;
    }
  }

  /* Mobile */
  @media (max-width: 760px) {
    .admin-projects-main {
      margin-left: 0;
    }

    .admin-projects-container {
      width: calc(100% - 24px);
      padding: 22px 0 45px;
    }

    .projects-page-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 18px;
      margin-bottom: 22px;
    }

    .projects-page-header h1 {
      font-size: 27px;
    }

    .projects-page-header p {
      max-width: 340px;
      line-height: 1.55;
    }

    .projects-dashboard-btn {
      width: 100%;
      justify-content: center;
    }

    .projects-card {
      border-radius: 12px;
      margin-bottom: 17px;
    }

    .projects-card-header {
      min-height: auto;
      padding: 18px;
      gap: 11px;
    }

    .section-icon {
      width: 34px;
      height: 34px;
    }

    .projects-card-header h2 {
      font-size: 16px;
    }

    .projects-card-header p {
      font-size: 11px;
      line-height: 1.45;
    }

    .existing-projects-header-actions {
      width: 100%;
      margin-left: 0;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .order-unsaved-label {
      margin-right: auto;
    }

    .save-order-btn {
      min-height: 36px;
      padding: 0 11px;
    }

    .project-count {
      min-width: 29px;
      height: 29px;
      margin-left: 0;
    }

    .cancel-edit-btn {
      margin-left: auto;
      padding: 8px 9px;
      font-size: 10px;
    }

    .form-section {
      padding: 19px 16px;
    }

    .form-section-title {
      margin-bottom: 16px;
      font-size: 10px;
    }

    .projects-form-grid {
      gap: 15px;
    }

    .project-textarea-grid {
      gap: 15px;
    }

    .standalone-thumbnail-field {
      margin-top: 17px;
      padding: 14px;
    }

    .project-field input,
    .project-field select {
      height: 45px;
      font-size: 13px;
    }

    .project-field textarea {
      min-height: 105px;
      font-size: 13px;
    }

    .project-featured-box {
      margin: 17px 16px 0;
      padding: 13px;
    }

    .featured-control {
      align-items: flex-start;
    }

    .featured-control strong {
      font-size: 12px;
    }

    .featured-control small {
      line-height: 1.45;
    }

    .project-form-actions {
      padding: 17px 16px;
      flex-direction: column-reverse;
      gap: 9px;
    }

    .projects-primary-btn,
    .projects-secondary-btn {
      width: 100%;
    }

    .projects-table-wrapper {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .projects-management-table {
      min-width: 850px;
    }

    .projects-management-table th,
    .projects-management-table td {
      padding-left: 14px;
      padding-right: 14px;
    }

    .projects-footer-note {
      text-align: center;
      line-height: 1.5;
      padding: 0 15px;
    }
  }

  /* Small phones */
  @media (max-width: 420px) {
    .admin-projects-container {
      width: calc(100% - 18px);
    }

    .projects-page-header h1 {
      font-size: 24px;
    }

    .projects-card-header {
      padding: 15px;
      flex-wrap: wrap;
    }

    .existing-projects-header-actions {
      gap: 7px;
    }

    .project-drag-handle {
      width: 23px;
    }

    .form-section {
      padding: 17px 13px;
    }

    .project-featured-box {
      margin-left: 13px;
      margin-right: 13px;
    }

    .standalone-thumbnail-field {
      margin-left: 13px;
      margin-right: 13px;
    }

    .project-form-actions {
      padding-left: 13px;
      padding-right: 13px;
    }
  }
`;

export default AdminProjectsPage;
