import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import {
  fetchCertificates,
  uploadCertificate,
  deleteCertificate,
  updateCertificate,
  reorderCertificates,
} from "../api/api.js";

const INITIAL_FORM = {
  title: "",
  issuer: "",
  certificateId: "",
  category: "Certification",
  completionDate: "",
  description: "",
  file: null,
};

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function AdminCertificatesPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("adminToken");

  const [certificates, setCertificates] = useState([]);
  const [certificateForm, setCertificateForm] = useState(INITIAL_FORM);
  const [editingCertificateId, setEditingCertificateId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [certificateLoading, setCertificateLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [dragActive, setDragActive] = useState(false);

  // Certificate card drag-and-drop ordering
  const [draggedCertificateId, setDraggedCertificateId] = useState(null);
  const [dragOverCertificateId, setDragOverCertificateId] = useState(null);
  const [orderSaving, setOrderSaving] = useState(false);
  const [orderDirty, setOrderDirty] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const loadCertificates = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchCertificates();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.certificates)
            ? data.certificates
            : [];

        setCertificates(list);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");
          navigate("/admin/login");
          return;
        }

        setError(
          err.response?.data?.message ||
            err.message ||
            "Could not load certificates.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCertificates();
  }, [token, navigate]);

  const categories = useMemo(() => {
    const values = certificates
      .map((certificate) => certificate.category?.trim())
      .filter(Boolean);

    return ["All", ...new Set(values)];
  }, [certificates]);

  const filteredCertificates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return certificates.filter((certificate) => {
      const matchesSearch =
        !query ||
        [
          certificate.title,
          certificate.issuer,
          certificate.certificateId,
          certificate.category,
          certificate.completionDate,
          certificate.description,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesCategory =
        categoryFilter === "All" ||
        (certificate.category || "").toLowerCase() ===
          categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [certificates, search, categoryFilter]);

  const canReorder = !search.trim() && categoryFilter === "All";

  const latestCertificate = useMemo(() => {
    if (!certificates.length) {
      return null;
    }

    return [...certificates].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      return dateB - dateA;
    })[0];
  }, [certificates]);

  const handleCertificateChange = (event) => {
    const { name, value, files } = event.target;

    if (name === "file") {
      const file = files?.[0] || null;

      setCertificateForm((current) => ({
        ...current,
        file,
      }));

      setError("");
      setSuccess("");

      return;
    }

    setCertificateForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const validateFile = (file) => {
    if (!file) {
      return "Please select a certificate file.";
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only PDF, JPG, JPEG, PNG and WEBP files are allowed.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Certificate file must be 10 MB or smaller.";
    }

    return "";
  };

  const handleSelectedFile = (file) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setCertificateForm((current) => ({
        ...current,
        file: null,
      }));

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    setError("");
    setSuccess("");

    setCertificateForm((current) => ({
      ...current,
      file,
    }));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const resetForm = () => {
    setCertificateForm(INITIAL_FORM);
    setEditingCertificateId(null);
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEditCertificate = (certificate) => {
    setEditingCertificateId(certificate._id);
    setCertificateForm({
      title: certificate.title || "",
      issuer: certificate.issuer || "",
      certificateId: certificate.certificateId || "",
      category: certificate.category || "Certification",
      completionDate: certificate.completionDate || "",
      description: certificate.description || "",
      file: null,
    });
    setError("");
    setSuccess("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleCertificateUpload = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!certificateForm.title.trim()) {
      setError("Certificate title is required.");
      return;
    }

    if (!certificateForm.issuer.trim()) {
      setError("Issuer is required.");
      return;
    }

    if (!editingCertificateId) {
      const fileError = validateFile(certificateForm.file);

      if (fileError) {
        setError(fileError);
        return;
      }
    } else if (certificateForm.file) {
      const fileError = validateFile(certificateForm.file);

      if (fileError) {
        setError(fileError);
        return;
      }
    }

    try {
      setCertificateLoading(true);

      if (editingCertificateId) {
        const formData = new FormData();

        formData.append("title", certificateForm.title.trim());
        formData.append("issuer", certificateForm.issuer.trim());
        formData.append("certificateId", certificateForm.certificateId.trim());
        formData.append("category", certificateForm.category.trim());
        formData.append(
          "completionDate",
          certificateForm.completionDate.trim(),
        );
        formData.append("description", certificateForm.description.trim());

        if (certificateForm.file) {
          formData.append("certificate", certificateForm.file);
        }

        const response = await updateCertificate(
          editingCertificateId,
          formData,
          token,
        );

        if (response?.certificate) {
          setCertificates((current) =>
            current.map((certificate) =>
              certificate._id === editingCertificateId
                ? response.certificate
                : certificate,
            ),
          );
        }

        resetForm();
        setSuccess("Certificate updated successfully.");
      } else {
        const formData = new FormData();

        formData.append("title", certificateForm.title.trim());
        formData.append("issuer", certificateForm.issuer.trim());
        formData.append("certificateId", certificateForm.certificateId.trim());
        formData.append("category", certificateForm.category.trim());
        formData.append(
          "completionDate",
          certificateForm.completionDate.trim(),
        );
        formData.append("description", certificateForm.description.trim());
        formData.append("certificate", certificateForm.file);

        const response = await uploadCertificate(formData, token);

        if (response?.certificate) {
          setCertificates((current) => [response.certificate, ...current]);
        }

        resetForm();
        setSuccess("Certificate uploaded successfully.");
      }
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          (editingCertificateId
            ? "Failed to update certificate."
            : "Failed to upload certificate."),
      );
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleCertificateCardDragStart = (event, id) => {
    if (orderSaving) {
      event.preventDefault();
      return;
    }

    setDraggedCertificateId(id);
    setDragOverCertificateId(null);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(id));
  };

  const handleCertificateCardDragOver = (event, id) => {
    event.preventDefault();

    if (!draggedCertificateId || draggedCertificateId === id || orderSaving) {
      return;
    }

    event.dataTransfer.dropEffect = "move";
    setDragOverCertificateId(id);
  };

  const handleCertificateCardDragLeave = (event, id) => {
    if (dragOverCertificateId !== id) {
      return;
    }

    const currentTarget = event.currentTarget;
    const relatedTarget = event.relatedTarget;

    if (relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }

    setDragOverCertificateId(null);
  };

  const handleCertificateCardDrop = (event, targetId) => {
    event.preventDefault();

    const sourceId =
      draggedCertificateId || event.dataTransfer.getData("text/plain");

    setDragOverCertificateId(null);
    setDraggedCertificateId(null);

    if (!sourceId || sourceId === targetId || orderSaving) {
      return;
    }

    setCertificates((current) => {
      const sourceIndex = current.findIndex(
        (certificate) => String(certificate._id) === String(sourceId),
      );

      const targetIndex = current.findIndex(
        (certificate) => String(certificate._id) === String(targetId),
      );

      if (sourceIndex === -1 || targetIndex === -1) {
        return current;
      }

      const next = [...current];
      const [movedCertificate] = next.splice(sourceIndex, 1);
      next.splice(targetIndex, 0, movedCertificate);

      return next;
    });

    setOrderDirty(true);
    setError("");
    setSuccess("");
  };

  const handleCertificateCardDragEnd = () => {
    setDraggedCertificateId(null);
    setDragOverCertificateId(null);
  };

  const moveCertificateBy = (id, direction) => {
    if (orderSaving) {
      return;
    }

    setCertificates((current) => {
      const index = current.findIndex(
        (certificate) => String(certificate._id) === String(id),
      );

      if (index === -1) {
        return current;
      }

      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [movedCertificate] = next.splice(index, 1);
      next.splice(targetIndex, 0, movedCertificate);

      return next;
    });

    setOrderDirty(true);
    setError("");
    setSuccess("");
  };

  const handleSaveCertificateOrder = async () => {
    if (orderSaving || !certificates.length || !orderDirty) {
      return;
    }

    try {
      setOrderSaving(true);
      setError("");
      setSuccess("");

      const certificateIds = certificates
        .map((certificate) => certificate._id)
        .filter(Boolean);

      const response = await reorderCertificates(certificateIds, token);

      const savedCertificates = Array.isArray(response)
        ? response
        : Array.isArray(response?.certificates)
          ? response.certificates
          : null;

      if (savedCertificates) {
        setCertificates(savedCertificates);
      }

      setOrderDirty(false);
      setSuccess("Certificate order saved successfully.");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save certificate order.",
      );
    } finally {
      setOrderSaving(false);
      setDraggedCertificateId(null);
      setDragOverCertificateId(null);
    }
  };

  const handleDeleteCertificate = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this certificate?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteCertificate(id, token);

      setCertificates((current) =>
        current.filter((certificate) => certificate._id !== id),
      );

      setSuccess("Certificate deleted successfully.");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to delete certificate.",
      );
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const formatFileSize = (bytes) => {
    if (!bytes) {
      return "Unknown size";
    }

    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <style>{certificateStyles}</style>

        <div className="admin-shell certificates-admin-page">
          <AdminSidebar onLogout={logout} />

          <main className="admin-main">
            <div className="certificates-loading">
              <div className="certificates-loading-icon">📜</div>

              <div>
                <strong>Loading Certificates</strong>
                <span>Fetching your certificate library…</span>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{certificateStyles}</style>

      <div className="admin-shell certificates-admin-page">
        <AdminSidebar onLogout={logout} />

        <main className="admin-main">
          <div className="certificates-container">
            {/* ─────────────────────────────────────────────
                HEADER
            ───────────────────────────────────────────── */}

            <header className="certificates-header">
              <div className="certificates-header-copy">
                <div className="certificates-eyebrow">
                  <span className="eyebrow-dot" />
                  Portfolio CMS
                </div>

                <h1>Certificates</h1>

                <p>
                  Manage professional certificates and credentials displayed on
                  your portfolio.
                </p>
              </div>

              <div className="certificates-header-actions">
                <button
                  type="button"
                  className="certificate-secondary-btn"
                  onClick={() => navigate("/admin")}
                >
                  <span>←</span>
                  Dashboard
                </button>

                <button
                  type="button"
                  className="certificate-secondary-btn"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </header>

            {/* ─────────────────────────────────────────────
                ALERTS
            ───────────────────────────────────────────── */}

            {error && (
              <div className="certificate-alert certificate-alert-error">
                <div className="alert-icon">!</div>

                <div>
                  <strong>Action could not be completed</strong>
                  <span>{error}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}

            {success && (
              <div className="certificate-alert certificate-alert-success">
                <div className="alert-icon">✓</div>

                <div>
                  <strong>Success</strong>
                  <span>{success}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  aria-label="Dismiss success"
                >
                  ×
                </button>
              </div>
            )}

            {/* ─────────────────────────────────────────────
                STATISTICS
            ───────────────────────────────────────────── */}

            <section className="certificate-stat-grid">
              <div className="certificate-stat-card">
                <div className="certificate-stat-icon">📜</div>

                <div>
                  <span>Total Certificates</span>
                  <strong>{certificates.length}</strong>
                </div>
              </div>

              <div className="certificate-stat-card">
                <div className="certificate-stat-icon">◈</div>

                <div>
                  <span>Categories</span>
                  <strong>{Math.max(0, categories.length - 1)}</strong>
                </div>
              </div>

              <div className="certificate-stat-card">
                <div className="certificate-stat-icon">✓</div>

                <div>
                  <span>Portfolio Ready</span>
                  <strong>{certificates.length}</strong>
                </div>
              </div>

              <div className="certificate-stat-card">
                <div className="certificate-stat-icon">↗</div>

                <div>
                  <span>Latest Certificate</span>
                  <strong>
                    {latestCertificate
                      ? latestCertificate.title?.slice(0, 18) +
                        (latestCertificate.title?.length > 18 ? "…" : "")
                      : "None"}
                  </strong>
                </div>
              </div>
            </section>

            {/* ─────────────────────────────────────────────
                UPLOAD WORKSPACE
            ───────────────────────────────────────────── */}

            <section className="certificate-workspace">
              <div className="certificate-workspace-heading">
                <div>
                  <span className="section-kicker">
                    {editingCertificateId ? "EDIT" : "CREATE"}
                  </span>
                  <h2>
                    {editingCertificateId
                      ? "Edit Certificate"
                      : "Add New Certificate"}
                  </h2>
                  <p>
                    {editingCertificateId
                      ? "Update the selected certificate details. You can optionally replace its file."
                      : "Upload a certificate and provide the details that should appear in your portfolio."}
                  </p>
                </div>

                <div className="secure-badge">
                  <span>●</span>
                  Admin Only
                </div>
              </div>

              <form onSubmit={handleCertificateUpload}>
                <div className="certificate-form-layout">
                  {/* LEFT — DETAILS */}

                  <div className="certificate-form-details">
                    <div className="certificate-field">
                      <label htmlFor="certificate-title">
                        Certificate Title
                        <span>*</span>
                      </label>

                      <input
                        id="certificate-title"
                        name="title"
                        type="text"
                        value={certificateForm.title}
                        onChange={handleCertificateChange}
                        placeholder="e.g. Artificial Intelligence Internship"
                        maxLength={200}
                        required
                      />
                    </div>

                    <div className="certificate-two-column">
                      <div className="certificate-field">
                        <label htmlFor="certificate-issuer">
                          Issuer
                          <span>*</span>
                        </label>

                        <input
                          id="certificate-issuer"
                          name="issuer"
                          type="text"
                          value={certificateForm.issuer}
                          onChange={handleCertificateChange}
                          placeholder="e.g. InternPe"
                          maxLength={150}
                          required
                        />
                      </div>

                      <div className="certificate-field">
                        <label htmlFor="certificate-id">Certificate ID</label>

                        <input
                          id="certificate-id"
                          name="certificateId"
                          type="text"
                          value={certificateForm.certificateId}
                          onChange={handleCertificateChange}
                          placeholder="e.g. IPI#75119"
                          maxLength={100}
                        />
                      </div>
                    </div>

                    <div className="certificate-two-column">
                      <div className="certificate-field">
                        <label htmlFor="certificate-category">Category</label>

                        <input
                          id="certificate-category"
                          name="category"
                          type="text"
                          value={certificateForm.category}
                          onChange={handleCertificateChange}
                          placeholder="Certification"
                          maxLength={100}
                        />
                      </div>

                      <div className="certificate-field">
                        <label htmlFor="certificate-date">
                          Completion Date
                        </label>

                        <input
                          id="certificate-date"
                          name="completionDate"
                          type="text"
                          value={certificateForm.completionDate}
                          onChange={handleCertificateChange}
                          placeholder="e.g. 07 June 2026"
                          maxLength={50}
                        />
                      </div>
                    </div>

                    <div className="certificate-field">
                      <label htmlFor="certificate-description">
                        Description
                      </label>

                      <textarea
                        id="certificate-description"
                        name="description"
                        value={certificateForm.description}
                        onChange={handleCertificateChange}
                        placeholder="Add a short description of the certificate, internship, course or achievement."
                        maxLength={1000}
                        rows={5}
                      />

                      <small>{certificateForm.description.length}/1000</small>
                    </div>
                  </div>

                  {/* RIGHT — FILE */}

                  <div className="certificate-upload-column">
                    <label className="certificate-upload-label">
                      Certificate File
                      {!editingCertificateId && <span>*</span>}
                    </label>

                    {editingCertificateId && (
                      <div className="certificate-edit-file-note">
                        Existing certificate file will be kept unless you select
                        a new file.
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      id="certificate-file"
                      name="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                      onChange={handleCertificateChange}
                      hidden
                    />

                    {!certificateForm.file ? (
                      <button
                        type="button"
                        className={`certificate-dropzone ${
                          dragActive ? "drag-active" : ""
                        }`}
                        onClick={openFilePicker}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <div className="dropzone-icon">↑</div>

                        <strong>
                          {editingCertificateId
                            ? "Replace certificate file (optional)"
                            : "Drop certificate here"}
                        </strong>

                        <span>
                          {editingCertificateId
                            ? "or click to choose a new file"
                            : "or click to browse from your computer"}
                        </span>

                        <div className="dropzone-formats">
                          <span>PDF</span>
                          <span>JPG</span>
                          <span>PNG</span>
                          <span>WEBP</span>
                        </div>

                        <small>Maximum file size: 10 MB</small>
                      </button>
                    ) : (
                      <div className="selected-file-card">
                        <div className="selected-file-icon">
                          {certificateForm.file.type === "application/pdf"
                            ? "PDF"
                            : "IMG"}
                        </div>

                        <div className="selected-file-info">
                          <strong title={certificateForm.file.name}>
                            {certificateForm.file.name}
                          </strong>

                          <span>
                            {formatFileSize(certificateForm.file.size)}
                          </span>
                        </div>

                        <button
                          type="button"
                          className="remove-file-btn"
                          onClick={() => {
                            setCertificateForm((current) => ({
                              ...current,
                              file: null,
                            }));

                            if (fileInputRef.current) {
                              fileInputRef.current.value = "";
                            }
                          }}
                          aria-label="Remove selected file"
                        >
                          ×
                        </button>
                      </div>
                    )}

                    <div className="upload-security-note">
                      <span>✓</span>
                      <div>
                        <strong>Supported secure upload</strong>
                        <small>
                          PDF, JPG, JPEG, PNG and WEBP files up to 10 MB.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="certificate-form-footer">
                  <div className="form-footer-note">
                    <span>●</span>
                    {editingCertificateId
                      ? "Certificate changes will be saved to the portfolio database."
                      : "Certificate will be stored in the portfolio database after upload."}
                  </div>

                  <div className="certificate-form-actions">
                    <button
                      type="button"
                      className="certificate-cancel-btn"
                      onClick={resetForm}
                      disabled={certificateLoading}
                    >
                      {editingCertificateId ? "Cancel Edit" : "Clear"}
                    </button>

                    <button
                      type="submit"
                      className="certificate-upload-btn"
                      disabled={certificateLoading}
                    >
                      {certificateLoading ? (
                        <>
                          <span className="button-spinner" />
                          Uploading…
                        </>
                      ) : (
                        <>
                          {editingCertificateId
                            ? "Update Certificate"
                            : "Upload Certificate"}
                          <span>→</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* ─────────────────────────────────────────────
                CERTIFICATE LIBRARY
            ───────────────────────────────────────────── */}

            <section className="certificate-library">
              <div className="certificate-library-header">
                <div>
                  <span className="section-kicker">LIBRARY</span>

                  <h2>Existing Certificates</h2>

                  <p>
                    {certificates.length
                      ? `${certificates.length} ${certificates.length === 1 ? "certificate" : "certificates"} in your portfolio. Drag certificates to change their display order.`
                      : "No certificates uploaded yet."}
                  </p>
                </div>

                <div className="certificate-library-tools">
                  <div className="certificate-search">
                    <span>⌕</span>

                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search certificates…"
                      aria-label="Search certificates"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={(event) => setCategoryFilter(event.target.value)}
                    aria-label="Filter certificates by category"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="certificate-save-order-btn"
                    onClick={handleSaveCertificateOrder}
                    disabled={orderSaving || !orderDirty || !canReorder}
                  >
                    {orderSaving ? (
                      <>
                        <span className="button-spinner" />
                        Saving…
                      </>
                    ) : (
                      <>
                        <span>↕</span>
                        Save Order
                      </>
                    )}
                  </button>
                </div>

                <div className="certificate-library-count-badge">
                  <strong>{certificates.length}</strong>
                  <span>
                    {certificates.length === 1 ? "certificate" : "certificates"}
                  </span>
                </div>
              </div>

              {certificates.length > 1 && (
                <div className="certificate-order-hint">
                  <span>⠿</span>
                  <span>
                    {canReorder
                      ? "Drag certificates to change their display order, then click Save Order."
                      : "Clear search and category filters to enable certificate reordering."}
                  </span>
                </div>
              )}

              {certificates.length === 0 ? (
                <div className="certificate-empty-state">
                  <div className="empty-icon">📜</div>

                  <h3>No certificates yet</h3>

                  <p>
                    Your uploaded certificates will appear here. Upload your
                    first certificate using the form above.
                  </p>
                </div>
              ) : filteredCertificates.length === 0 ? (
                <div className="certificate-empty-state">
                  <div className="empty-icon">⌕</div>

                  <h3>No matching certificates</h3>

                  <p>
                    Try a different search term or change the category filter.
                  </p>

                  <button
                    type="button"
                    className="certificate-secondary-btn"
                    onClick={() => {
                      setSearch("");
                      setCategoryFilter("All");
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="certificate-table-wrap">
                  <div className="certificate-table-head">
                    <div>#</div>
                    <div>CERTIFICATE</div>
                    <div>ISSUER</div>
                    <div>CATEGORY</div>
                    <div>COMPLETION</div>
                    <div>ACTIONS</div>
                  </div>

                  <div className="certificate-table-body">
                    {filteredCertificates.map((certificate, index) => (
                      <article
                        className={`certificate-row ${
                          draggedCertificateId === certificate._id
                            ? "certificate-row-dragging"
                            : ""
                        } ${
                          dragOverCertificateId === certificate._id
                            ? "certificate-row-drag-over"
                            : ""
                        }`}
                        key={certificate._id || index}
                        draggable={!orderSaving && canReorder}
                        onDragStart={(event) =>
                          handleCertificateCardDragStart(event, certificate._id)
                        }
                        onDragOver={(event) =>
                          handleCertificateCardDragOver(event, certificate._id)
                        }
                        onDragLeave={(event) =>
                          handleCertificateCardDragLeave(event, certificate._id)
                        }
                        onDrop={(event) =>
                          handleCertificateCardDrop(event, certificate._id)
                        }
                        onDragEnd={handleCertificateCardDragEnd}
                      >
                        <div
                          className="certificate-order-number"
                          data-label="Order"
                        >
                          <span>{index + 1}</span>
                        </div>

                        <div
                          className="certificate-row-title"
                          data-label="Certificate"
                        >
                          <div
                            className="certificate-row-drag-handle"
                            title="Drag to reorder"
                          >
                            ⠿
                          </div>
                          <div className="certificate-row-document">📜</div>
                          <div className="certificate-row-title-text">
                            <strong title={certificate.title}>
                              {certificate.title || "Untitled Certificate"}
                            </strong>
                            <span>
                              {certificate.certificateId || "No certificate ID"}
                            </span>
                          </div>
                        </div>

                        <div
                          className="certificate-row-issuer"
                          data-label="Issuer"
                        >
                          {certificate.issuer || "—"}
                        </div>

                        <div
                          className="certificate-row-category-cell"
                          data-label="Category"
                        >
                          <span className="certificate-row-category">
                            {certificate.category || "Certification"}
                          </span>
                        </div>

                        <div
                          className="certificate-row-date"
                          data-label="Completion"
                        >
                          {certificate.completionDate ||
                            formatDate(certificate.createdAt) ||
                            "—"}
                        </div>

                        <div
                          className="certificate-row-actions"
                          data-label="Actions"
                        >
                          <div
                            className="certificate-mobile-order-controls"
                            aria-label="Mobile reorder controls"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                moveCertificateBy(certificate._id, -1)
                              }
                              disabled={orderSaving || index === 0}
                              aria-label={`Move ${certificate.title || "certificate"} up`}
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                moveCertificateBy(certificate._id, 1)
                              }
                              disabled={
                                orderSaving ||
                                index === filteredCertificates.length - 1
                              }
                              aria-label={`Move ${certificate.title || "certificate"} down`}
                              title="Move down"
                            >
                              ↓
                            </button>
                          </div>

                          <a
                            href={`/api/certificates/${certificate._id}/file`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="certificate-view-btn"
                          >
                            <span aria-hidden="true">↗</span>
                            View
                          </a>

                          <button
                            type="button"
                            className="certificate-edit-btn"
                            onClick={() => handleEditCertificate(certificate)}
                            disabled={orderSaving}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="certificate-delete-btn"
                            onClick={() =>
                              handleDeleteCertificate(certificate._id)
                            }
                            disabled={orderSaving}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ─────────────────────────────────────────────
                FOOTER
            ───────────────────────────────────────────── */}

            <footer className="certificates-page-footer">
              <span>●</span>

              <p>
                Certificate management is connected directly to your portfolio
                database.
              </p>

              <span className="footer-count">
                {certificates.length}{" "}
                {certificates.length === 1 ? "certificate" : "certificates"}
              </span>
            </footer>
          </div>
        </main>
      </div>
    </>
  );
}

const certificateStyles = `
  .certificates-admin-page {
    min-height: 100vh;
    background:
      radial-gradient(circle at 82% 0%, rgba(45, 212, 191, 0.075), transparent 30%),
      radial-gradient(circle at 8% 18%, rgba(96, 165, 250, 0.035), transparent 24%),
      #080d12;
    color: #edf2f7;
  }

  .certificates-admin-page *,
  .certificates-admin-page *::before,
  .certificates-admin-page *::after {
    box-sizing: border-box;
  }

  .certificates-container {
    width: min(1440px, calc(100% - 48px));
    margin: 0 auto;
    padding: 36px 0 64px;
  }

  .certificates-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 28px;
    margin-bottom: 24px;
  }

  .certificates-header-copy {
    min-width: 0;
    max-width: 820px;
  }

  .certificates-eyebrow,
  .section-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #5eead4;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.16em;
    line-height: 1.2;
    text-transform: uppercase;
  }

  .eyebrow-dot {
    width: 7px;
    height: 7px;
    flex: 0 0 7px;
    border-radius: 50%;
    background: #5eead4;
    box-shadow: 0 0 14px rgba(94, 234, 212, 0.55);
  }

  .certificates-header h1 {
    margin: 9px 0 8px;
    color: #f8fafc;
    font-size: clamp(34px, 4vw, 48px);
    font-weight: 850;
    line-height: 1.02;
    letter-spacing: -0.045em;
  }

  .certificates-header p {
    max-width: 700px;
    margin: 0;
    color: #81909e;
    font-size: 14px;
    line-height: 1.65;
  }

  .certificates-header-actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: flex-end;
    gap: 9px;
  }

  .certificate-secondary-btn {
    min-height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 14px;
    border: 1px solid #26333f;
    border-radius: 9px;
    background: #101820;
    color: #d6e0e8;
    font: inherit;
    font-size: 11px;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
  }

  .certificate-secondary-btn:hover {
    border-color: #3b4b59;
    background: #151f28;
    transform: translateY(-1px);
  }

  .certificate-alert {
    min-height: 52px;
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    padding: 10px 13px;
    border: 1px solid;
    border-radius: 11px;
  }

  .certificate-alert > div:nth-child(2) {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .certificate-alert strong {
    font-size: 12px;
    line-height: 1.3;
  }

  .certificate-alert span {
    color: #aab7c3;
    font-size: 11px;
    line-height: 1.45;
  }

  .certificate-alert > button {
    flex: 0 0 auto;
    border: 0;
    background: transparent;
    color: #82909d;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
  }

  .certificate-alert-error {
    background: rgba(239, 68, 68, 0.06);
    border-color: rgba(239, 68, 68, 0.24);
  }

  .certificate-alert-success {
    background: rgba(45, 212, 191, 0.055);
    border-color: rgba(45, 212, 191, 0.22);
  }

  .alert-icon {
    width: 30px;
    height: 30px;
    flex: 0 0 30px;
    display: grid;
    place-items: center;
    border: 1px solid #26343f;
    border-radius: 50%;
    background: #111a22;
    font-size: 12px;
    font-weight: 900;
  }

  .certificate-alert-error .alert-icon {
    color: #fca5a5;
  }

  .certificate-alert-success .alert-icon {
    color: #5eead4;
  }

  .certificate-stat-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 20px;
  }

  .certificate-stat-card {
    min-width: 0;
    min-height: 96px;
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 16px;
    border: 1px solid #202c37;
    border-radius: 14px;
    background: linear-gradient(145deg, rgba(18, 27, 36, 0.96), rgba(9, 14, 19, 0.98));
  }

  .certificate-stat-icon {
    width: 43px;
    height: 43px;
    flex: 0 0 43px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(45, 212, 191, 0.14);
    border-radius: 11px;
    background: rgba(45, 212, 191, 0.07);
    color: #5eead4;
    font-size: 17px;
  }

  .certificate-stat-card > div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .certificate-stat-card span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #71808f;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .certificate-stat-card strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #f3f7fa;
    font-size: 18px;
    font-weight: 850;
    line-height: 1.2;
  }

  .certificate-workspace,
  .certificate-library {
    border: 1px solid #202c37;
    border-radius: 17px;
    background: linear-gradient(145deg, rgba(16, 24, 32, 0.97), rgba(8, 13, 18, 0.99));
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.13);
  }

  .certificate-workspace {
    margin-bottom: 20px;
    padding: 25px;
  }

  .certificate-workspace-heading,
  .certificate-library-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
  }

  .certificate-workspace-heading {
    margin-bottom: 23px;
    padding-bottom: 20px;
    border-bottom: 1px solid #202c37;
  }

  .certificate-workspace-heading > div:first-child,
  .certificate-library-header > div:first-child {
    min-width: 0;
  }

  .certificate-workspace-heading h2,
  .certificate-library-header h2 {
    margin: 5px 0 5px;
    color: #edf3f7;
    font-size: 21px;
    font-weight: 850;
    line-height: 1.25;
    letter-spacing: -0.025em;
  }

  .certificate-workspace-heading p,
  .certificate-library-header p {
    max-width: 720px;
    margin: 0;
    color: #758492;
    font-size: 12px;
    line-height: 1.55;
  }

  .secure-badge {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    min-height: 31px;
    padding: 0 10px;
    border: 1px solid rgba(45, 212, 191, 0.15);
    border-radius: 999px;
    background: rgba(45, 212, 191, 0.055);
    color: #7de9da;
    font-size: 10px;
    font-weight: 850;
    white-space: nowrap;
  }

  .secure-badge span {
    font-size: 7px;
  }

  .certificate-form-layout {
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
    gap: 25px;
  }

  .certificate-form-details {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .certificate-field {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  .certificate-field label,
  .certificate-upload-label {
    color: #b8c4cf;
    font-size: 11px;
    font-weight: 800;
    line-height: 1.3;
  }

  .certificate-field label span,
  .certificate-upload-label span {
    margin-left: 3px;
    color: #5eead4;
  }

  .certificate-field input,
  .certificate-field textarea,
  .certificate-library-tools input,
  .certificate-library-tools select {
    width: 100%;
    border: 1px solid #293743;
    outline: none;
    border-radius: 9px;
    background: #0a1117;
    color: #edf3f7;
    font: inherit;
    font-size: 12px;
    line-height: 1.4;
    transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  }

  .certificate-field input,
  .certificate-library-tools input,
  .certificate-library-tools select {
    min-height: 42px;
    padding: 0 12px;
  }

  .certificate-field textarea {
    min-height: 112px;
    padding: 11px 12px;
    resize: vertical;
    line-height: 1.55;
  }

  .certificate-field input:focus,
  .certificate-field textarea:focus,
  .certificate-library-tools input:focus,
  .certificate-library-tools select:focus {
    border-color: rgba(94, 234, 212, 0.6);
    background: #0b131a;
    box-shadow: 0 0 0 3px rgba(94, 234, 212, 0.055);
  }

  .certificate-field input::placeholder,
  .certificate-field textarea::placeholder {
    color: #4f5e6b;
  }

  .certificate-field small {
    align-self: flex-end;
    color: #566574;
    font-size: 9px;
  }

  .certificate-two-column {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .certificate-upload-column {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .certificate-edit-file-note {
    padding: 9px 11px;
    border: 1px solid #202c37;
    border-radius: 8px;
    background: #0a1117;
    color: #687785;
    font-size: 10px;
    line-height: 1.5;
  }

  .certificate-dropzone,
  .selected-file-card {
    width: 100%;
    min-height: 270px;
    border-radius: 14px;
  }

  .certificate-dropzone {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 22px;
    border: 1px dashed #3a4b58;
    background: radial-gradient(circle at 50% 18%, rgba(45, 212, 191, 0.07), transparent 43%), #0a1117;
    color: #edf3f7;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
  }

  .certificate-dropzone:hover,
  .certificate-dropzone.drag-active {
    border-color: #5eead4;
    background: radial-gradient(circle at 50% 18%, rgba(45, 212, 191, 0.105), transparent 45%), #0b151b;
  }

  .certificate-dropzone.drag-active {
    transform: scale(1.008);
  }

  .dropzone-icon {
    width: 52px;
    height: 52px;
    display: grid;
    place-items: center;
    margin-bottom: 4px;
    border: 1px solid rgba(45, 212, 191, 0.18);
    border-radius: 14px;
    background: rgba(45, 212, 191, 0.075);
    color: #5eead4;
    font-size: 23px;
  }

  .certificate-dropzone strong {
    font-size: 14px;
    line-height: 1.35;
  }

  .certificate-dropzone > span {
    color: #73818f;
    font-size: 11px;
  }

  .dropzone-formats {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
    margin-top: 7px;
  }

  .dropzone-formats span {
    padding: 4px 7px;
    border: 1px solid #26333e;
    border-radius: 5px;
    background: #131c24;
    color: #8e9daa;
    font-size: 8px;
    font-weight: 850;
  }

  .certificate-dropzone small {
    margin-top: 2px;
    color: #566574;
    font-size: 9px;
  }

  .selected-file-card {
    display: flex;
    align-items: center;
    gap: 13px;
    padding: 20px;
    border: 1px solid rgba(94, 234, 212, 0.23);
    background: linear-gradient(145deg, rgba(45, 212, 191, 0.055), rgba(8, 14, 19, 0.98));
  }

  .selected-file-icon {
    width: 56px;
    height: 56px;
    flex: 0 0 56px;
    display: grid;
    place-items: center;
    border-radius: 13px;
    background: rgba(45, 212, 191, 0.09);
    color: #5eead4;
    font-size: 11px;
    font-weight: 900;
  }

  .selected-file-info {
    min-width: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .selected-file-info strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #e9f0f4;
    font-size: 12px;
  }

  .selected-file-info span {
    color: #70808e;
    font-size: 10px;
  }

  .remove-file-btn {
    width: 34px;
    height: 34px;
    flex: 0 0 34px;
    display: grid;
    place-items: center;
    border: 1px solid #2c3a46;
    border-radius: 8px;
    background: #111820;
    color: #9aa7b3;
    font-size: 17px;
    cursor: pointer;
  }

  .remove-file-btn:hover {
    border-color: rgba(239, 68, 68, 0.45);
    color: #fca5a5;
  }

  .upload-security-note {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 11px;
    border: 1px solid #202c37;
    border-radius: 8px;
    background: #0a1117;
  }

  .upload-security-note > span {
    color: #5eead4;
    font-size: 11px;
  }

  .upload-security-note div {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .upload-security-note strong {
    color: #aebac5;
    font-size: 9px;
  }

  .upload-security-note small {
    color: #596775;
    font-size: 9px;
    line-height: 1.35;
  }

  .certificate-form-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    margin-top: 24px;
    padding-top: 19px;
    border-top: 1px solid #202c37;
  }

  .form-footer-note {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    color: #5f6d7b;
    font-size: 10px;
    line-height: 1.45;
  }

  .form-footer-note span {
    flex: 0 0 auto;
    color: #5eead4;
    font-size: 7px;
  }

  .certificate-form-actions {
    display: flex;
    flex: 0 0 auto;
    gap: 8px;
  }

  .certificate-cancel-btn,
  .certificate-upload-btn {
    min-height: 38px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    padding: 0 14px;
    border-radius: 8px;
    font: inherit;
    font-size: 10px;
    font-weight: 850;
    line-height: 1;
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
  }

  .certificate-cancel-btn {
    border: 1px solid #293742;
    background: #111820;
    color: #aab6c0;
  }

  .certificate-upload-btn {
    border: 1px solid rgba(94, 234, 212, 0.25);
    background: #164e4a;
    color: #dffff9;
  }

  .certificate-cancel-btn:hover:not(:disabled),
  .certificate-upload-btn:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .certificate-upload-btn:hover:not(:disabled) {
    border-color: rgba(94, 234, 212, 0.5);
  }

  .certificate-cancel-btn:disabled,
  .certificate-upload-btn:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .button-spinner {
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.28);
    border-top-color: #fff;
    border-radius: 50%;
    animation: certificateSpin 0.7s linear infinite;
  }

  .certificate-library {
    padding: 25px;
  }

  .certificate-library-header {
    align-items: center;
    margin-bottom: 18px;
    padding-bottom: 18px;
    border-bottom: 1px solid #202c37;
  }

  .certificate-library-tools {
    min-width: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
  }

  .certificate-search {
    position: relative;
    width: 235px;
    flex: 0 1 235px;
  }

  .certificate-search > span {
    position: absolute;
    left: 11px;
    top: 50%;
    z-index: 1;
    transform: translateY(-52%);
    color: #677583;
    font-size: 17px;
    pointer-events: none;
  }

  .certificate-library-tools input {
    padding-left: 32px;
  }

  .certificate-library-tools select {
    width: 138px;
    flex: 0 0 138px;
    cursor: pointer;
  }

  .certificate-save-order-btn {
    min-width: 112px;
    min-height: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    padding: 0 12px;
    border: 1px solid rgba(94, 234, 212, 0.22);
    border-radius: 9px;
    background: #164e4a;
    color: #dffff9;
    font: inherit;
    font-size: 10px;
    font-weight: 850;
    white-space: nowrap;
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, opacity 0.18s ease;
  }

  .certificate-save-order-btn:hover:not(:disabled) {
    border-color: rgba(94, 234, 212, 0.5);
    transform: translateY(-1px);
  }

  .certificate-save-order-btn:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  .certificate-library-count-badge {
    width: 58px;
    height: 58px;
    flex: 0 0 58px;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border: 1px solid #26333f;
    border-radius: 11px;
    background: #111820;
  }

  .certificate-library-count-badge strong {
    color: #dbe6ed;
    font-size: 15px;
    line-height: 1;
  }

  .certificate-library-count-badge span {
    color: #667685;
    font-size: 7px;
    font-weight: 750;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .certificate-order-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: -6px 0 15px;
    padding: 9px 11px;
    border: 1px solid #202c37;
    border-radius: 8px;
    background: #0a1117;
    color: #657482;
    font-size: 9px;
    line-height: 1.45;
  }

  .certificate-order-hint > span:first-child {
    flex: 0 0 auto;
    color: #5eead4;
    font-size: 14px;
  }

  .certificate-table-wrap {
    width: 100%;
    overflow-x: auto;
    border: 1px solid #202c37;
    border-radius: 12px;
    background: #090f15;
  }

  .certificate-table-head,
  .certificate-row {
    min-width: 1080px;
    display: grid;
    grid-template-columns:
      62px
      minmax(300px, 1.75fr)
      minmax(145px, 0.95fr)
      minmax(135px, 0.85fr)
      minmax(125px, 0.8fr)
      266px;
    align-items: center;
  }

  .certificate-table-head {
    min-height: 45px;
    padding: 0 13px;
    border-bottom: 1px solid #202c37;
    background: #0e161e;
    color: #6e8091;
    font-size: 8px;
    font-weight: 850;
    letter-spacing: 0.12em;
  }

  .certificate-table-head > div:last-child {
    text-align: right;
  }

  .certificate-row {
    min-height: 78px;
    padding: 0 13px;
    border-bottom: 1px solid #1d2731;
    background: #0a1117;
    transition: background 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }

  .certificate-row:last-child {
    border-bottom: 0;
  }

  .certificate-row:hover {
    background: #0e171f;
  }

  .certificate-row[draggable="true"] {
    cursor: grab;
  }

  .certificate-row[draggable="true"]:active {
    cursor: grabbing;
  }

  .certificate-row-dragging {
    opacity: 0.43;
  }

  .certificate-row-drag-over {
    background: rgba(45, 212, 191, 0.045);
    box-shadow: inset 0 2px 0 #5eead4, inset 0 -2px 0 #5eead4;
  }

  .certificate-order-number {
    display: flex;
    align-items: center;
  }

  .certificate-order-number span {
    width: 31px;
    height: 31px;
    display: grid;
    place-items: center;
    border: 1px solid #1d2a35;
    border-radius: 8px;
    background: #101923;
    color: #748696;
    font-size: 10px;
    font-weight: 850;
  }

  .certificate-row-title {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 9px;
    padding-right: 15px;
  }

  .certificate-row-drag-handle {
    width: 28px;
    height: 34px;
    flex: 0 0 28px;
    display: grid;
    place-items: center;
    border: 1px solid #263541;
    border-radius: 7px;
    background: #0e151d;
    color: #687b8c;
    font-size: 15px;
    line-height: 1;
    user-select: none;
  }

  .certificate-row:hover .certificate-row-drag-handle {
    border-color: #38505d;
    color: #5eead4;
  }

  .certificate-row-document {
    width: 39px;
    height: 39px;
    flex: 0 0 39px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(45, 212, 191, 0.13);
    border-radius: 9px;
    background: rgba(45, 212, 191, 0.065);
    font-size: 16px;
  }

  .certificate-row-title-text {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .certificate-row-title-text strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #edf3f7;
    font-size: 12px;
    font-weight: 850;
    line-height: 1.3;
  }

  .certificate-row-title-text span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #596b7b;
    font-size: 9px;
    line-height: 1.3;
  }

  .certificate-row-issuer,
  .certificate-row-date {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 14px;
    color: #a3b1bd;
    font-size: 10px;
    line-height: 1.4;
  }

  .certificate-row-category-cell {
    min-width: 0;
  }

  .certificate-row-category {
    display: inline-block;
    max-width: 125px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 6px 8px;
    border: 1px solid #263541;
    border-radius: 7px;
    background: #141d25;
    color: #8ca1b3;
    font-size: 8px;
    font-weight: 850;
    line-height: 1.2;
  }

  .certificate-row-actions {
    min-width: 0;
    min-height: 38px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 7px;
    padding-left: 13px;
    border-left: 1px solid #1f2a34;
  }

  .certificate-row-actions > a,
  .certificate-row-actions > button {
    width: 78px !important;
    min-width: 78px !important;
    max-width: 78px !important;
    height: 36px !important;
    min-height: 36px !important;
    max-height: 36px !important;
    flex: 0 0 78px !important;
    box-sizing: border-box;
    margin: 0 !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 0 7px;
    border-radius: 8px;
    font: inherit;
    font-size: 9px;
    font-weight: 850;
    line-height: 1;
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease, color 0.18s ease;
  }

  .certificate-row-actions > a:hover,
  .certificate-row-actions > button:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  .certificate-view-btn {
    border: 1px solid rgba(94, 234, 212, 0.25);
    background: rgba(45, 212, 191, 0.08);
    color: #67e8d8;
  }

  .certificate-view-btn:hover {
    border-color: rgba(94, 234, 212, 0.55);
    background: rgba(45, 212, 191, 0.14);
  }

  .certificate-edit-btn {
    border: 1px solid rgba(96, 165, 250, 0.28);
    background: rgba(59, 130, 246, 0.065);
    color: #93c5fd;
  }

  .certificate-edit-btn:hover:not(:disabled) {
    border-color: rgba(96, 165, 250, 0.58);
    background: rgba(59, 130, 246, 0.12);
  }

  .certificate-delete-btn {
    border: 1px solid rgba(248, 113, 113, 0.24);
    background: rgba(239, 68, 68, 0.05);
    color: #fca5a5;
  }

  .certificate-delete-btn:hover:not(:disabled) {
    border-color: rgba(248, 113, 113, 0.55);
    background: rgba(239, 68, 68, 0.11);
    color: #fecaca;
  }

  .certificate-edit-btn:disabled,
  .certificate-delete-btn:disabled {
    cursor: not-allowed;
    opacity: 0.42;
    transform: none;
  }

  .certificate-mobile-order-controls {
    display: none;
  }

  .certificate-row-actions > a:focus-visible,
  .certificate-row-actions > button:focus-visible,
  .certificate-row-drag-handle:focus-visible,
  .certificate-secondary-btn:focus-visible,
  .certificate-save-order-btn:focus-visible,
  .certificate-cancel-btn:focus-visible,
  .certificate-upload-btn:focus-visible {
    outline: 2px solid #5eead4;
    outline-offset: 2px;
  }

  .certificate-empty-state {
    min-height: 280px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 34px;
    border: 1px dashed #2b3945;
    border-radius: 12px;
    background: #090f15;
    text-align: center;
  }

  .empty-icon {
    width: 58px;
    height: 58px;
    display: grid;
    place-items: center;
    margin-bottom: 13px;
    border: 1px solid #26343f;
    border-radius: 14px;
    background: #111a22;
    color: #5eead4;
    font-size: 22px;
  }

  .certificate-empty-state h3 {
    margin: 0 0 6px;
    color: #dbe3e9;
    font-size: 15px;
    line-height: 1.3;
  }

  .certificate-empty-state p {
    max-width: 440px;
    margin: 0 0 16px;
    color: #657482;
    font-size: 11px;
    line-height: 1.65;
  }

  .certificates-page-footer {
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    padding: 0 3px;
  }

  .certificates-page-footer > span:first-child {
    flex: 0 0 auto;
    color: #5eead4;
    font-size: 7px;
  }

  .certificates-page-footer p {
    min-width: 0;
    flex: 1;
    margin: 0;
    color: #596775;
    font-size: 9px;
    line-height: 1.45;
  }

  .footer-count {
    flex: 0 0 auto;
    color: #667582;
    font-size: 9px;
  }

  .certificates-loading {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 14px;
    color: #8c99a6;
  }

  .certificates-loading-icon {
    width: 48px;
    height: 48px;
    flex: 0 0 48px;
    display: grid;
    place-items: center;
    border: 1px solid #26333e;
    border-radius: 13px;
    background: #111820;
    font-size: 20px;
  }

  .certificates-loading div:last-child {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .certificates-loading strong {
    color: #dce4ea;
    font-size: 13px;
  }

  .certificates-loading span {
    color: #657482;
    font-size: 10px;
  }

  @keyframes certificateSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 1240px) {
    .certificates-container {
      width: min(100% - 36px, 1180px);
    }

    .certificate-stat-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .certificate-form-layout {
      grid-template-columns: 1fr;
    }

    .certificate-upload-column {
      max-width: 620px;
    }
  }

  @media (max-width: 920px) {
    .certificates-container {
      width: min(100% - 28px, 760px);
      padding-top: 26px;
    }

    .certificates-header,
    .certificate-library-header,
    .certificate-workspace-heading {
      align-items: stretch;
      flex-direction: column;
    }

    .certificates-header-actions {
      justify-content: flex-start;
    }

    .certificate-library-tools {
      width: 100%;
      justify-content: stretch;
    }

    .certificate-search {
      flex: 1 1 auto;
      width: auto;
    }

    .certificate-library-tools select {
      flex: 0 1 145px;
    }

    .certificate-library-count-badge {
      align-self: flex-start;
    }
  }

  @media (max-width: 700px) {
    .certificates-container {
      width: min(100% - 20px, 620px);
      padding: 20px 0 46px;
    }

    .certificates-header h1 {
      font-size: 34px;
    }

    .certificates-header p {
      font-size: 12px;
    }

    .certificates-header-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      width: 100%;
    }

    .certificate-secondary-btn {
      width: 100%;
    }

    .certificate-stat-grid {
      grid-template-columns: 1fr;
    }

    .certificate-workspace,
    .certificate-library {
      padding: 17px;
      border-radius: 14px;
    }

    .certificate-workspace-heading {
      gap: 14px;
    }

    .certificate-form-layout,
    .certificate-two-column {
      grid-template-columns: 1fr;
    }

    .certificate-upload-column {
      max-width: none;
    }

    .certificate-dropzone,
    .selected-file-card {
      min-height: 220px;
    }

    .certificate-form-footer {
      align-items: stretch;
      flex-direction: column;
    }

    .form-footer-note {
      align-items: flex-start;
    }

    .certificate-form-actions {
      width: 100%;
    }

    .certificate-cancel-btn,
    .certificate-upload-btn {
      flex: 1;
      width: 100%;
    }

    .certificate-library-tools {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .certificate-search {
      width: auto;
      grid-column: 1 / -1;
    }

    .certificate-library-tools select,
    .certificate-save-order-btn {
      width: 100%;
      min-width: 0;
      flex: none;
    }

    .certificate-table-wrap {
      overflow: visible;
      border: 0;
      background: transparent;
    }

    .certificate-table-head {
      display: none;
    }

    .certificate-table-body {
      display: grid;
      gap: 10px;
    }

    .certificate-row {
      min-width: 0;
      min-height: 0;
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr);
      grid-template-areas:
        "order title"
        "order issuer"
        "order category"
        "order completion"
        "order actions";
      gap: 0 10px;
      padding: 13px;
      border: 1px solid #202c37;
      border-radius: 12px;
      background: #0a1117;
    }

    .certificate-row:hover {
      background: #0d161e;
    }

    .certificate-row-drag-over {
      box-shadow: inset 0 2px 0 #5eead4, inset 0 -2px 0 #5eead4;
    }

    .certificate-order-number {
      grid-area: order;
      align-items: flex-start;
      padding-top: 2px;
    }

    .certificate-order-number span {
      width: 32px;
      height: 32px;
    }

    .certificate-row-title {
      grid-area: title;
      padding: 0;
      gap: 8px;
    }

    .certificate-row-drag-handle {
      width: 27px;
      height: 32px;
      flex-basis: 27px;
    }

    .certificate-row-document {
      width: 38px;
      height: 38px;
      flex-basis: 38px;
    }

    .certificate-row-issuer {
      grid-area: issuer;
      padding: 6px 0 0 73px;
      font-size: 10px;
    }

    .certificate-row-category-cell {
      grid-area: category;
      padding: 8px 0 0 73px;
    }

    .certificate-row-date {
      grid-area: completion;
      padding: 8px 0 0 73px;
      font-size: 9px;
    }

    .certificate-row-actions {
      grid-area: actions;
      min-height: 36px;
      justify-content: stretch;
      margin-top: 11px;
      padding: 11px 0 0 73px;
      border-top: 1px solid #1d2731;
      border-left: 0;
    }

    .certificate-row-actions > a,
    .certificate-row-actions > button {
      width: 100% !important;
      min-width: 0 !important;
      max-width: none !important;
      flex: 1 1 0 !important;
      height: 36px !important;
      min-height: 36px !important;
      max-height: 36px !important;
    }

    .certificate-mobile-order-controls {
      display: flex;
      flex: 0 0 auto;
      gap: 5px;
      margin-right: 1px;
    }

    .certificate-mobile-order-controls button {
      width: 34px;
      height: 36px;
      display: grid;
      place-items: center;
      border: 1px solid #293743;
      border-radius: 8px;
      background: #101820;
      color: #8ea0ae;
      font: inherit;
      font-size: 13px;
      font-weight: 850;
      cursor: pointer;
    }

    .certificate-mobile-order-controls button:hover:not(:disabled) {
      border-color: rgba(94, 234, 212, 0.4);
      color: #5eead4;
    }

    .certificate-mobile-order-controls button:disabled {
      cursor: not-allowed;
      opacity: 0.35;
    }

    .certificates-page-footer {
      align-items: flex-start;
    }
  }

  @media (max-width: 480px) {
    .certificates-container {
      width: calc(100% - 14px);
    }

    .certificates-header h1 {
      font-size: 30px;
    }

    .certificates-header-actions {
      grid-template-columns: 1fr;
    }

    .certificate-workspace,
    .certificate-library {
      padding: 14px;
    }

    .certificate-form-actions {
      flex-direction: column;
    }

    .certificate-cancel-btn,
    .certificate-upload-btn {
      min-height: 40px;
    }

    .certificate-library-tools {
      grid-template-columns: 1fr;
    }

    .certificate-search {
      grid-column: auto;
    }

    .certificate-row {
      grid-template-columns: 38px minmax(0, 1fr);
      padding: 11px;
    }

    .certificate-row-issuer,
    .certificate-row-category-cell,
    .certificate-row-date,
    .certificate-row-actions {
      padding-left: 66px;
    }

    .certificate-row-actions {
      flex-wrap: wrap;
    }

    .certificate-row-actions > a,
    .certificate-row-actions > button {
      flex: 1 1 calc(33.333% - 4px) !important;
    }

    .certificate-mobile-order-controls {
      width: 100%;
      order: -1;
      margin: 0 0 6px;
    }

    .certificate-mobile-order-controls button {
      flex: 1;
    }

    .certificates-page-footer .footer-count {
      display: none;
    }
  }
`;

export default AdminCertificatesPage;
