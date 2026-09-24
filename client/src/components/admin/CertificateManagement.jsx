import "./CertificateManagement.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchCertificates,
  uploadCertificate,
  updateCertificate,
  deleteCertificate,
  reorderCertificates,
} from "../../api/api.js";

const EMPTY_FORM = {
  title: "",
  issuer: "",
  certificateId: "",
  category: "Certification",
  completionDate: "",
  description: "",
  file: null,
  isActive: true,
};

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const normalizeCertificate = (certificate, index = 0) => ({
  _id: certificate?._id || "",
  title: certificate?.title || "",
  issuer: certificate?.issuer || "",
  certificateId: certificate?.certificateId || "",
  category: certificate?.category || "Certification",
  completionDate: certificate?.completionDate || "",
  description: certificate?.description || "",
  fileUrl:
    certificate?.fileUrl ||
    certificate?.url ||
    certificate?.certificateUrl ||
    "",
  originalName:
    certificate?.originalName ||
    certificate?.fileName ||
    certificate?.filename ||
    "",
  mimeType: certificate?.mimeType || "",
  fileSize: Number(certificate?.fileSize || 0),
  isActive: certificate?.isActive !== false,
  order: Number.isFinite(Number(certificate?.order))
    ? Number(certificate.order)
    : index,
  createdAt: certificate?.createdAt || null,
  updatedAt: certificate?.updatedAt || null,
});

const sortCertificates = (items) =>
  [...items].sort((a, b) => {
    const orderDifference = Number(a.order || 0) - Number(b.order || 0);

    if (orderDifference !== 0) {
      return orderDifference;
    }

    return (
      new Date(a.createdAt || 0).getTime() -
      new Date(b.createdAt || 0).getTime()
    );
  });

