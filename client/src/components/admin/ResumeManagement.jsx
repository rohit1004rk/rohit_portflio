import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  deleteResume,
  fetchCurrentResume,
  fetchResumeHistory,
  getResumeFileUrl,
  setCurrentResume,
  uploadResume,
} from "../../api/api.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp";

const formatFileSize = (bytes) => {
  if (!bytes) return "Unknown size";

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getFileTypeLabel = (fileOrResume) => {
  const mime = fileOrResume?.type || fileOrResume?.mimeType || "";

  if (mime === "application/pdf") return "PDF";
  if (mime === "image/jpeg") return "JPG";
  if (mime === "image/png") return "PNG";
  if (mime === "image/webp") return "WEBP";

  const name = fileOrResume?.name || fileOrResume?.originalName || "";

  const extension = name.split(".").pop()?.toUpperCase();

  return extension || "FILE";
};

const isImageFile = (fileOrResume) => {
  const mime = fileOrResume?.type || fileOrResume?.mimeType || "";

  return mime.startsWith("image/");
};

function ResumeManagement() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const token = localStorage.getItem("adminToken");

  const [currentResume, setCurrentResumeState] = useState(null);
  const [resumes, setResumes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [actionId, setActionId] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState("");

  const [title, setTitle] = useState("Resume");
  const [setAsCurrent, setSetAsCurrent] = useState(true);

  const [previewResume, setPreviewResume] = useState(null);

  const handleAuthFailure = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  const loadResumes = async () => {
    if (!token) {
      handleAuthFailure();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [currentResponse, historyResponse] = await Promise.all([
        fetchCurrentResume().catch(() => null),
        fetchResumeHistory(token),
      ]);

      setCurrentResumeState(currentResponse || null);

      setResumes(
        Array.isArray(historyResponse)
          ? historyResponse
          : Array.isArray(historyResponse?.resumes)
            ? historyResponse.resumes
            : [],
      );
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleAuthFailure();
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load resume information.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }
    };
  }, [selectedPreviewUrl]);

  const sortedResumes = useMemo(() => {
    return [...resumes].sort((a, b) => {
      if (Boolean(a.isCurrent) !== Boolean(b.isCurrent)) {
        return a.isCurrent ? -1 : 1;
      }

      return Number(b.version || 0) - Number(a.version || 0);
    });
  }, [resumes]);

  const current =
    currentResume || sortedResumes.find((resume) => resume.isCurrent);

  const totalViews = sortedResumes.reduce(
    (sum, resume) => sum + Number(resume.viewCount || 0),
    0,
  );

  const totalDownloads = sortedResumes.reduce(
    (sum, resume) => sum + Number(resume.downloadCount || 0),
    0,
  );

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      setSelectedPreviewUrl("");
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      event.target.value = "";
      setSelectedFile(null);
      setSelectedPreviewUrl("");

      setError("Supported formats: PDF, JPG, JPEG, PNG and WEBP.");

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      event.target.value = "";
      setSelectedFile(null);
      setSelectedPreviewUrl("");

      setError("Resume file must be 10 MB or smaller.");

      return;
    }

    if (selectedPreviewUrl) {
      URL.revokeObjectURL(selectedPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedFile(file);
    setSelectedPreviewUrl(previewUrl);

    if (title === "Resume") {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();

      if (cleanName) {
        setTitle(cleanName);
      }
    }
  };

  const handleRemoveSelectedFile = () => {
    if (selectedPreviewUrl) {
      URL.revokeObjectURL(selectedPreviewUrl);
    }

    setSelectedFile(null);
    setSelectedPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!token) {
      handleAuthFailure();
      return;
    }

    setError("");
    setSuccess("");

    if (!selectedFile) {
      setError("Please select a resume file first.");
      return;
    }

    try {
      setUploading(true);

      await uploadResume({
        file: selectedFile,
        title: title.trim() || "Resume",
        setCurrent: setAsCurrent,
        token,
      });

      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }

      setSelectedFile(null);
      setSelectedPreviewUrl("");
      setTitle("Resume");
      setSetAsCurrent(true);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccess(
        setAsCurrent
          ? "Resume uploaded and set as current successfully."
          : "Resume uploaded and saved as an archived version.",
      );

      await loadResumes();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleAuthFailure();
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to upload resume.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSetCurrent = async (id) => {
    if (!token) {
      handleAuthFailure();
      return;
    }

    try {
      setActionId(id);
      setError("");
      setSuccess("");

      await setCurrentResume(id, token);

      setSuccess("Current resume updated successfully.");

      await loadResumes();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleAuthFailure();
        return;
      }

      setError(
        err?.response?.data?.message || "Failed to update current resume.",
      );
    } finally {
      setActionId("");
    }
  };

  const handleDelete = async (resume) => {
    if (!token) {
      handleAuthFailure();
      return;
    }

    if (resume.isCurrent) {
      setError(
        "Current resume cannot be deleted. Set another version as current first.",
      );
      return;
    }

    const confirmed = window.confirm(
      `Delete "${resume.originalName || "this resume"}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      setActionId(resume._id);
      setError("");
      setSuccess("");

      await deleteResume(resume._id, token);

      setSuccess("Resume version deleted successfully.");

      await loadResumes();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleAuthFailure();
        return;
      }

      setError(err?.response?.data?.message || "Failed to delete resume.");
    } finally {
      setActionId("");
    }
  };

  const openPreview = (resume) => {
    setPreviewResume(resume);
  };

  const closePreview = () => {
    setPreviewResume(null);
  };

  if (loading) {
    return (
      <section className="resume-manager">
        <style>{resumeStyles}</style>

        <div className="resume-loading">
          <div className="resume-loading-spinner" />

          <div>
            <strong>Loading Resume Management</strong>

            <span>Fetching current resume and version history...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="resume-manager">
      <style>{resumeStyles}</style>

      {/* HEADER */}
      <div className="resume-page-header">
        <div className="resume-title-group">
          <div className="resume-title-icon">▣</div>

          <div>
            <span className="resume-kicker">DOCUMENT MANAGEMENT</span>

            <h2>Resume Management</h2>

            <p>
              Manage your current resume, previous versions and new uploads from
              one place.
            </p>
          </div>
        </div>

        <div className="resume-format-info">
          <div className="format-title">
            <span>✓</span>
            Supported Formats
          </div>

          <strong>PDF · JPG · PNG · WEBP</strong>

          <small>Maximum file size: 10 MB</small>
        </div>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="resume-alert error">
          <span>!</span>

          <div>
            <strong>Action failed</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="resume-alert success">
          <span>✓</span>

          <div>
            <strong>Success</strong>
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* CURRENT RESUME */}
      <div className="resume-main-grid">
        <article className="current-resume-card">
          <div className="card-header">
            <div>
              <span className="section-label">CURRENT</span>

              <h3>Current Resume</h3>

              <p>This is the resume currently used by your portfolio.</p>
            </div>

            {current && (
              <span className="current-badge">
                <i />
                Active
              </span>
            )}
          </div>

          {current ? (
            <div className="current-resume-body">
              <div
                className={`file-preview-icon ${
                  isImageFile(current) ? "image" : "pdf"
                }`}
              >
                {getFileTypeLabel(current)}
              </div>

              <div className="current-file-details">
                <h4 title={current.originalName}>
                  {current.originalName || "Current Resume"}
                </h4>

                <span className="resume-file-title">
                  {current.title || "Portfolio Resume"}
                </span>

                <div className="file-meta">
                  <span>Version {current.version || 1}</span>

                  <span>{formatFileSize(current.fileSize)}</span>

                  <span>Updated {formatDate(current.uploadedAt)}</span>
                </div>

                <div className="current-actions">
                  <button
                    type="button"
                    className="resume-action primary"
                    onClick={() => openPreview(current)}
                  >
                    <span>◉</span>
                    View Resume
                  </button>

                  <a
                    className="resume-action secondary"
                    href={getResumeFileUrl(current._id)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>↗</span>
                    Open
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-current-resume">
              <div className="empty-file-icon">PDF</div>

              <h4>No Current Resume</h4>

              <p>
                Upload a resume below to make it available on your portfolio.
              </p>
            </div>
          )}
        </article>

        {/* STATS */}
        <div className="resume-stat-grid">
          <div className="resume-stat-card">
            <span className="stat-icon blue">▤</span>

            <strong>{sortedResumes.length}</strong>

            <small>Versions</small>
          </div>

          <div className="resume-stat-card">
            <span className="stat-icon green">◉</span>

            <strong>{totalViews}</strong>

            <small>Total Views</small>
          </div>

          <div className="resume-stat-card">
            <span className="stat-icon purple">↓</span>

            <strong>{totalDownloads}</strong>

            <small>Downloads</small>
          </div>

          <div className="resume-stat-card">
            <span className="stat-icon orange">✓</span>

            <strong>{current ? "Live" : "None"}</strong>

            <small>Status</small>
          </div>
        </div>
      </div>

      {/* VERSION HISTORY */}
      <article className="resume-section-card">
        <div className="section-card-header">
          <div>
            <span className="section-label">HISTORY</span>

            <h3>Previous Resume Versions</h3>

            <p>
              Older uploads are preserved here and can be viewed or restored.
            </p>
          </div>

          <span className="version-count">
            {sortedResumes.length}{" "}
            {sortedResumes.length === 1 ? "version" : "versions"}
          </span>
        </div>

        {sortedResumes.length === 0 ? (
          <div className="empty-history">
            <div className="empty-history-icon">PDF</div>

            <strong>No resume versions yet</strong>

            <span>Upload your first resume below.</span>
          </div>
        ) : (
          <div className="resume-version-list">
            {sortedResumes.map((resume) => (
              <div
                className={`resume-version-row ${
                  resume.isCurrent ? "is-current" : ""
                }`}
                key={resume._id}
              >
                <div
                  className={`version-file-icon ${
                    isImageFile(resume) ? "image" : "pdf"
                  }`}
                >
                  {getFileTypeLabel(resume)}
                </div>

                <div className="version-main">
                  <div className="version-name-line">
                    <strong title={resume.originalName}>
                      {resume.originalName || "Resume"}
                    </strong>

                    {resume.isCurrent && (
                      <span className="mini-current">Current</span>
                    )}
                  </div>

                  <span>{resume.title || "Portfolio Resume"}</span>
                </div>

                <div className="version-meta">
                  <strong>v{resume.version || 1}</strong>

                  <span>{formatDate(resume.uploadedAt)}</span>
                </div>

                <div className="version-counts">
                  <span>
                    <b>{Number(resume.viewCount || 0)}</b>
                    Views
                  </span>

                  <span>
                    <b>{Number(resume.downloadCount || 0)}</b>
                    Downloads
                  </span>
                </div>

                <div className="version-actions">
                  <button
                    type="button"
                    className="small-action view"
                    onClick={() => openPreview(resume)}
                  >
                    View
                  </button>

                  {!resume.isCurrent && (
                    <button
                      type="button"
                      className="small-action current"
                      disabled={actionId === resume._id}
                      onClick={() => handleSetCurrent(resume._id)}
                    >
                      {actionId === resume._id ? "..." : "Set Current"}
                    </button>
                  )}

                  {!resume.isCurrent && (
                    <button
                      type="button"
                      className="small-action delete"
                      disabled={actionId === resume._id}
                      onClick={() => handleDelete(resume)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* UPLOAD */}
      <article className="resume-section-card upload-card">
        <div className="section-card-header">
          <div>
            <span className="section-label">NEW VERSION</span>

            <h3>Upload New Resume</h3>

            <p>
              Upload a new PDF or image resume and optionally make it live
              immediately.
            </p>
          </div>

          <div className="upload-icon">↑</div>
        </div>

        <form className="resume-upload-form" onSubmit={handleUpload}>
          <div className="upload-layout">
            {/* FILE */}
            <div className="upload-file-column">
              <label className="form-label">Resume File</label>

              {!selectedFile ? (
                <label className="resume-dropzone" htmlFor="resume-file-input">
                  <input
                    ref={fileInputRef}
                    id="resume-file-input"
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    onChange={handleFileChange}
                  />

                  <div className="drop-icon">↑</div>

                  <strong>Choose Resume File</strong>

                  <span>PDF, JPG, PNG or WEBP</span>

                  <small>Maximum 10 MB</small>
                </label>
              ) : (
                <div className="selected-file">
                  <div
                    className={`selected-file-icon ${
                      isImageFile(selectedFile) ? "image" : "pdf"
                    }`}
                  >
                    {getFileTypeLabel(selectedFile)}
                  </div>

                  <div className="selected-file-info">
                    <strong title={selectedFile.name}>
                      {selectedFile.name}
                    </strong>

                    <span>{formatFileSize(selectedFile.size)}</span>
                  </div>

                  <button
                    type="button"
                    className="remove-file"
                    onClick={handleRemoveSelectedFile}
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* TITLE */}
            <div className="upload-details-column">
              <div className="form-field">
                <label className="form-label" htmlFor="resume-title">
                  Resume Title
                  <span>Optional</span>
                </label>

                <input
                  id="resume-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Rohit Kumar Resume"
                  maxLength={200}
                />

                <small>Use a clear name to identify this resume version.</small>
              </div>

              <label className="current-toggle">
                <input
                  type="checkbox"
                  checked={setAsCurrent}
                  onChange={(event) => setSetAsCurrent(event.target.checked)}
                />

                <span className="toggle-box">{setAsCurrent ? "✓" : ""}</span>

                <span>
                  <strong>Set as current resume</strong>

                  <small>
                    Replace the resume currently used by the portfolio.
                  </small>
                </span>
              </label>
            </div>
          </div>

          <div className="upload-footer">
            <div className="upload-security">
              <span>✓</span>

              <div>
                <strong>Existing versions are preserved</strong>

                <small>
                  Uploading a new resume will not delete your previous versions.
                </small>
              </div>
            </div>

            <button
              type="submit"
              className="upload-submit"
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <span className="spinner" />
                  Uploading...
                </>
              ) : (
                <>
                  Upload Resume
                  <span>↑</span>
                </>
              )}
            </button>
          </div>
        </form>
      </article>

      {/* PREVIEW MODAL */}
      {previewResume && (
        <div className="resume-modal-backdrop" onClick={closePreview}>
          <div
            className="resume-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="resume-modal-header">
              <div>
                <span className="section-label">RESUME PREVIEW</span>

                <h3>{previewResume.originalName || "Resume"}</h3>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closePreview}
              >
                ×
              </button>
            </div>

            <div className="resume-modal-body">
              {isImageFile(previewResume) ? (
                <img
                  src={getResumeFileUrl(previewResume._id)}
                  alt={previewResume.originalName || "Resume preview"}
                />
              ) : (
                <iframe
                  src={getResumeFileUrl(previewResume._id)}
                  title={previewResume.originalName || "Resume preview"}
                />
              )}
            </div>

            <div className="resume-modal-footer">
              <span>
                Version {previewResume.version}
                {" · "}
                {formatDate(previewResume.uploadedAt)}
              </span>

              <a
                href={getResumeFileUrl(previewResume._id)}
                target="_blank"
                rel="noreferrer"
                className="modal-open-button"
              >
                Open Full File ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const resumeStyles = `
.resume-manager {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 4px 0 50px;
  color: #e5edf7;
}

.resume-manager *,
.resume-manager *::before,
.resume-manager *::after {
  box-sizing: border-box;
}

.resume-page-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 22px;
  margin-bottom: 20px;
}

.resume-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.resume-title-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  display: grid;
  place-items: center;
  border-radius: 13px;
  background: linear-gradient(145deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 20px;
  font-weight: 900;
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.2);
}

