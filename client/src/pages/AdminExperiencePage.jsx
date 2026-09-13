import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";

const emptyExperience = {
  title: "",
  company: "",
  type: "Experience",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
  technologies: "",
  certificateId: "",
  order: 0,
  visible: true,
};

const textValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return "";
};

const normalizeExperience = (experience) => ({
  title: textValue(experience?.title),
  company: textValue(experience?.company),
  type: textValue(experience?.type) || "Experience",
  location: textValue(experience?.location),
  startDate: textValue(experience?.startDate),
  endDate: textValue(experience?.endDate),
  current: Boolean(experience?.current),
  description: textValue(experience?.description),
  technologies: Array.isArray(experience?.technologies)
    ? experience.technologies.map(textValue).join(", ")
    : textValue(experience?.technologies),
  certificateId:
    typeof experience?.certificateId === "object" && experience?.certificateId
      ? textValue(experience.certificateId._id)
      : textValue(experience?.certificateId),
  order: experience?.order ?? 0,
  visible: experience?.visible !== false,
});

function AdminExperiencePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [experiences, setExperiences] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [form, setForm] = useState(emptyExperience);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);
  const [draggedExperienceId, setDraggedExperienceId] = useState(null);
  const [orderDirty, setOrderDirty] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    loadData();
  }, [token, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [experienceResponse, certificateResponse] = await Promise.all([
        fetch("/api/experiences", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/certificates"),
      ]);

      if (
        experienceResponse.status === 401 ||
        experienceResponse.status === 403
      ) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      const experienceData = await experienceResponse.json().catch(() => []);
      const certificateData = await certificateResponse.json().catch(() => []);

      if (!experienceResponse.ok) {
        throw new Error(
          experienceData?.message || "Failed to load experiences.",
        );
      }

      if (!certificateResponse.ok) {
        setCertificates([]);
      } else {
        setCertificates(
          Array.isArray(certificateData)
            ? certificateData
            : Array.isArray(certificateData?.certificates)
              ? certificateData.certificates
              : [],
        );
      }

      const list = Array.isArray(experienceData)
        ? experienceData
        : Array.isArray(experienceData?.experiences)
          ? experienceData.experiences
          : [];

      setExperiences(
        [...list].sort(
          (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
        ),
      );
      setOrderDirty(false);
    } catch (err) {
      setError(err.message || "Could not load experience data.");
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

  const resetForm = () => {
    setForm(emptyExperience);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleEdit = (experience) => {
    setEditingId(experience._id);
    setForm(normalizeExperience(experience));
    setError("");
    setSuccess("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      setError("Experience title is required.");
      return;
    }

    if (!form.company.trim()) {
      setError("Company or organization is required.");
      return;
    }

    if (!form.startDate.trim()) {
      setError("Start date is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),
        company: form.company.trim(),
        type: form.type.trim() || "Experience",
        location: form.location.trim(),
        startDate: form.startDate.trim(),
        endDate: form.current ? "" : form.endDate.trim(),
        current: Boolean(form.current),
        description: form.description.trim(),
        technologies: form.technologies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        certificateId: form.certificateId || null,
        order: Number(form.order) || 0,
        visible: Boolean(form.visible),
      };

      const url = editingId
        ? `/api/experiences/${editingId}`
        : "/api/experiences";

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
        throw new Error(data.message || "Failed to save experience.");
      }

      const wasEditing = Boolean(editingId);

      resetForm();
      setSuccess(
        wasEditing
          ? "Experience updated successfully."
          : "Experience added successfully.",
      );

      await loadData();
    } catch (err) {
      setError(err.message || "Failed to save experience.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this experience?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      const response = await fetch(`/api/experiences/${id}`, {
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
        throw new Error(data.message || "Failed to delete experience.");
      }

      setExperiences((current) =>
        current.filter((experience) => experience._id !== id),
      );

      if (editingId === id) {
        resetForm();
      }

      setSuccess("Experience deleted successfully.");
    } catch (err) {
      setError(err.message || "Failed to delete experience.");
    }
  };

  const handleDragStart = (event, experienceId) => {
    setDraggedExperienceId(experienceId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", experienceId);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event, targetExperienceId) => {
    event.preventDefault();

    const sourceExperienceId =
      event.dataTransfer.getData("text/plain") || draggedExperienceId;

    if (!sourceExperienceId || sourceExperienceId === targetExperienceId) {
      setDraggedExperienceId(null);
      return;
    }

    setExperiences((current) => {
      const sourceIndex = current.findIndex(
        (experience) => experience._id === sourceExperienceId,
      );

      const targetIndex = current.findIndex(
        (experience) => experience._id === targetExperienceId,
      );

      if (sourceIndex === -1 || targetIndex === -1) {
        return current;
      }

      const reordered = [...current];
      const [movedExperience] = reordered.splice(sourceIndex, 1);

      reordered.splice(targetIndex, 0, movedExperience);

      setOrderDirty(true);
      setSuccess("");
      setError("");

      return reordered.map((experience, index) => ({
        ...experience,
        order: index + 1,
      }));
    });

    setDraggedExperienceId(null);
  };

  const handleDragEnd = () => {
    setDraggedExperienceId(null);
  };

  const handleSaveOrder = async () => {
    if (!orderDirty || experiences.length === 0) return;

    try {
      setOrderSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/api/experiences/reorder", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          experienceIds: experiences.map((experience) => experience._id),
        }),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data.message || "Failed to save experience order.");
      }

      const saved = Array.isArray(data)
        ? data
        : Array.isArray(data?.experiences)
          ? data.experiences
          : experiences;

      setExperiences(
        [...saved].sort(
          (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
        ),
      );
      setOrderDirty(false);
      setSuccess("Experience order saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save experience order.");
    } finally {
      setOrderSaving(false);
    }
  };

  const getCertificateTitle = (certificateId) => {
    if (!certificateId) return "No certificate linked";

    const certificate = certificates.find((item) => item._id === certificateId);

    return certificate
      ? `${certificate.title || "Untitled"}${certificate.issuer ? ` — ${certificate.issuer}` : ""}`
      : "Certificate linked";
  };

  if (loading) {
    return (
      <>
        <style>{adminExperienceStyles}</style>
        <div className="admin-experience-loading">
          <div className="admin-loading-spinner" />
          <p>Loading experiences...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{adminExperienceStyles}</style>

      <div className="admin-experience-layout">
        <AdminSidebar
          onLogout={() => {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminUser");
            navigate("/admin/login");
          }}
        />

        <main className="admin-experience-main">
          <div className="admin-experience-container">
            <header className="experience-page-header">
              <div>
                <div className="experience-breadcrumb">
                  ADMIN PANEL <span>/</span> EXPERIENCE
                </div>

                <h1>Experience Management</h1>

                <p>
                  Add, edit and manage the professional experience displayed on
                  your portfolio.
                </p>
              </div>

              <button
                type="button"
                className="experience-dashboard-btn"
                onClick={() => navigate("/admin")}
              >
                <span>←</span>
                Dashboard
              </button>
            </header>

            {error && (
              <div className="experience-alert experience-alert-error">
                <span className="alert-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="experience-alert experience-alert-success">
                <span className="alert-icon">✓</span>
                <span>{success}</span>
              </div>
            )}

            <section className="experience-card">
              <div className="experience-card-header">
                <div className="section-icon">✦</div>

                <div>
                  <h2>
                    {editingId ? "Edit Experience" : "Add New Experience"}
                  </h2>

                  <p>
                    {editingId
                      ? "Update the selected experience information."
                      : "Create a professional experience entry for your portfolio."}
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
                <div className="form-section">
                  <div className="form-section-title">
                    <span>01</span>
                    Basic Information
                  </div>

                  <div className="experience-form-grid">
                    <div className="experience-field">
                      <label htmlFor="experience-title">
                        Role / Position <span className="required">*</span>
                      </label>

                      <input
                        id="experience-title"
                        name="title"
                        type="text"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. AI/ML Intern"
                        maxLength={200}
                        required
                      />
                    </div>

                    <div className="experience-field">
                      <label htmlFor="experience-company">
                        Company / Organization{" "}
                        <span className="required">*</span>
                      </label>

                      <input
                        id="experience-company"
                        name="company"
                        type="text"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="e.g. InternPe"
                        maxLength={200}
                        required
                      />
                    </div>

                    <div className="experience-field">
                      <label htmlFor="experience-type">Experience Type</label>

                      <select
                        id="experience-type"
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                      >
                        <option value="Experience">Experience</option>
                        <option value="Internship">Internship</option>
                        <option value="Training">Training</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Contract">Contract</option>
                        <option value="Entrepreneurship">
                          Entrepreneurship
                        </option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="experience-field">
                      <label htmlFor="experience-location">Location</label>

                      <input
                        id="experience-location"
                        name="location"
                        type="text"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Remote / India"
                        maxLength={150}
                      />
                    </div>

                    <div className="experience-field">
                      <label htmlFor="experience-start">
                        Start Date <span className="required">*</span>
                      </label>

                      <input
                        id="experience-start"
                        name="startDate"
                        type="text"
                        value={form.startDate}
                        onChange={handleChange}
                        placeholder="e.g. June 2026"
                        maxLength={50}
                        required
                      />
                    </div>

                    <div className="experience-field">
                      <label htmlFor="experience-end">End Date</label>

                      <input
                        id="experience-end"
                        name="endDate"
                        type="text"
                        value={form.endDate}
                        onChange={handleChange}
                        placeholder="e.g. August 2026"
                        maxLength={50}
                        disabled={form.current}
                      />
                    </div>

                    <div className="experience-field">
                      <label htmlFor="experience-order">Display Order</label>

                      <input
                        id="experience-order"
                        name="order"
                        type="number"
                        min="0"
                        value={form.order}
                        onChange={handleChange}
                        placeholder="0"
                      />
                    </div>

                    <div className="experience-field">
                      <label htmlFor="experience-certificate">
                        Certificate
                      </label>

                      <select
                        id="experience-certificate"
                        name="certificateId"
                        value={form.certificateId}
                        onChange={handleChange}
                      >
                        <option value="">No certificate linked</option>

                        {certificates.map((certificate) => (
                          <option key={certificate._id} value={certificate._id}>
                            {certificate.title || "Untitled Certificate"}
                            {certificate.issuer
                              ? ` — ${certificate.issuer}`
                              : ""}
                          </option>
                        ))}
                      </select>

                      <small>
                        Optional. Select an existing certificate from the
                        Certificates section.
                      </small>
                    </div>
                  </div>

                  <div className="experience-toggle-row">
                    <label className="toggle-control">
                      <input
                        type="checkbox"
                        name="current"
                        checked={form.current}
                        onChange={handleChange}
                      />

                      <span className="custom-checkbox">
                        {form.current ? "✓" : ""}
                      </span>

                      <span>
                        <strong>Currently working here</strong>
                        <small>
                          End date will be ignored while this is enabled.
                        </small>
                      </span>
                    </label>

                    <label className="toggle-control">
                      <input
                        type="checkbox"
                        name="visible"
                        checked={form.visible}
                        onChange={handleChange}
                      />

                      <span className="custom-checkbox">
                        {form.visible ? "✓" : ""}
                      </span>

                      <span>
                        <strong>Visible on portfolio</strong>
                        <small>Hide this experience without deleting it.</small>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-section-title">
                    <span>02</span>
                    Experience Details
                  </div>

                  <div className="experience-textarea-grid">
                    <div className="experience-field">
                      <label htmlFor="experience-description">
                        Description
                      </label>

                      <textarea
                        id="experience-description"
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Describe your responsibilities, contributions and achievements..."
                      />
                    </div>

                    <div className="experience-field">
                      <label htmlFor="experience-technologies">
                        Technologies / Skills
                      </label>

                      <textarea
                        id="experience-technologies"
                        name="technologies"
                        value={form.technologies}
                        onChange={handleChange}
                        rows={6}
                        placeholder="Python, Machine Learning, React, Node.js"
                      />

                      <small>Separate technologies with commas.</small>
                    </div>
                  </div>
                </div>

                <div className="experience-form-actions">
                  <button
                    type="button"
                    className="experience-secondary-btn"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="experience-primary-btn"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="button-spinner" />
                        Saving...
                      </>
                    ) : editingId ? (
                      <>
                        Update Experience
                        <span>→</span>
                      </>
                    ) : (
                      <>
                        Add Experience
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            <section className="experience-card existing-experience-card">
              <div className="experience-card-header">
                <div className="section-icon section-icon-blue">▣</div>

                <div>
                  <h2>Existing Experiences</h2>
                  <p>
                    {experiences.length} experience
                    {experiences.length !== 1 ? "s" : ""} in your portfolio.
                    Drag experiences to change their display order.
                  </p>
                </div>

                <div className="existing-experience-header-actions">
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

                  <div className="experience-count">{experiences.length}</div>
                </div>
              </div>

              {experiences.length === 0 ? (
                <div className="experience-empty-state">
                  <div>▣</div>
                  <h3>No experiences found</h3>
                  <p>Add your first experience using the form above.</p>
                </div>
              ) : (
                <div className="experience-table-wrapper">
                  <table className="experience-management-table">
                    <thead>
                      <tr>
                        <th>EXPERIENCE</th>
                        <th>TYPE</th>
                        <th>PERIOD</th>
                        <th>VISIBILITY</th>
                        <th>CERTIFICATE</th>
                        <th>ORDER</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {experiences.map((experience, index) => (
                        <tr
                          key={experience._id}
                          draggable
                          onDragStart={(event) =>
                            handleDragStart(event, experience._id)
                          }
                          onDragOver={handleDragOver}
                          onDrop={(event) => handleDrop(event, experience._id)}
                          onDragEnd={handleDragEnd}
                          className={
                            draggedExperienceId === experience._id
                              ? "experience-row-dragging"
                              : ""
                          }
                        >
                          <td>
                            <div className="experience-table-name">
                              <button
                                type="button"
                                className="experience-drag-handle"
                                draggable={false}
                                aria-label={`Drag ${
                                  experience.title || "experience"
                                } to change position`}
                                title="Drag to change position"
                              >
                                ⋮⋮
                              </button>

                              <div className="experience-table-icon">
                                {experience.current ? "●" : "◆"}
                              </div>

                              <div>
                                <strong>
                                  {experience.title || "Untitled Experience"}
                                </strong>

                                <span>
                                  {experience.company || "No organization"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="experience-type-pill">
                              {experience.type || "Experience"}
                            </span>
                          </td>

                          <td>
                            <div className="period-cell">
                              <strong>{experience.startDate || "—"}</strong>
                              <span>
                                {experience.current
                                  ? "Present"
                                  : experience.endDate || "—"}
                              </span>
                            </div>
                          </td>

                          <td>
                            {experience.visible !== false ? (
                              <span className="visibility-visible">
                                <span />
                                Visible
                              </span>
                            ) : (
                              <span className="visibility-hidden">
                                <span />
                                Hidden
                              </span>
                            )}
                          </td>

                          <td>
                            <span
                              className={
                                experience.certificateId
                                  ? "certificate-linked"
                                  : "certificate-none"
                              }
                              title={
                                experience.certificateId
                                  ? getCertificateTitle(
                                      typeof experience.certificateId ===
                                        "object"
                                        ? experience.certificateId._id
                                        : experience.certificateId,
                                    )
                                  : "No certificate linked"
                              }
                            >
                              {experience.certificateId
                                ? "✓ Linked"
                                : "Not Linked"}
                            </span>
                          </td>

                          <td>
                            <span className="order-number">{index + 1}</span>
                          </td>

                          <td>
                            <div className="experience-actions">
                              <button
                                type="button"
                                className="table-edit-btn"
                                onClick={() => handleEdit(experience)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="table-delete-btn"
                                onClick={() => handleDelete(experience._id)}
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

            <div className="experience-footer-note">
              <span>●</span>
              Changes are saved directly to your portfolio database.
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

const adminExperienceStyles = `
  .admin-experience-layout {
    min-height: 100vh;
    background:
      radial-gradient(
        circle at 85% 10%,
        rgba(45, 212, 191, 0.06),
        transparent 30%
      ),
      #0a0f14;
    color: #f1f5f9;
  }

  .admin-experience-main {
    min-height: 100vh;
    margin-left: 250px;
  }

  .admin-experience-container {
    width: min(1380px, calc(100% - 56px));
    margin: 0 auto;
    padding: 42px 0 70px;
  }

  .experience-page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 30px;
    margin-bottom: 30px;
  }

  .experience-breadcrumb {
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  .experience-breadcrumb span {
    color: #334155;
    margin: 0 8px;
  }

  .experience-page-header h1 {
    margin: 0;
    font-size: clamp(28px, 3vw, 40px);
    line-height: 1.1;
    font-weight: 750;
    letter-spacing: -0.035em;
    color: #f8fafc;
  }

  .experience-page-header p {
    margin: 11px 0 0;
    color: #8190a3;
    font-size: 14px;
  }

  .experience-dashboard-btn,
  .cancel-edit-btn,
  .experience-secondary-btn,
  .experience-primary-btn,
  .table-edit-btn,
  .table-delete-btn {
    font: inherit;
    cursor: pointer;
    border: 0;
  }

  .experience-dashboard-btn {
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

  .experience-dashboard-btn:hover {
    background: #17212d;
    border-color: #3b4b5d;
    transform: translateY(-1px);
  }

  .experience-alert {
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

  .experience-alert-error {
    border: 1px solid rgba(248, 113, 113, 0.2);
    background: rgba(127, 29, 29, 0.18);
    color: #fca5a5;
  }

  .experience-alert-success {
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

  .experience-card {
    background: rgba(14, 21, 29, 0.92);
    border: 1px solid #1e2a36;
    border-radius: 15px;
    box-shadow: 0 18px 50px rgba(0,0,0,0.16);
    overflow: hidden;
    margin-bottom: 24px;
  }

  .experience-card-header {
    min-height: 84px;
    padding: 22px 25px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid #1e2a36;
  }

  .experience-card-header h2 {
    margin: 0;
    color: #f8fafc;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .experience-card-header p {
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

  .experience-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 19px 22px;
  }

  .experience-field {
    min-width: 0;
  }

  .experience-field label {
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

  .experience-field input,
  .experience-field select,
  .experience-field textarea {
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

  .experience-field input,
  .experience-field select {
    height: 43px;
    padding: 0 13px;
  }

  .experience-field textarea {
    min-height: 120px;
    padding: 12px 13px;
    resize: vertical;
    line-height: 1.55;
  }

  .experience-field input::placeholder,
  .experience-field textarea::placeholder {
    color: #475569;
  }

  .experience-field input:hover,
  .experience-field select:hover,
  .experience-field textarea:hover {
    border-color: #3b4c5e;
  }

  .experience-field input:focus,
  .experience-field select:focus,
  .experience-field textarea:focus {
    border-color: #2dd4bf;
    background: #0d161f;
    box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.08);
  }

  .experience-field input:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }

  .experience-field select {
    cursor: pointer;
  }

  .experience-field small {
    display: block;
    margin-top: 6px;
    color: #59697a;
    font-size: 10px;
    line-height: 1.45;
  }

  .experience-toggle-row {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 22px;
  }

  .toggle-control {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 62px;
    padding: 12px 14px;
    border: 1px solid #253442;
    border-radius: 10px;
    background: rgba(45, 212, 191, 0.035);
    cursor: pointer;
  }

  .toggle-control input {
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

  .toggle-control input:checked + .custom-checkbox {
    border-color: #2dd4bf;
    background: #2dd4bf;
  }

  .toggle-control strong {
    display: block;
    color: #dbeafe;
    font-size: 13px;
    font-weight: 650;
  }

  .toggle-control small {
    display: block;
    margin-top: 3px;
    color: #64748b;
    font-size: 10px;
  }

  .experience-textarea-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 22px;
  }

  .experience-form-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: 22px 26px;
  }

  .experience-secondary-btn,
  .experience-primary-btn {
    min-height: 43px;
    padding: 0 17px;
    border-radius: 9px;
    font-size: 12px;
    font-weight: 700;
    transition: 0.2s ease;
  }

  .experience-secondary-btn {
    border: 1px solid #2b3948;
    background: transparent;
    color: #94a3b8;
  }

  .experience-secondary-btn:hover:not(:disabled) {
    border-color: #526273;
    color: #e2e8f0;
    background: #111923;
  }

  .experience-primary-btn {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    min-width: 155px;
    background: #2dd4bf;
    color: #06211e;
    box-shadow: 0 7px 22px rgba(45, 212, 191, 0.13);
  }

  .experience-primary-btn:hover:not(:disabled) {
    background: #5eead4;
    transform: translateY(-1px);
    box-shadow: 0 10px 28px rgba(45, 212, 191, 0.18);
  }

  .experience-primary-btn:disabled,
  .experience-secondary-btn:disabled {
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
    animation: adminExperienceSpin 0.7s linear infinite;
  }

  @keyframes adminExperienceSpin {
    to {
      transform: rotate(360deg);
    }
  }

  .experience-count {
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

  .existing-experience-header-actions {
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

  .experience-row-dragging {
    opacity: 0.48;
  }

  .experience-table-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  .experience-management-table {
    width: 100%;
    border-collapse: collapse;
    min-width: 1080px;
  }

  .experience-management-table th {
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

  .experience-management-table td {
    padding: 16px 20px;
    border-bottom: 1px solid #1b2732;
    color: #94a3b8;
    font-size: 12px;
    vertical-align: middle;
  }

  .experience-management-table tbody tr {
    transition: background 0.16s ease;
  }

  .experience-management-table tbody tr:hover {
    background: rgba(255,255,255,0.018);
  }

  .experience-management-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .experience-drag-handle {
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

  .experience-drag-handle:hover {
    border-color: #3b4c5e;
    color: #2dd4bf;
    background: #101923;
  }

  .experience-drag-handle:active {
    cursor: grabbing;
  }

  .experience-table-name {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 270px;
  }

  .experience-table-icon {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 auto;
    border: 1px solid #2a3947;
    border-radius: 8px;
    background: #0b1219;
    color: #2dd4bf;
    font-size: 11px;
  }

  .experience-table-name strong {
    display: block;
    max-width: 260px;
    overflow: hidden;
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .experience-table-name span {
    display: block;
    margin-top: 3px;
    color: #536275;
    font-size: 10px;
  }

  .experience-type-pill {
    display: inline-flex;
    max-width: 170px;
    overflow: hidden;
    padding: 5px 8px;
    border: 1px solid #263544;
    border-radius: 6px;
    background: #0b1219;
    color: #94a3b8;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .period-cell strong,
  .period-cell span {
    display: block;
  }

  .period-cell strong {
    color: #cbd5e1;
    font-size: 11px;
    font-weight: 650;
  }

  .period-cell span {
    margin-top: 3px;
    color: #64748b;
    font-size: 10px;
  }

  .visibility-visible,
  .visibility-hidden {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    font-size: 11px;
    font-weight: 650;
  }

  .visibility-visible {
    color: #5eead4;
  }

  .visibility-hidden {
    color: #64748b;
  }

  .visibility-visible > span,
  .visibility-hidden > span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .visibility-visible > span {
    background: #2dd4bf;
  }

  .visibility-hidden > span {
    background: #64748b;
  }

  .certificate-linked {
    color: #60a5fa;
    font-size: 11px;
    font-weight: 650;
    white-space: nowrap;
  }

  .certificate-none {
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

  .experience-actions {
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

  .experience-empty-state {
    padding: 65px 25px;
    text-align: center;
  }

  .experience-empty-state > div {
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

  .experience-empty-state h3 {
    margin: 0;
    color: #cbd5e1;
    font-size: 15px;
  }

  .experience-empty-state p {
    margin: 7px 0 0;
    color: #64748b;
    font-size: 12px;
  }

  .experience-footer-note {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 7px;
    color: #526174;
    font-size: 10px;
  }

  .experience-footer-note span {
    color: #2dd4bf;
    font-size: 8px;
  }

  .admin-experience-loading {
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

  .admin-experience-loading .admin-loading-spinner {
    width: 28px;
    height: 28px;
    color: #2dd4bf;
    border-width: 3px;
  }

  @media (max-width: 1100px) {
    .admin-experience-main {
      margin-left: 220px;
    }

    .admin-experience-container {
      width: min(100% - 36px, 1000px);
    }

    .experience-form-grid,
    .experience-textarea-grid,
    .experience-toggle-row {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 760px) {
    .admin-experience-main {
      margin-left: 0;
    }

    .admin-experience-container {
      width: calc(100% - 24px);
      padding: 22px 0 45px;
    }

    .experience-page-header {
      align-items: flex-start;
      flex-direction: column;
      gap: 18px;
      margin-bottom: 22px;
    }

    .experience-page-header h1 {
      font-size: 27px;
    }

    .experience-page-header p {
      max-width: 360px;
      line-height: 1.55;
    }

    .experience-dashboard-btn {
      width: 100%;
      justify-content: center;
    }

    .experience-card {
      border-radius: 12px;
      margin-bottom: 17px;
    }

    .experience-card-header {
      min-height: auto;
      padding: 18px;
      gap: 11px;
    }

    .section-icon {
      width: 34px;
      height: 34px;
    }

    .experience-card-header h2 {
      font-size: 16px;
    }

    .form-section {
      padding: 18px;
    }

    .experience-form-actions {
      padding: 18px;
      flex-direction: column-reverse;
    }

    .experience-primary-btn,
    .experience-secondary-btn {
      width: 100%;
    }

    .existing-experience-header-actions {
      margin-left: 0;
      width: 100%;
      flex-wrap: wrap;
    }

    .experience-card-header .existing-experience-header-actions {
      margin-top: 6px;
    }

    .experience-count {
      margin-left: auto;
    }

    .cancel-edit-btn {
      margin-left: auto;
      align-self: flex-start;
    }
  }

  @media (max-width: 520px) {
    .experience-card-header {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .cancel-edit-btn {
      width: 100%;
      margin-left: 0;
    }

    .experience-toggle-row {
      gap: 10px;
    }

    .toggle-control {
      align-items: flex-start;
    }
  }
`;

export default AdminExperiencePage;