function CertificateManagement() {
  const token = localStorage.getItem("adminToken");

  const fileInputRef = useRef(null);

  const [certificates, setCertificates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    ...EMPTY_FORM,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [draggedId, setDraggedId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const activeCount = useMemo(
    () =>
      certificates.filter((certificate) => certificate.isActive !== false)
        .length,
    [certificates],
  );

  const disabledCount = certificates.length - activeCount;

  const handleAuthError = (err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    }
  };

  const loadCertificates = useCallback(async ({ refresh = false } = {}) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const data = await fetchCertificates();

      const loaded = Array.isArray(data)
        ? data.map(normalizeCertificate)
        : Array.isArray(data?.certificates)
          ? data.certificates.map(normalizeCertificate)
          : [];

      setCertificates(sortCertificates(loaded));
    } catch (err) {
      handleAuthError(err);

      setError(err?.response?.data?.message || "Failed to load certificates.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCertificates();
  }, [loadCertificates]);

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
    });

    setEditingId(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleChange = (event) => {
    const { name, value, files, checked, type } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : name === "file"
            ? files?.[0] || null
            : value,
    }));
  };

  const validateFile = (file) => {
    if (!file) {
      return "";
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Only PDF, JPG, JPEG, PNG and WEBP files are allowed.";
    }

    if (file.size > MAX_FILE_SIZE) {
      return "Certificate file must be 10 MB or smaller.";
    }

    return "";
  };

  const handleAdd = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      return setError("Certificate title is required.");
    }

    if (!form.issuer.trim()) {
      return setError("Issuer is required.");
    }

    if (!form.file) {
      return setError("Please select a certificate file.");
    }

    const fileError = validateFile(form.file);

    if (fileError) {
      return setError(fileError);
    }

    if (!token) {
      return setError("Admin authentication token is missing.");
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title.trim());

      formData.append("issuer", form.issuer.trim());

      formData.append("certificateId", form.certificateId.trim());

      formData.append("category", form.category.trim() || "Certification");

      formData.append("completionDate", form.completionDate.trim());

      formData.append("description", form.description.trim());

      formData.append("isActive", String(form.isActive !== false));

      formData.append("certificate", form.file);

      const response = await uploadCertificate(formData, token);

      const created = response?.certificate || response?.data?.certificate;

      if (created) {
        setCertificates((current) =>
          sortCertificates([...current, normalizeCertificate(created)]),
        );
      } else {
        await loadCertificates({
          refresh: true,
        });
      }

      resetForm();

      setSuccess("Certificate added successfully.");
    } catch (err) {
      handleAuthError(err);

      setError(err?.response?.data?.message || "Failed to add certificate.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (certificate) => {
    if (!certificate?._id) {
      return setError("This certificate does not have a valid database ID.");
    }

    setError("");
    setSuccess("");

    setEditingId(certificate._id);

    setForm({
      title: certificate.title || "",
      issuer: certificate.issuer || "",
      certificateId: certificate.certificateId || "",
      category: certificate.category || "Certification",
      completionDate: certificate.completionDate || "",
      description: certificate.description || "",
      file: null,
      isActive: certificate.isActive !== false,
    });
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    if (!editingId) {
      return;
    }

    setError("");
    setSuccess("");

    if (!form.title.trim()) {
      return setError("Certificate title is required.");
    }

    if (!form.issuer.trim()) {
      return setError("Issuer is required.");
    }

    const fileError = validateFile(form.file);

    if (fileError) {
      return setError(fileError);
    }

    if (!token) {
      return setError("Admin authentication token is missing.");
    }

    try {
      setSaving(true);

      const formData = new FormData();

      formData.append("title", form.title.trim());

      formData.append("issuer", form.issuer.trim());

      formData.append("certificateId", form.certificateId.trim());

      formData.append("category", form.category.trim() || "Certification");

      formData.append("completionDate", form.completionDate.trim());

      formData.append("description", form.description.trim());

      formData.append("isActive", String(form.isActive !== false));

      if (form.file) {
        formData.append("certificate", form.file);
      }

      const response = await updateCertificate(editingId, formData, token);

      const updated = response?.certificate || response?.data?.certificate;

      if (updated) {
        setCertificates((current) =>
          sortCertificates(
            current.map((certificate) =>
              String(certificate._id) === String(editingId)
                ? normalizeCertificate(updated)
                : certificate,
            ),
          ),
        );
      } else {
        await loadCertificates({
          refresh: true,
        });
      }

      resetForm();

      setSuccess("Certificate updated successfully.");
    } catch (err) {
      handleAuthError(err);

      setError(err?.response?.data?.message || "Failed to update certificate.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (certificate) => {
    if (!certificate?._id) {
      return setError("This certificate does not have a valid database ID.");
    }

    if (!token) {
      return setError("Admin authentication token is missing.");
    }

    const nextStatus = certificate.isActive === false;

    try {
      setActionId(`toggle-${certificate._id}`);

      setError("");
      setSuccess("");

      const formData = new FormData();

      formData.append("title", certificate.title || "");

      formData.append("issuer", certificate.issuer || "");

      formData.append("certificateId", certificate.certificateId || "");

      formData.append("category", certificate.category || "Certification");

      formData.append("completionDate", certificate.completionDate || "");

      formData.append("description", certificate.description || "");

      formData.append("isActive", String(nextStatus));

      formData.append("order", String(Number(certificate.order || 0)));

      const response = await updateCertificate(
        certificate._id,
        formData,
        token,
      );

      const updated = response?.certificate || response?.data?.certificate;

      setCertificates((current) =>
        current.map((item) =>
          String(item._id) === String(certificate._id)
            ? updated
              ? normalizeCertificate(updated)
              : {
                  ...item,
                  isActive: nextStatus,
                }
            : item,
        ),
      );

      setSuccess(
        nextStatus
          ? "Certificate enabled successfully."
          : "Certificate disabled successfully.",
      );
    } catch (err) {
      handleAuthError(err);

      setError(
        err?.response?.data?.message || "Failed to change certificate status.",
      );
    } finally {
      setActionId("");
    }
  };

  const handleDelete = async (certificate) => {
    if (!certificate?._id) {
      return setError("This certificate does not have a valid database ID.");
    }

    if (!token) {
      return setError("Admin authentication token is missing.");
    }

    const confirmed = window.confirm(
      `"${certificate.title || "This certificate"}" will be removed from the certificate list.\n\nContinue?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(`delete-${certificate._id}`);

      setError("");
      setSuccess("");

      await deleteCertificate(certificate._id, token);

      setCertificates((current) =>
        current.filter((item) => String(item._id) !== String(certificate._id)),
      );

      if (String(editingId) === String(certificate._id)) {
        resetForm();
      }

      setSuccess("Certificate deleted successfully.");
    } catch (err) {
      handleAuthError(err);

      setError(err?.response?.data?.message || "Failed to delete certificate.");
    } finally {
      setActionId("");
    }
  };

  const handlePermanentDelete = () => {
    setError(
      "Permanent Delete का backend endpoint अभी project में मौजूद/verified नहीं है. पहले backend में permanent-delete API जोड़ेंगे, फिर यह button वास्तविक MongoDB deletion करेगा.",
    );
  };

  const getPreviewUrl = (certificate) => {
    if (!certificate) {
      return "";
    }

    if (certificate.fileUrl) {
      if (/^https?:\/\//i.test(certificate.fileUrl)) {
        return certificate.fileUrl;
      }

      if (certificate.fileUrl.startsWith("/")) {
        return certificate.fileUrl;
      }

      return `http://localhost:5000/${certificate.fileUrl}`;
    }

    return certificate._id
      ? `http://localhost:5000/api/certificates/${certificate._id}/file`
      : "";
  };

  const handlePreview = (certificate) => {
    const url = getPreviewUrl(certificate);

    if (!url) {
      return setError("Certificate preview file URL is not available.");
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  const persistOrder = async (items) => {
    if (!token) {
      setError("Admin authentication token is missing.");
      return;
    }

    if (!items.length) {
      return;
    }

    try {
      setSaving(true);

      setError("");
      setSuccess("");

      const orderedIds = items
        .map((certificate) => certificate._id)
        .filter(Boolean);

      const response = await reorderCertificates(orderedIds, token);

      const updated = Array.isArray(response?.certificates)
        ? response.certificates
        : Array.isArray(response)
          ? response
          : null;

      setCertificates(
        updated
          ? sortCertificates(updated.map(normalizeCertificate))
          : items.map((certificate, index) => ({
              ...certificate,
              order: index,
            })),
      );

      setSuccess("Certificate order saved successfully.");
    } catch (err) {
      handleAuthError(err);

      setError(
        err?.response?.data?.message || "Failed to save certificate order.",
      );

      await loadCertificates({
        refresh: true,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDragStart = (event, certificateId) => {
    setDraggedId(certificateId);

    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData("text/plain", certificateId);
  };

  const handleDragOver = (event, certificateId) => {
    event.preventDefault();

    if (draggedId && String(draggedId) !== String(certificateId)) {
      setDragOverId(certificateId);
    }
  };

  const handleDrop = async (event, targetId) => {
    event.preventDefault();

    const sourceId = draggedId || event.dataTransfer.getData("text/plain");

    setDragOverId(null);

    if (!sourceId || String(sourceId) === String(targetId)) {
      setDraggedId(null);
      return;
    }

    const reordered = [...certificates];

    const sourceIndex = reordered.findIndex(
      (item) => String(item._id) === String(sourceId),
    );

    const targetIndex = reordered.findIndex(
      (item) => String(item._id) === String(targetId),
    );

    if (sourceIndex < 0 || targetIndex < 0) {
      setDraggedId(null);
      return;
    }

    const [moved] = reordered.splice(sourceIndex, 1);

    reordered.splice(targetIndex, 0, moved);

    await persistOrder(reordered);

    setDraggedId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleRefresh = async () => {
    setSuccess("");

    await loadCertificates({
      refresh: true,
    });
  };

  if (loading) {
    return (
      <section className="certificate-management">
        <div className="certificate-management-loading">
          <div className="certificate-spinner" />
          <p>Loading certificates...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="certificate-management">
      <div className="certificate-management-header">
        <div>
          <span className="certificate-eyebrow">PORTFOLIO CMS</span>

          <h2>Certificate Management</h2>

          <p>
            Add, edit, preview, enable, disable, delete and reorder your
            certificates.
          </p>
        </div>

        <button
          type="button"
          className="certificate-refresh-button"
          onClick={handleRefresh}
          disabled={refreshing || saving || Boolean(actionId)}
        >
          {refreshing ? "Refreshing..." : "↻ Refresh"}
        </button>
      </div>

      <div className="certificate-control-banner">
        <strong>Backend Controlled</strong>

        <span>
          Certificate records and display order are controlled from MongoDB.
        </span>
      </div>

      {error && (
        <div className="certificate-alert certificate-alert-error">{error}</div>
      )}

      {success && (
        <div className="certificate-alert certificate-alert-success">
          {success}
        </div>
      )}

      <div className="certificate-summary-grid">
        <div className="certificate-summary-card">
          <span>Total</span>
          <strong>{certificates.length}</strong>
        </div>

        <div className="certificate-summary-card">
          <span>Active</span>
          <strong>{activeCount}</strong>
        </div>

        <div className="certificate-summary-card">
          <span>Disabled</span>
          <strong>{disabledCount}</strong>
        </div>
      </div>

      <div className="certificate-section-card">
        <div className="certificate-section-heading">
          <div>
            <span className="certificate-section-eyebrow">
              {editingId ? "EDIT CERTIFICATE" : "ADD CERTIFICATE"}
            </span>

            <h3>{editingId ? "Update Certificate" : "Add New Certificate"}</h3>
          </div>

          {editingId && (
            <button
              type="button"
              className="certificate-secondary-button"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form
          className="certificate-form"
          onSubmit={editingId ? handleUpdate : handleAdd}
        >
          <div className="certificate-form-grid">
            <label>
              <span>Certificate Title *</span>

              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Internship Completion Certificate"
                disabled={saving}
              />
            </label>

            <label>
              <span>Issuer *</span>

              <input
                name="issuer"
                value={form.issuer}
                onChange={handleChange}
                placeholder="e.g. InternPe Online"
                disabled={saving}
              />
            </label>

            <label>
              <span>Certificate ID</span>

              <input
                name="certificateId"
                value={form.certificateId}
                onChange={handleChange}
                placeholder="e.g. IP#75118"
                disabled={saving}
              />
            </label>

            <label>
              <span>Category</span>

              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Certification"
                disabled={saving}
              />
            </label>

            <label>
              <span>Completion Date</span>

              <input
                name="completionDate"
                value={form.completionDate}
                onChange={handleChange}
                placeholder="e.g. 07 June 2026"
                disabled={saving}
              />
            </label>

            <label className="certificate-file-field">
              <span>Certificate File {editingId ? "(optional)" : "*"}</span>

              <input
                ref={fileInputRef}
                type="file"
                name="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                onChange={handleChange}
                disabled={saving}
              />

              <small>PDF, JPG, JPEG, PNG or WEBP — maximum 10 MB.</small>

              {editingId && (
                <small>
                  Leave empty to keep the existing certificate file.
                </small>
              )}
            </label>
          </div>

          <label className="certificate-description-field">
            <span>Description</span>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Short description of the certificate or program."
              rows={5}
              disabled={saving}
            />
          </label>

          <label className="certificate-active-toggle">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive !== false}
              onChange={handleChange}
              disabled={saving}
            />

            <span>
              <strong>Publicly Active</strong>

              <small>
                Active certificates are displayed on the public portfolio.
              </small>
            </span>
          </label>

          <div className="certificate-form-actions">
            <button
              type="submit"
              className="certificate-primary-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Certificate"
                  : "Add Certificate"}
            </button>

            {editingId && (
              <button
                type="button"
                className="certificate-secondary-button"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="certificate-section-card">
        <div className="certificate-section-heading">
          <div>
            <span className="certificate-section-eyebrow">
              EXISTING CERTIFICATES
            </span>

            <h3>Certificate Library</h3>

            <p>Hold and drag a certificate to change its order.</p>
          </div>

          <span className="certificate-count-badge">
            {certificates.length}{" "}
            {certificates.length === 1 ? "Certificate" : "Certificates"}
          </span>
        </div>

        {certificates.length === 0 ? (
          <div className="certificate-empty-state">
            <strong>No certificates found</strong>

            <p>Add your first certificate using the form above.</p>
          </div>
        ) : (
          <div className="certificate-list">
            {certificates.map((certificate, index) => {
              const isDisabled = certificate.isActive === false;

              const isBusy =
                actionId === `toggle-${certificate._id}` ||
                actionId === `delete-${certificate._id}`;

              return (
                <article
                  key={certificate._id || `certificate-${index}`}
                  className={[
                    "certificate-item",

                    isDisabled ? "certificate-item-disabled" : "",

                    String(dragOverId) === String(certificate._id)
                      ? "certificate-item-drag-over"
                      : "",

                    String(draggedId) === String(certificate._id)
                      ? "certificate-item-dragging"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  draggable={!saving && !isBusy}
                  onDragStart={(event) =>
                    handleDragStart(event, certificate._id)
                  }
                  onDragOver={(event) => handleDragOver(event, certificate._id)}
                  onDrop={(event) => handleDrop(event, certificate._id)}
                  onDragEnd={handleDragEnd}
                >
                  <div
                    className="certificate-drag-handle"
                    title="Hold and drag to change order"
                    aria-label="Hold and drag to change order"
                  >
                    ⋮⋮
                  </div>

                  <div className="certificate-file-preview">
                    <div className="certificate-file-icon">
                      {certificate.mimeType === "application/pdf"
                        ? "PDF"
                        : "IMG"}
                    </div>
                  </div>

                  <div className="certificate-details">
                    <div className="certificate-title-row">
                      <h4>{certificate.title || "Untitled Certificate"}</h4>

                      <span
                        className={
                          isDisabled
                            ? "certificate-status certificate-status-disabled"
                            : "certificate-status certificate-status-active"
                        }
                      >
                        {isDisabled ? "DISABLED" : "ACTIVE"}
                      </span>
                    </div>

                    <p className="certificate-issuer">
                      {certificate.issuer || "Issuer not specified"}
                    </p>

                    <div className="certificate-meta">
                      {certificate.certificateId && (
                        <span>ID: {certificate.certificateId}</span>
                      )}

                      {certificate.category && (
                        <span>{certificate.category}</span>
                      )}

                      {certificate.completionDate && (
                        <span>{certificate.completionDate}</span>
                      )}
                    </div>

                    {certificate._id && (
                      <button
                        type="button"
                        className="certificate-mongodb-id"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              String(certificate._id),
                            );

                            setSuccess("MongoDB ID copied.");
                          } catch {
                            setError("Could not copy MongoDB ID.");
                          }
                        }}
                        title="Copy MongoDB ID"
                      >
                        MongoDB: {certificate._id}
                      </button>
                    )}
                  </div>

                  <div className="certificate-actions">
                    <button
                      type="button"
                      className="certificate-action-button certificate-action-preview"
                      onClick={() => handlePreview(certificate)}
                      disabled={isBusy}
                    >
                      Preview
                    </button>

                    <button
                      type="button"
                      className="certificate-action-button certificate-action-edit"
                      onClick={() => handleEdit(certificate)}
                      disabled={isBusy}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      className="certificate-action-button certificate-action-toggle"
                      onClick={() => handleToggle(certificate)}
                      disabled={isBusy || saving}
                    >
                      {isBusy
                        ? "Working..."
                        : isDisabled
                          ? "Enable"
                          : "Disable"}
                    </button>

                    <button
                      type="button"
                      className="certificate-action-button certificate-action-delete"
                      onClick={() => handleDelete(certificate)}
                      disabled={isBusy || saving}
                    >
                      Delete
                    </button>

                    <button
                      type="button"
                      className="certificate-action-button certificate-action-permanent"
                      onClick={handlePermanentDelete}
                      disabled={isBusy || saving}
                      title="Backend permanent-delete endpoint must be added first"
                    >
                      Permanent Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <div className="certificate-management-footer">
        <span>
          {activeCount} active · {disabledCount} disabled
        </span>

        <button
          type="button"
          className="certificate-secondary-button"
          onClick={handleRefresh}
          disabled={refreshing || saving}
        >
          {refreshing ? "Refreshing..." : "Refresh Certificates"}
        </button>
      </div>
    </section>
  );
}

export default CertificateManagement;