.resume-kicker,
.section-label {
  display: block;
  color: #60a5fa;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.resume-title-group h2 {
  margin: 3px 0 0;
  color: #f8fafc;
  font-size: 25px;
  line-height: 1.15;
}

.resume-title-group p {
  margin: 6px 0 0;
  color: #7f91a9;
  font-size: 11px;
  line-height: 1.5;
}

.resume-format-info {
  width: 285px;
  flex: 0 0 285px;
  padding: 13px 15px;
  border: 1px solid rgba(59, 130, 246, 0.24);
  border-radius: 13px;
  background: rgba(17, 34, 58, 0.6);
}

.format-title {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #60a5fa;
  font-size: 10px;
  font-weight: 800;
}

.format-title span {
  color: #4ade80;
}

.resume-format-info strong {
  display: block;
  margin-top: 5px;
  color: #dbeafe;
  font-size: 11px;
}

.resume-format-info small {
  display: block;
  margin-top: 4px;
  color: #637792;
  font-size: 9px;
}

.resume-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 15px;
  padding: 11px 13px;
  border-radius: 10px;
}

.resume-alert > span {
  width: 23px;
  height: 23px;
  flex: 0 0 23px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 900;
}

.resume-alert strong {
  display: block;
  font-size: 10px;
}

.resume-alert p {
  margin: 2px 0 0;
  font-size: 9px;
  line-height: 1.45;
}

