import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";

import {
  fetchEducations,
  createEducation,
  updateEducation,
  reorderEducations,
  deleteEducation,
} from "../api/api.js";

const emptyEducation = {
  years: "",
  title: "",
  place: "",
  location: "",
  detail: "",
  cgpa: "",
  percentage: "",
  icon: "🎓",
  order: 0,
  visible: true,
};

const textValue = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "";
};

const normalizeEducation = (education) => ({
  years: textValue(education?.years),
  title: textValue(education?.title),
  place: textValue(education?.place),
  location: textValue(education?.location),
  detail: textValue(education?.detail),
  cgpa: textValue(education?.cgpa),
  percentage: textValue(education?.percentage),
  icon: textValue(education?.icon) || "🎓",
  order: education?.order ?? 0,
  visible: education?.visible !== false,
});

function AdminEducationPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [educations, setEducations] = useState([]);
  const [form, setForm] = useState(emptyEducation);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orderSaving, setOrderSaving] = useState(false);

  const [draggedEducationId, setDraggedEducationId] = useState(null);
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

      const data = await fetchEducations(token);

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.educations)
          ? data.educations
          : [];

      setEducations(
        [...list].sort(
          (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
        ),
      );

      setOrderDirty(false);
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Could not load education data.",
      );
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
    setForm(emptyEducation);
    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleEdit = (education) => {
    setEditingId(education._id);
    setForm(normalizeEducation(education));
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

    if (!form.years.trim()) {
      setError("Education years are admin-edu-required.");
      return;
    }

    if (!form.title.trim()) {
      setError("Education title is admin-edu-required.");
      return;
    }

    if (!form.place.trim()) {
      setError("Institution name is admin-edu-required.");
      return;
    }

    const numericOrder = Number(form.order);

    if (!Number.isFinite(numericOrder) || numericOrder < 0) {
      setError("Order must be a number greater than or equal to 0.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        years: form.years.trim(),
        title: form.title.trim(),
        place: form.place.trim(),
        location: form.location.trim(),
        detail: form.detail.trim(),
        cgpa: form.cgpa.trim(),
        percentage: form.percentage.trim(),
        icon: form.icon.trim() || "🎓",
        order: numericOrder,
        visible: Boolean(form.visible),
      };

      let savedEducation;

      if (editingId) {
        savedEducation = await updateEducation(editingId, payload, token);
      } else {
        savedEducation = await createEducation(payload, token);
      }

      const wasEditing = Boolean(editingId);

      if (wasEditing) {
        setEducations((current) =>
          current.map((education) =>
            education._id === editingId ? savedEducation : education,
          ),
        );
      } else {
        setEducations((current) =>
          [...current, savedEducation].sort(
            (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
          ),
        );
      }

      resetForm();

      setSuccess(
        wasEditing
          ? "Education updated successfully."
          : "Education added successfully.",
      );
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save education record.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this education record?",
    );

    if (!confirmed) return;

    try {
      setError("");
      setSuccess("");

      await deleteEducation(id, token);

      setEducations((current) =>
        current.filter((education) => education._id !== id),
      );

      if (editingId === id) {
        resetForm();
      }

      setSuccess("Education record deleted successfully.");
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete education record.",
      );
    }
  };

  const handleDragStart = (event, educationId) => {
    setDraggedEducationId(educationId);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", educationId);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event, targetEducationId) => {
    event.preventDefault();

    const sourceEducationId =
      event.dataTransfer.getData("text/plain") || draggedEducationId;

    if (!sourceEducationId || sourceEducationId === targetEducationId) {
      setDraggedEducationId(null);
      return;
    }

    setEducations((current) => {
      const sourceIndex = current.findIndex(
        (education) => education._id === sourceEducationId,
      );

      const targetIndex = current.findIndex(
        (education) => education._id === targetEducationId,
      );

      if (sourceIndex === -1 || targetIndex === -1) {
        return current;
      }

      const reordered = [...current];
      const [movedEducation] = reordered.splice(sourceIndex, 1);

      reordered.splice(targetIndex, 0, movedEducation);

      setOrderDirty(true);
      setSuccess("");
      setError("");

      return reordered.map((education, index) => ({
        ...education,
        order: index + 1,
      }));
    });

    setDraggedEducationId(null);
  };

  const handleDragEnd = () => {
    setDraggedEducationId(null);
  };

  const handleSaveOrder = async () => {
    if (!orderDirty || educations.length === 0) return;

    try {
      setOrderSaving(true);
      setError("");
      setSuccess("");

      const saved = await reorderEducations(
        educations.map((education) => education._id),
        token,
      );

      const list = Array.isArray(saved)
        ? saved
        : Array.isArray(saved?.educations)
          ? saved.educations
          : educations;

      setEducations(
        [...list].sort(
          (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
        ),
      );

      setOrderDirty(false);
      setSuccess("Education order saved successfully.");
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to save education order.",
      );
    } finally {
      setOrderSaving(false);
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
        <style>{adminEducationStyles}</style>

        <div className="admin-layout admin-education-page">
          <AdminSidebar onLogout={handleLogout} />
          <main className="admin-main">
            <div className="admin-education-container">
              <div className="admin-education-loading">
                <div className="admin-edu-loading-spinner" />
                <p>Loading education...</p>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{adminEducationStyles}</style>

      <div className="admin-layout admin-education-page">
        <AdminSidebar onLogout={handleLogout} />

        <main className="admin-main">
          <div className="admin-education-container">
            <header className="admin-edu-page-header">
              <div>
                <div className="admin-edu-breadcrumb">
                  ADMIN PANEL <span>/</span> EDUCATION
                </div>

                <h1>Education Management</h1>

                <p>
                  Add, edit and manage the academic background displayed on your
                  portfolio.
                </p>
              </div>

              <button
                type="button"
                className="admin-edu-dashboard-btn"
                onClick={() => navigate("/admin")}
              >
                <span>←</span>
                Dashboard
              </button>
            </header>

            {error && (
              <div className="admin-edu-alert admin-edu-alert-error">
                <span className="admin-edu-alert-icon">!</span>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="admin-edu-alert admin-edu-alert-success">
                <span className="admin-edu-alert-icon">✓</span>
                <span>{success}</span>
              </div>
            )}

            <section className="admin-edu-card">
              <div className="admin-edu-card-header">
                <div className="admin-edu-section-icon">🎓</div>

                <div className="admin-edu-card-header-copy">
                  <h2>{editingId ? "Edit Education" : "Add New Education"}</h2>

                  <p>
                    {editingId
                      ? "Update the selected education information."
                      : "Create an academic education entry for your portfolio."}
                  </p>
                </div>

                {editingId && (
                  <button
                    type="button"
                    className="admin-edu-cancel-edit-btn"
                    onClick={resetForm}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="admin-edu-form-section">
                  <div className="admin-edu-form-section-title">
                    <span>01</span>
                    <div>
                      <strong>Academic Information</strong>
                      <small>Degree, institution and academic details</small>
                    </div>
                  </div>

                  <div className="admin-edu-form-grid">
                    <div className="admin-edu-field">
                      <label htmlFor="education-title">
                        Degree / Class{" "}
                        <span className="admin-edu-required">*</span>
                      </label>

                      <input
                        id="education-title"
                        name="title"
                        type="text"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="e.g. B.Tech (BEU)"
                        maxLength={200}
                        admin-edu-required
                      />
                    </div>

                    <div className="admin-edu-field">
                      <label htmlFor="education-place">
                        Institution{" "}
                        <span className="admin-edu-required">*</span>
                      </label>

                      <input
                        id="education-place"
                        name="place"
                        type="text"
                        value={form.place}
                        onChange={handleChange}
                        placeholder="e.g. Supaul College of Engineering"
                        maxLength={200}
                        admin-edu-required
                      />
                    </div>

                    <div className="admin-edu-field">
                      <label htmlFor="education-years">
                        Academic Period{" "}
                        <span className="admin-edu-required">*</span>
                      </label>

                      <input
                        id="education-years"
                        name="years"
                        type="text"
                        value={form.years}
                        onChange={handleChange}
                        placeholder="e.g. 2023 – 2027"
                        maxLength={50}
                        admin-edu-required
                      />
                    </div>

                    <div className="admin-edu-field">
                      <label htmlFor="education-location">Location</label>

                      <input
                        id="education-location"
                        name="location"
                        type="text"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="e.g. Supaul, Bihar"
                        maxLength={150}
                      />
                    </div>

                    <div className="admin-edu-field">
                      <label htmlFor="education-detail">
                        Course / Class Detail
                      </label>

                      <input
                        id="education-detail"
                        name="detail"
                        type="text"
                        value={form.detail}
                        onChange={handleChange}
                        placeholder="e.g. Computer Science (AI)"
                        maxLength={200}
                      />
                    </div>

                    <div className="admin-edu-field">
                      <label htmlFor="education-icon">Icon / Emoji</label>

                      <input
                        id="education-icon"
                        name="icon"
                        type="text"
                        value={form.icon}
                        onChange={handleChange}
                        placeholder="🎓"
                        maxLength={20}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-edu-form-section">
                  <div className="admin-edu-form-section-title">
                    <span>02</span>
                    <div>
                      <strong>Academic Score</strong>
                      <small>Optional performance information</small>
                    </div>
                  </div>

                  <div className="admin-edu-form-grid">
                    <div className="admin-edu-field">
                      <label htmlFor="education-cgpa">CGPA</label>

                      <input
                        id="education-cgpa"
                        name="cgpa"
                        type="text"
                        value={form.cgpa}
                        onChange={handleChange}
                        placeholder="e.g. 7.7 / 10"
                        maxLength={30}
                      />

                      <small>
                        Optional. Use this for CGPA-based academic records.
                      </small>
                    </div>

                    <div className="admin-edu-field">
                      <label htmlFor="education-percentage">Percentage</label>

                      <input
                        id="education-percentage"
                        name="percentage"
                        type="text"
                        value={form.percentage}
                        onChange={handleChange}
                        placeholder="e.g. 85%"
                        maxLength={30}
                      />

                      <small>
                        Optional. Use this for percentage-based academic
                        records.
                      </small>
                    </div>

                    <div className="admin-edu-field">
                      <label htmlFor="education-order">Display Order</label>

                      <input
                        id="education-order"
                        name="order"
                        type="number"
                        min="0"
                        value={form.order}
                        onChange={handleChange}
                        placeholder="0"
                      />

                      <small>Lower order numbers appear first.</small>
                    </div>
                  </div>

                  <div className="admin-edu-toggle-row">
                    <label className="admin-edu-toggle-control">
                      <input
                        type="checkbox"
                        name="visible"
                        checked={form.visible}
                        onChange={handleChange}
                      />

                      <span className="admin-edu-checkbox">
                        {form.visible ? "✓" : ""}
                      </span>

                      <span>
                        <strong>Visible on portfolio</strong>
                        <small>
                          Hide this education record without deleting it.
                        </small>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="admin-edu-form-actions">
                  <button
                    type="button"
                    className="admin-edu-secondary-btn"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Reset
                  </button>

                  <button
                    type="submit"
                    className="admin-edu-primary-btn"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="admin-edu-button-spinner" />
                        Saving...
                      </>
                    ) : editingId ? (
                      <>
                        Update Education
                        <span>→</span>
                      </>
                    ) : (
                      <>
                        Add Education
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </section>

            <section className="admin-edu-card admin-edu-existing-card">
              <div className="admin-edu-card-header">
                <div className="admin-edu-section-icon admin-edu-section-icon-blue">
                  ▣
                </div>

                <div className="admin-edu-card-header-copy">
                  <h2>Existing Education</h2>

                  <p>
                    {educations.length} education
                    {educations.length !== 1 ? " records" : " record"} in your
                    portfolio. Drag records to change their display order.
                  </p>
                </div>

                <div className="admin-edu-existing-header-actions">
                  {orderDirty && (
                    <span className="admin-edu-order-unsaved">
                      Order changed
                    </span>
                  )}

                  <button
                    type="button"
                    className="admin-edu-save-order"
                    onClick={handleSaveOrder}
                    disabled={!orderDirty || orderSaving}
                  >
                    {orderSaving ? (
                      <>
                        <span className="admin-edu-button-spinner" />
                        Saving Order...
                      </>
                    ) : (
                      <>
                        Save Order
                        <span>✓</span>
                      </>
                    )}
                  </button>

                  <div className="admin-edu-count">{educations.length}</div>
                </div>
              </div>

              {educations.length === 0 ? (
                <div className="admin-edu-empty-state">
                  <div>🎓</div>
                  <h3>No education records found</h3>
                  <p>Add your first education record using the form above.</p>
                </div>
              ) : (
                <div className="admin-edu-table-wrapper">
                  <table className="admin-edu-table">
                    <thead>
                      <tr>
                        <th>EDUCATION</th>
                        <th>PERIOD</th>
                        <th>LOCATION</th>
                        <th>SCORE</th>
                        <th>VISIBILITY</th>
                        <th>ORDER</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {educations.map((education, index) => (
                        <tr
                          key={education._id}
                          draggable
                          onDragStart={(event) =>
                            handleDragStart(event, education._id)
                          }
                          onDragOver={handleDragOver}
                          onDrop={(event) => handleDrop(event, education._id)}
                          onDragEnd={handleDragEnd}
                          className={
                            draggedEducationId === education._id
                              ? "admin-edu-row-dragging"
                              : ""
                          }
                        >
                          <td>
                            <div className="admin-edu-table-name">
                              <button
                                type="button"
                                className="admin-edu-drag-handle"
                                draggable={false}
                                aria-label={`Drag ${
                                  education.title || "education"
                                } to change position`}
                                title="Drag to change position"
                              >
                                ⋮⋮
                              </button>

                              <div className="admin-edu-table-icon">
                                {education.icon || "🎓"}
                              </div>

                              <div>
                                <strong>
                                  {education.title || "Untitled Education"}
                                </strong>

                                <span>
                                  {education.place || "No institution"}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="admin-edu-period-cell">
                              <strong>{education.years || "—"}</strong>

                              <span>{education.detail || "—"}</span>
                            </div>
                          </td>

                          <td>
                            <span className="admin-edu-location-cell">
                              {education.location || "—"}
                            </span>
                          </td>

                          <td>
                            <div className="admin-edu-score-cell">
                              {education.cgpa && (
                                <span>
                                  <strong>CGPA</strong> {education.cgpa}
                                </span>
                              )}

                              {education.percentage && (
                                <span>
                                  <strong>%</strong> {education.percentage}
                                </span>
                              )}

                              {!education.cgpa && !education.percentage && (
                                <span className="admin-edu-score-none">
                                  Not specified
                                </span>
                              )}
                            </div>
                          </td>

                          <td>
                            {education.visible !== false ? (
                              <span className="admin-edu-visibility-visible">
                                <span />
                                Visible
                              </span>
                            ) : (
                              <span className="admin-edu-visibility-hidden">
                                <span />
                                Hidden
                              </span>
                            )}
                          </td>

                          <td>
                            <span className="admin-edu-order-number">
                              {index + 1}
                            </span>
                          </td>

                          <td>
                            <div className="admin-edu-actions">
                              <button
                                type="button"
                                className="admin-edu-edit-btn"
                                onClick={() => handleEdit(education)}
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="admin-edu-delete-btn"
                                onClick={() => handleDelete(education._id)}
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

            <div className="admin-edu-footer-note">
              <span>●</span>
              Changes are saved directly to your portfolio database.
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

const adminEducationStyles = `
  /* =========================================================
     ADMIN EDUCATION — PORTFOLIO DESIGN SYSTEM
     Namespaced to avoid collisions with public Education styles.
     ========================================================= */
  .admin-education-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at 86% 0%, rgba(79, 216, 196, 0.055), transparent 30%),
      radial-gradient(circle at 8% 72%, rgba(255, 180, 84, 0.035), transparent 28%),
      var(--bg);
    color: var(--text);
  }

  .admin-education-container {
    width: min(1240px, 100%);
    margin: 0 auto;
  }

  /* ---------- PAGE HEADER ---------- */
  .admin-edu-page-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 32px;
    margin-bottom: 28px;
  }

  .admin-edu-page-header > div:first-child {
    min-width: 0;
    flex: 1 1 auto;
  }

  .admin-edu-breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 10px;
    color: var(--text-3);
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    line-height: 1.4;
  }

  .admin-edu-breadcrumb span { color: var(--text-3); }

  .admin-edu-page-header h1 {
    margin: 0;
    color: var(--text);
    font-family: var(--font-display);
    font-size: clamp(30px, 3.1vw, 44px);
    line-height: 1.08;
    font-weight: 700;
    letter-spacing: -0.04em;
    overflow-wrap: anywhere;
  }

  .admin-edu-page-header p {
    max-width: 700px;
    margin: 10px 0 0;
    color: var(--text-2);
    font-size: 14px;
    line-height: 1.65;
  }

  .admin-edu-dashboard-btn,
  .admin-edu-cancel-edit-btn,
  .admin-edu-secondary-btn,
  .admin-edu-primary-btn,
  .admin-edu-edit-btn,
  .admin-edu-delete-btn {
    font: inherit;
    cursor: pointer;
  }

  .admin-edu-dashboard-btn {
    flex: 0 0 auto;
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 15px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    background: var(--surface);
    color: var(--text-2);
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    transition: all var(--t-fast);
  }

  .admin-edu-dashboard-btn:hover {
    border-color: var(--accent-border);
    background: var(--surface-2);
    color: var(--text);
    transform: translateY(-1px);
  }

  /* ---------- ALERTS ---------- */
  .admin-edu-alert {
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 48px;
    box-sizing: border-box;
    margin-bottom: 18px;
    padding: 10px 14px;
    border: 1px solid;
    border-radius: 11px;
    font-size: 12px;
    font-weight: 650;
  }

  .admin-edu-alert-error {
    border-color: rgba(248, 113, 113, 0.22);
    background: rgba(127, 29, 29, 0.16);
    color: #fca5a5;
  }

  .admin-edu-alert-success {
    border-color: rgba(45, 212, 191, 0.22);
    background: rgba(13, 148, 136, 0.10);
    color: #5eead4;
  }

  .admin-edu-alert-icon {
    width: 23px;
    height: 23px;
    display: grid;
    place-items: center;
    flex: 0 0 23px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.06);
    font-weight: 900;
  }

  /* ---------- CARD SYSTEM ---------- */
  .admin-edu-card {
    width: 100%;
    box-sizing: border-box;
    margin-bottom: 24px;
    overflow: hidden;
    border: 1px solid #1d2a35;
    border-radius: 17px;
    background: linear-gradient(145deg, rgba(15, 23, 32, 0.98), rgba(8, 13, 18, 0.99));
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.015);
  }

  .admin-edu-card-header {
    min-height: 82px;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 13px;
    padding: 18px 24px;
    border-bottom: 1px solid #1e2a36;
    background: rgba(255, 255, 255, 0.008);
  }

  .admin-edu-card-header .admin-edu-section-icon {
    width: 40px;
    min-width: 40px;
  }

  .admin-edu-card-header-copy {
    min-width: 0;
    flex: 1 1 auto;
  }

  .admin-edu-card-header-copy h2 {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    color: #f5f8fa;
    font-size: 18px;
    font-weight: 780;
    line-height: 1.25;
    letter-spacing: -0.025em;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-edu-card-header-copy p {
    max-width: 720px;
    margin: 5px 0 0;
    overflow: hidden;
    color: #6f8090;
    font-size: 11px;
    line-height: 1.45;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-edu-section-icon {
    width: 40px;
    height: 40px;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    border: 1px solid rgba(45, 212, 191, 0.18);
    border-radius: 10px;
    background: rgba(45, 212, 191, 0.07);
    color: #5eead4;
    font-size: 16px;
  }

  .admin-edu-section-icon-blue {
    border-color: rgba(96, 165, 250, 0.18);
    background: rgba(96, 165, 250, 0.07);
    color: #60a5fa;
  }

  .admin-edu-cancel-edit-btn {
    flex: 0 0 auto;
    min-height: 36px;
    margin-left: auto;
    padding: 0 12px;
    border: 1px solid #344354;
    border-radius: 8px;
    background: transparent;
    color: #9aa8b6;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
  }

  .admin-edu-cancel-edit-btn:hover {
    border-color: #526273;
    color: #f8fafc;
    background: rgba(255, 255, 255, 0.025);
  }

  /* ---------- FORM ---------- */
  .admin-edu-form-section {
    padding: 27px 26px;
    border-bottom: 1px solid #1d2934;
  }

  .admin-edu-form-section:last-of-type {
    border-bottom: 0;
  }

  .admin-edu-form-section-title {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 21px;
  }

  .admin-edu-form-section-title > span {
    width: 31px;
    height: 31px;
    display: grid;
    place-items: center;
    flex: 0 0 31px;
    box-sizing: border-box;
    border: 1px solid rgba(45, 212, 191, 0.18);
    border-radius: 8px;
    background: rgba(45, 212, 191, 0.055);
    color: #2dd4bf;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }

  .admin-edu-form-section-title > div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .admin-edu-form-section-title strong {
    overflow: hidden;
    color: #dbe4ec;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    line-height: 1.2;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;
  }

  .admin-edu-form-section-title small {
    overflow: hidden;
    color: #58697a;
    font-size: 10px;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-edu-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 19px 24px;
  }

  .admin-edu-field {
    min-width: 0;
  }

  .admin-edu-field label {
    display: block;
    margin-bottom: 7px;
    color: #b9c6d1;
    font-size: 11px;
    font-weight: 720;
    line-height: 1.3;
  }

  .admin-edu-required {
    margin-left: 3px;
    color: #f87171;
  }

  .admin-edu-field input {
    width: 100%;
    height: 44px;
    box-sizing: border-box;
    padding: 0 13px;
    border: 1px solid #293746;
    border-radius: 9px;
    outline: none;
    background: #0a1118;
    color: #e2e8f0;
    font-family: inherit;
    font-size: 12px;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  .admin-edu-field input::placeholder {
    color: #465568;
  }

  .admin-edu-field input:hover {
    border-color: #3a4b5d;
  }

  .admin-edu-field input:focus {
    border-color: rgba(45, 212, 191, 0.75);
    background: #0d161f;
    box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.07);
  }

  .admin-edu-field small {
    display: block;
    margin-top: 5px;
    color: #58697a;
    font-size: 9px;
    line-height: 1.45;
  }

  .admin-edu-toggle-row {
    margin-top: 22px;
  }

  .admin-edu-toggle-control {
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 58px;
    box-sizing: border-box;
    padding: 11px 13px;
    border: 1px solid #253442;
    border-radius: 10px;
    background: rgba(45, 212, 191, 0.025);
    cursor: pointer;
  }

  .admin-edu-toggle-control input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .admin-edu-checkbox {
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    flex: 0 0 20px;
    box-sizing: border-box;
    border: 1px solid #405263;
    border-radius: 5px;
    background: #0b1219;
    color: #06211e;
    font-size: 12px;
    font-weight: 900;
  }

  .admin-edu-toggle-control input:checked + .admin-edu-checkbox {
    border-color: #2dd4bf;
    background: #2dd4bf;
  }

  .admin-edu-toggle-control strong,
  .admin-edu-toggle-control small {
    display: block;
  }

  .admin-edu-toggle-control strong {
    color: #dbeafe;
    font-size: 12px;
    font-weight: 700;
  }

  .admin-edu-toggle-control small {
    margin-top: 3px;
    color: #64748b;
    font-size: 9px;
  }

  .admin-edu-form-actions {
    min-height: 76px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
    box-sizing: border-box;
    padding: 18px 26px;
    border-top: 1px solid #1d2934;
    background: rgba(7, 12, 17, 0.35);
  }

  .admin-edu-secondary-btn,
  .admin-edu-primary-btn {
    height: 40px;
    min-height: 40px;
    box-sizing: border-box;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 800;
    transition: 0.2s ease;
  }

  .admin-edu-secondary-btn {
    border: 1px solid #2b3948;
    background: #101820;
    color: #9aa8b6;
  }

  .admin-edu-secondary-btn:hover:not(:disabled) {
    border-color: #526273;
    color: #e2e8f0;
    background: #151f28;
  }

  .admin-edu-primary-btn {
    min-width: 158px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    border: 1px solid rgba(45, 212, 191, 0.25);
    background: #2dd4bf;
    color: #06211e;
    box-shadow: 0 8px 25px rgba(45, 212, 191, 0.12);
  }

  .admin-edu-primary-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    background: #5eead4;
    box-shadow: 0 11px 30px rgba(45, 212, 191, 0.17);
  }

  .admin-edu-primary-btn:disabled,
  .admin-edu-secondary-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .admin-edu-button-spinner,
  .admin-edu-loading-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 50%;
    animation: adminEducationSpin 0.7s linear infinite;
  }

  @keyframes adminEducationSpin {
    to { transform: rotate(360deg); }
  }

  /* ---------- EXISTING EDUCATION / TABLE ---------- */
  .admin-edu-existing-card .admin-edu-card-header {
    min-height: 82px;
  }

  .admin-edu-existing-header-actions {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
  }

  .admin-edu-order-unsaved {
    color: #fbbf24;
    font-size: 9px;
    font-weight: 800;
    white-space: nowrap;
  }

  .admin-edu-save-order {
    height: 36px;
    min-height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    box-sizing: border-box;
    padding: 0 13px;
    border: 1px solid rgba(45, 212, 191, 0.28);
    border-radius: 8px;
    background: rgba(45, 212, 191, 0.075);
    color: #5eead4;
    font: inherit;
    font-size: 10px;
    font-weight: 800;
    cursor: pointer;
    white-space: nowrap;
    transition: 0.18s ease;
  }

  .admin-edu-save-order:hover:not(:disabled) {
    transform: translateY(-1px);
    border-color: rgba(45, 212, 191, 0.5);
    background: rgba(45, 212, 191, 0.14);
  }

  .admin-edu-save-order:disabled {
    opacity: 0.38;
    cursor: not-allowed;
  }

  .admin-edu-count {
    width: 34px;
    min-width: 34px;
    height: 34px;
    display: grid;
    place-items: center;
    box-sizing: border-box;
    border: 1px solid #293746;
    border-radius: 8px;
    background: #0b1219;
    color: #94a3b8;
    font-size: 11px;
    font-weight: 800;
  }

  .admin-edu-row-dragging {
    opacity: 0.42;
  }

  .admin-edu-table-wrapper {
    width: 100%;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: #263544 transparent;
  }

  .admin-edu-table {
    width: 100%;
    min-width: 1080px;
    table-layout: fixed;
    border-collapse: collapse;
  }

  .admin-edu-table th,
  .admin-edu-table td {
    box-sizing: border-box;
  }

  .admin-edu-table th:nth-child(1),
  .admin-edu-table td:nth-child(1) { width: 31%; }
  .admin-edu-table th:nth-child(2),
  .admin-edu-table td:nth-child(2) { width: 17%; }
  .admin-edu-table th:nth-child(3),
  .admin-edu-table td:nth-child(3) { width: 16%; }
  .admin-edu-table th:nth-child(4),
  .admin-edu-table td:nth-child(4) { width: 12%; }
  .admin-edu-table th:nth-child(5),
  .admin-edu-table td:nth-child(5) { width: 10%; }
  .admin-edu-table th:nth-child(6),
  .admin-edu-table td:nth-child(6) { width: 6%; }
  .admin-edu-table th:nth-child(7),
  .admin-edu-table td:nth-child(7) { width: 16%; }

  .admin-edu-table th {
    height: 42px;
    padding: 0 15px;
    border-bottom: 1px solid #202c38;
    background: #091018;
    color: #607084;
    text-align: left;
    vertical-align: middle;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.11em;
    white-space: nowrap;
  }

  .admin-edu-table td {
    height: 72px;
    padding: 11px 15px;
    border-bottom: 1px solid #1b2732;
    color: #94a3b8;
    font-size: 11px;
    vertical-align: middle;
  }

  .admin-edu-table tbody tr {
    transition: background 0.16s ease;
  }

  .admin-edu-table tbody tr:hover {
    background: rgba(255, 255, 255, 0.018);
  }

  .admin-edu-table tbody tr:last-child td {
    border-bottom: 0;
  }

  .admin-edu-drag-handle {
    width: 27px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 27px;
    padding: 0;
    border: 1px solid #263544;
    border-radius: 7px;
    background: #0b1219;
    color: #64748b;
    font-size: 13px;
    line-height: 1;
    cursor: grab;
    touch-action: none;
  }

  .admin-edu-drag-handle:hover {
    border-color: #3b4c5e;
    background: #101923;
    color: #2dd4bf;
  }

  .admin-edu-drag-handle:active {
    cursor: grabbing;
  }

  .admin-edu-table-name {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .admin-edu-table-name > div:last-child {
    min-width: 0;
  }

  .admin-edu-table-icon {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 36px;
    box-sizing: border-box;
    border: 1px solid #2a3947;
    border-radius: 8px;
    background: #0b1219;
    font-size: 15px;
  }

  .admin-edu-table-name strong {
    display: block;
    max-width: 100%;
    overflow: hidden;
    color: #e2e8f0;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-edu-table-name span,
  .admin-edu-period-cell strong,
  .admin-edu-period-cell span {
    display: block;
  }

  .admin-edu-table-name span {
    margin-top: 3px;
    overflow: hidden;
    color: #536275;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-edu-period-cell strong {
    overflow: hidden;
    color: #cbd5e1;
    font-size: 10px;
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-edu-period-cell span {
    margin-top: 3px;
    overflow: hidden;
    color: #64748b;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-edu-location-cell {
    display: block;
    max-width: 100%;
    overflow: hidden;
    color: #94a3b8;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-edu-score-cell span {
    display: block;
    overflow: hidden;
    color: #94a3b8;
    font-size: 9px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .admin-edu-score-cell span + span {
    margin-top: 4px;
  }

  .admin-edu-score-cell strong {
    margin-right: 3px;
    color: #64748b;
    font-size: 8px;
  }

  .admin-edu-score-none {
    color: #59697a !important;
  }

  .admin-edu-visibility-visible,
  .admin-edu-visibility-hidden {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 9px;
    font-weight: 750;
    white-space: nowrap;
  }

  .admin-edu-visibility-visible { color: #5eead4; }
  .admin-edu-visibility-hidden { color: #64748b; }

  .admin-edu-visibility-visible > span,
  .admin-edu-visibility-hidden > span {
    width: 6px;
    height: 6px;
    flex: 0 0 6px;
    border-radius: 50%;
  }

  .admin-edu-visibility-visible > span { background: #2dd4bf; }
  .admin-edu-visibility-hidden > span { background: #64748b; }

  .admin-edu-order-number {
    min-width: 27px;
    height: 27px;
    display: inline-grid;
    place-items: center;
    box-sizing: border-box;
    border-radius: 6px;
    background: #101923;
    color: #94a3b8;
    font-size: 10px;
    font-weight: 700;
  }

  .admin-edu-actions {
    width: 100%;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    flex-wrap: nowrap;
  }

  .admin-edu-edit-btn,
  .admin-edu-delete-btn {
    width: 65px;
    height: 32px;
    min-height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 65px;
    box-sizing: border-box;
    padding: 0;
    border-radius: 7px;
    font-size: 9px;
    font-weight: 800;
    transition: 0.18s ease;
  }

  .admin-edu-edit-btn {
    border: 1px solid #2b4650;
    background: rgba(45, 212, 191, 0.055);
    color: #5eead4;
  }

  .admin-edu-edit-btn:hover {
    border-color: #39727a;
    background: rgba(45, 212, 191, 0.13);
  }

  .admin-edu-delete-btn {
    border: 1px solid rgba(248, 113, 113, 0.18);
    background: rgba(248, 113, 113, 0.045);
    color: #f87171;
  }

  .admin-edu-delete-btn:hover {
    border-color: rgba(248, 113, 113, 0.32);
    background: rgba(248, 113, 113, 0.11);
  }

  .admin-edu-empty-state {
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    padding: 50px 25px;
    text-align: center;
  }

  .admin-edu-empty-state > div {
    width: 48px;
    height: 48px;
    display: grid;
    place-items: center;
    margin-bottom: 14px;
    border: 1px solid #263544;
    border-radius: 12px;
    background: #0b1219;
    color: #64748b;
  }

  .admin-edu-empty-state h3 {
    margin: 0;
    color: #cbd5e1;
    font-size: 15px;
  }

  .admin-edu-empty-state p {
    max-width: 460px;
    margin: 7px 0 0;
    color: #64748b;
    font-size: 11px;
    line-height: 1.6;
  }

  .admin-edu-footer-note {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding-top: 1px;
    color: #526174;
    font-size: 9px;
  }

  .admin-edu-footer-note span {
    color: #2dd4bf;
    font-size: 7px;
  }

  /* ---------- LOADING ---------- */
  .admin-education-loading {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 13px;
    background: #080d12;
    color: #64748b;
    font-size: 12px;
  }

  .admin-education-loading .admin-edu-loading-spinner {
    width: 28px;
    height: 28px;
    color: #2dd4bf;
    border-width: 3px;
  }

  /* ---------- RESPONSIVE ---------- */
  @media (max-width: 1280px) {
    .admin-edu-form-grid { gap: 18px; }
    .admin-edu-table { min-width: 1060px; }
  }

  @media (max-width: 980px) {
    .admin-edu-form-grid { grid-template-columns: 1fr; }
    .admin-edu-page-header { align-items: flex-start; }
    .admin-edu-page-header p { max-width: 620px; }
  }


  @media (max-width: 900px) {
    .admin-edu-page-header {
      align-items: flex-start;
      gap: 20px;
    }

    .admin-edu-dashboard-btn {
      flex: 0 0 auto;
    }

    .admin-edu-page-header p { max-width: 620px; }
  }
  @media (max-width: 700px) {
    .admin-education-container {
      width: 100%;
    }

    .admin-edu-page-header {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;
      margin-bottom: 20px;
    }

    .admin-edu-page-header h1 { font-size: 28px; }
    .admin-edu-page-header p { font-size: 12px; line-height: 1.55; }
    .admin-edu-dashboard-btn { width: 100%; }

    .admin-edu-card { border-radius: 13px; margin-bottom: 17px; }

    .admin-edu-card-header,
    .admin-edu-existing-card .admin-edu-card-header {
      min-height: auto;
      grid-template-columns: 40px minmax(0, 1fr);
      align-items: start;
      column-gap: 10px;
      row-gap: 14px;
      padding: 17px;
    }

    .admin-edu-card-header-copy {
      min-width: 0;
    }

    .admin-edu-card-header-copy h2,
    .admin-edu-card-header-copy p {
      white-space: normal;
    }

    .admin-edu-card-header-copy h2 {
      font-size: 16px;
    }

    .admin-edu-card-header-copy p {
      line-height: 1.45;
    }

    .admin-edu-cancel-edit-btn {
      grid-column: 1 / -1;
      width: 100%;
      margin-left: 0;
    }

    .admin-edu-form-section { padding: 21px 17px; }
    .admin-edu-form-actions {
      flex-direction: column-reverse;
      padding: 17px;
    }

    .admin-edu-primary-btn,
    .admin-edu-secondary-btn {
      width: 100%;
    }

    .admin-edu-existing-header-actions {
      grid-column: 1 / -1;
      width: 100%;
      min-width: 0;
      flex-wrap: wrap;
      justify-content: stretch;
    }

    .admin-edu-order-unsaved { order: 3; width: 100%; }
    .admin-edu-save-order { flex: 1 1 auto; }
    .admin-edu-count { margin-left: auto; }
  }

  @media (max-width: 480px) {
    .admin-education-container { width: 100%; }
    .admin-edu-breadcrumb { font-size: 9px; }
    .admin-edu-page-header h1 { font-size: 25px; }
    .admin-edu-form-section-title strong { font-size: 11px; }
    .admin-edu-form-section-title small { white-space: normal; }
    .admin-edu-field input { height: 43px; }
    .admin-edu-toggle-control { align-items: flex-start; }

    .admin-edu-existing-header-actions {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
    }

    .admin-edu-save-order { width: 100%; }
    .admin-edu-order-unsaved { grid-column: 1 / -1; }
  }
`;

export default AdminEducationPage;