.resume-alert.error {
  border: 1px solid rgba(248, 113, 113, 0.2);
  background: rgba(127, 29, 29, 0.13);
  color: #fecaca;
}

.resume-alert.error > span {
  background: rgba(239, 68, 68, 0.16);
  color: #f87171;
}

.resume-alert.success {
  border: 1px solid rgba(74, 222, 128, 0.18);
  background: rgba(20, 83, 45, 0.12);
  color: #bbf7d0;
}

.resume-alert.success > span {
  background: rgba(34, 197, 94, 0.14);
  color: #4ade80;
}

.resume-main-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(260px, 0.8fr);
  gap: 16px;
  margin-bottom: 16px;
}

.current-resume-card,
.resume-section-card {
  border: 1px solid rgba(148, 163, 184, 0.11);
  border-radius: 16px;
  background:
    linear-gradient(
      145deg,
      rgba(17, 26, 38, 0.98),
      rgba(9, 16, 25, 0.98)
    );
  box-shadow:
    0 12px 35px rgba(0, 0, 0, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.current-resume-card {
  min-height: 255px;
  padding: 19px;
}

.card-header,
.section-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-header {
  margin-bottom: 19px;
}

.card-header h3,
.section-card-header h3 {
  margin: 3px 0 0;
  color: #f1f5f9;
  font-size: 17px;
}

.card-header p,
.section-card-header p {
  margin: 4px 0 0;
  color: #697d96;
  font-size: 10px;
  line-height: 1.45;
}

.current-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 9px;
  border: 1px solid rgba(74, 222, 128, 0.18);
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.08);
  color: #86efac;
  font-size: 8px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.current-badge i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4ade80;
  box-shadow: 0 0 8px rgba(74, 222, 128, 0.8);
}

.current-resume-body {
  display: flex;
  align-items: flex-start;
  gap: 15px;
}

.file-preview-icon,
.version-file-icon,
.selected-file-icon {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border-radius: 9px;
  font-weight: 900;
}

.file-preview-icon {
  width: 68px;
  height: 82px;
  font-size: 13px;
}

.file-preview-icon.pdf,
.version-file-icon.pdf,
.selected-file-icon.pdf {
  border: 1px solid rgba(248, 113, 113, 0.22);
  background: rgba(127, 29, 29, 0.45);
  color: #fca5a5;
}

.file-preview-icon.image,
.version-file-icon.image,
.selected-file-icon.image {
  border: 1px solid rgba(96, 165, 250, 0.22);
  background: rgba(30, 64, 175, 0.3);
  color: #93c5fd;
}

.current-file-details {
  min-width: 0;
  flex: 1;
}

.current-file-details h4 {
  margin: 0;
  overflow: hidden;
  color: #f1f5f9;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resume-file-title {
  display: block;
  margin-top: 3px;
  color: #7185a1;
  font-size: 10px;
}

.file-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 15px;
  margin-top: 8px;
  color: #61748e;
  font-size: 9px;
}

.current-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 16px;
}

.resume-action {
  min-height: 33px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 12px;
  border-radius: 7px;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
  text-decoration: none;
}

.resume-action.primary {
  border: 1px solid #2563eb;
  background: #2563eb;
  color: #fff;
}

.resume-action.secondary {
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(15, 23, 42, 0.65);
  color: #cbd5e1;
}

.no-current-resume {
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-file-icon,
.empty-history-icon {
  width: 46px;
  height: 56px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.65);
  color: #64748b;
  font-size: 10px;
  font-weight: 900;
}

.no-current-resume h4 {
  margin: 9px 0 0;
  color: #cbd5e1;
  font-size: 13px;
}

.no-current-resume p {
  max-width: 320px;
  margin: 4px 0 0;
  color: #60738d;
  font-size: 9px;
}

.resume-stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.resume-stat-card {
  min-height: 120px;
  padding: 14px;
  border: 1px solid rgba(148, 163, 184, 0.09);
  border-radius: 13px;
  background: rgba(14, 23, 35, 0.78);
}

.stat-icon {
  width: 27px;
  height: 27px;
  display: grid;
  place-items: center;
  margin-bottom: 10px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 900;
}

.stat-icon.blue {
  background: rgba(59, 130, 246, 0.11);
  color: #60a5fa;
}

.stat-icon.green {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.stat-icon.purple {
  background: rgba(168, 85, 247, 0.1);
  color: #c084fc;
}

.stat-icon.orange {
  background: rgba(249, 115, 22, 0.1);
  color: #fb923c;
}

.resume-stat-card strong {
  display: block;
  color: #f1f5f9;
  font-size: 20px;
}

.resume-stat-card small {
  display: block;
  margin-top: 4px;
  color: #647991;
  font-size: 9px;
}

.resume-section-card {
  margin-bottom: 16px;
  padding: 19px;
}

.section-card-header {
  margin-bottom: 17px;
}

.version-count {
  padding: 5px 9px;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 999px;
  color: #7d90aa;
  font-size: 9px;
  white-space: nowrap;
}

.resume-version-list {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.resume-version-row {
  display: grid;
  grid-template-columns: 38px minmax(190px, 1.6fr) 150px 125px minmax(210px, auto);
  align-items: center;
  gap: 12px;
  min-height: 64px;
  padding: 9px 10px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 10px;
  background: rgba(10, 18, 28, 0.55);
}

.resume-version-row.is-current {
  border-color: rgba(59, 130, 246, 0.2);
  background: rgba(37, 99, 235, 0.045);
}

.version-file-icon {
  width: 34px;
  height: 41px;
  font-size: 7px;
}

.version-main {
  min-width: 0;
}

.version-name-line {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}

.version-name-line strong {
  max-width: 230px;
  overflow: hidden;
  color: #dbe4ef;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.version-main > span {
  display: block;
  margin-top: 3px;
  color: #5f728c;
  font-size: 8px;
}

.mini-current {
  flex: 0 0 auto;
  padding: 3px 6px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.09);
  color: #86efac;
  font-size: 7px;
  font-weight: 800;
  text-transform: uppercase;
}

.version-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.version-meta strong {
  color: #60a5fa;
  font-size: 9px;
}

.version-meta span {
  color: #60738d;
  font-size: 8px;
  white-space: nowrap;
}

.version-counts {
  display: flex;
  gap: 14px;
}

.version-counts span {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: #596c85;
  font-size: 7px;
  text-transform: uppercase;
}

.version-counts b {
  color: #aebdd0;
  font-size: 10px;
}

.version-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 5px;
}

.small-action {
  min-height: 27px;
  padding: 0 8px;
  border-radius: 6px;
  font-size: 8px;
  font-weight: 800;
  cursor: pointer;
}

.small-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.small-action.view {
  border: 1px solid rgba(59, 130, 246, 0.2);
  background: rgba(37, 99, 235, 0.1);
  color: #60a5fa;
}

.small-action.current {
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: rgba(148, 163, 184, 0.05);
  color: #cbd5e1;
}

.small-action.delete {
  border: 1px solid rgba(248, 113, 113, 0.15);
  background: rgba(239, 68, 68, 0.07);
  color: #f87171;
}

.empty-history {
  min-height: 135px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(148, 163, 184, 0.12);
  border-radius: 10px;
  text-align: center;
}

.empty-history strong {
  margin-top: 8px;
  color: #cbd5e1;
  font-size: 11px;
}

.empty-history span {
  margin-top: 3px;
  color: #5f728c;
  font-size: 9px;
}

.upload-card {
  margin-bottom: 0;
}

.upload-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  background: rgba(37, 99, 235, 0.12);
  color: #60a5fa;
  font-size: 17px;
  font-weight: 900;
}

.upload-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(270px, 0.8fr);
  gap: 17px;
}

.form-label {
  display: block;
  margin-bottom: 7px;
  color: #cbd5e1;
  font-size: 9px;
  font-weight: 800;
}

.form-label span {
  margin-left: 4px;
  color: #596c85;
  font-weight: 500;
}

.resume-dropzone {
  min-height: 135px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 17px;
  border: 1px dashed rgba(59, 130, 246, 0.32);
  border-radius: 11px;
  background: rgba(37, 99, 235, 0.035);
  cursor: pointer;
  text-align: center;
}

.resume-dropzone:hover {
  border-color: rgba(59, 130, 246, 0.58);
  background: rgba(37, 99, 235, 0.06);
}

.resume-dropzone input {
  display: none;
}

.drop-icon {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  margin-bottom: 7px;
  border-radius: 8px;
  background: rgba(37, 99, 235, 0.11);
  color: #60a5fa;
  font-size: 15px;
  font-weight: 900;
}

.resume-dropzone strong {
  color: #dbe4ef;
  font-size: 10px;
}

.resume-dropzone span {
  margin-top: 4px;
  color: #63758e;
  font-size: 9px;
}

.resume-dropzone small {
  margin-top: 6px;
  color: #4f627b;
  font-size: 8px;
}

.selected-file {
  min-height: 135px;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 15px;
  border: 1px solid rgba(74, 222, 128, 0.17);
  border-radius: 11px;
  background: rgba(20, 83, 45, 0.07);
}

.selected-file-icon {
  width: 44px;
  height: 54px;
  font-size: 8px;
}

.selected-file-info {
  min-width: 0;
  flex: 1;
}

.selected-file-info strong {
  display: block;
  overflow: hidden;
  color: #dbe4ef;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selected-file-info span {
  display: block;
  margin-top: 4px;
  color: #61748e;
  font-size: 8px;
}

.remove-file {
  width: 28px;
  height: 28px;
  border: 1px solid rgba(248, 113, 113, 0.17);
  border-radius: 7px;
  background: rgba(239, 68, 68, 0.07);
  color: #f87171;
  font-size: 17px;
  cursor: pointer;
}

.form-field input {
  width: 100%;
  height: 40px;
  padding: 0 11px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 8px;
  outline: none;
  background: rgba(7, 13, 22, 0.72);
  color: #e2e8f0;
  font-size: 10px;
}

.form-field input:focus {
  border-color: rgba(59, 130, 246, 0.55);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.07);
}

.form-field > small {
  display: block;
  margin-top: 5px;
  color: #53667f;
  font-size: 8px;
}

.current-toggle {
  display: flex;
  align-items: flex-start;
  gap: 9px;
  margin-top: 17px;
  padding: 11px;
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 9px;
  background: rgba(15, 23, 42, 0.38);
  cursor: pointer;
}

.current-toggle input {
  display: none;
}

.toggle-box {
  width: 19px;
  height: 19px;
  flex: 0 0 19px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 5px;
  color: #fff;
  font-size: 10px;
  font-weight: 900;
}

.current-toggle input:checked + .toggle-box {
  border-color: #2563eb;
  background: #2563eb;
}

.current-toggle strong {
  display: block;
  color: #cbd5e1;
  font-size: 9px;
}

.current-toggle small {
  display: block;
  margin-top: 3px;
  color: #5e718a;
  font-size: 8px;
  line-height: 1.4;
}

.upload-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-top: 17px;
  padding-top: 15px;
  border-top: 1px solid rgba(148, 163, 184, 0.07);
}

.upload-security {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.upload-security > span {
  width: 21px;
  height: 21px;
  flex: 0 0 21px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.09);
  color: #4ade80;
  font-size: 9px;
  font-weight: 900;
}

.upload-security strong {
  display: block;
  color: #9fb0c4;
  font-size: 8px;
}

.upload-security small {
  display: block;
  margin-top: 2px;
  color: #53667f;
  font-size: 8px;
}

.upload-submit {
  min-height: 39px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 15px;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff;
  font-size: 9px;
  font-weight: 800;
  cursor: pointer;
}

.upload-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.spinner {
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: resume-spin 0.7s linear infinite;
}

.resume-loading {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  background: rgba(15, 23, 35, 0.8);
}

.resume-loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(96, 165, 250, 0.2);
  border-top-color: #60a5fa;
  border-radius: 50%;
  animation: resume-spin 0.7s linear infinite;
}

.resume-loading strong {
  display: block;
  color: #dbe4ef;
  font-size: 11px;
}

.resume-loading span {
  display: block;
  margin-top: 3px;
  color: #60738d;
  font-size: 8px;
}

.resume-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(2, 6, 12, 0.78);
  backdrop-filter: blur(8px);
}

.resume-modal {
  width: min(920px, 100%);
  height: min(780px, 90vh);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: 16px;
  background: #0c141f;
  box-shadow: 0 30px 90px rgba(0,0,0,0.45);
}

.resume-modal-header {
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.09);
}

.resume-modal-header h3 {
  margin: 3px 0 0;
  max-width: 650px;
  overflow: hidden;
  color: #e2e8f0;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modal-close {
  width: 31px;
  height: 31px;
  border: 1px solid rgba(148, 163, 184, 0.13);
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.7);
  color: #94a3b8;
  font-size: 19px;
  cursor: pointer;
}

.resume-modal-body {
  min-height: 0;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: auto;
  padding: 14px;
  background: #070d15;
}

.resume-modal-body iframe {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: 0;
  border-radius: 7px;
  background: #fff;
}

.resume-modal-body img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
}

.resume-modal-footer {
  min-height: 53px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.09);
}

.resume-modal-footer > span {
  color: #60738d;
  font-size: 8px;
}

.modal-open-button {
  padding: 7px 10px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.09);
  color: #60a5fa;
  font-size: 8px;
  font-weight: 800;
  text-decoration: none;
}

@keyframes resume-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1050px) {
  .resume-page-header {
    flex-direction: column;
  }

  .resume-format-info {
    width: 100%;
    flex-basis: auto;
  }

  .resume-main-grid {
    grid-template-columns: 1fr;
  }

  .resume-stat-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .resume-version-row {
    grid-template-columns:
      38px
      minmax(180px, 1fr)
      100px
      100px;
  }

  .version-actions {
    grid-column: 2 / -1;
    justify-content: flex-start;
  }
}

@media (max-width: 760px) {
  .resume-manager {
    padding-bottom: 30px;
  }

  .resume-title-group {
    align-items: flex-start;
  }

  .resume-title-icon {
    width: 42px;
    height: 42px;
    flex-basis: 42px;
  }

  .resume-title-group h2 {
    font-size: 21px;
  }

  .resume-title-group p {
    font-size: 9px;
  }

  .resume-stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .current-resume-body {
    flex-direction: column;
  }

  .upload-layout {
    grid-template-columns: 1fr;
  }

  .upload-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .upload-submit {
    width: 100%;
  }

  .resume-version-row {
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 9px;
  }

  .version-meta,
  .version-counts {
    grid-column: 2;
  }

  .version-actions {
    grid-column: 2;
  }

  .version-counts {
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .resume-page-header {
    gap: 12px;
  }

  .resume-title-group h2 {
    font-size: 18px;
  }

  .resume-format-info {
    padding: 11px;
  }

  .current-resume-card,
  .resume-section-card {
    padding: 14px;
    border-radius: 13px;
  }

  .card-header,
  .section-card-header {
    flex-direction: column;
  }

  .current-actions {
    width: 100%;
  }

  .resume-action {
    flex: 1;
  }

  .resume-modal-backdrop {
    padding: 8px;
  }

  .resume-modal {
    height: 94vh;
    border-radius: 12px;
  }
}
`;

export default ResumeManagement;
