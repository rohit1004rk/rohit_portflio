import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  deleteResume,
  disableResume,
  enableResume,
  fetchCurrentResume,
  fetchResumeHistory,
  getResumeFileUrl,
  permanentlyDeleteResume,
  setCurrentResume,
  updateResume,
  uploadResume,
} from "../../api/api.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ACCEPTED_EXTENSIONS = ".pdf";

const EMPTY_EDIT = {
  title: "",
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

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

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

const normalizeResume = (resume) => {
  if (!resume) {
    return null;
  }

  return {
    ...resume,

    isCurrent: Boolean(resume.isCurrent),

    isEnabled:
      resume.isEnabled === undefined ? true : Boolean(resume.isEnabled),

    isDeleted: Boolean(resume.isDeleted),

    version: Number(resume.version || 1),

    viewCount: Number(resume.viewCount || 0),

    downloadCount: Number(resume.downloadCount || 0),
  };
};

const sortResumes = (items) => {
  return [...items].sort((a, b) => {
    /*
     * Current first.
     */
    if (Boolean(a.isCurrent) !== Boolean(b.isCurrent)) {
      return a.isCurrent ? -1 : 1;
    }

    /*
     * Then active/enabled.
     */
    if (Boolean(a.isEnabled) !== Boolean(b.isEnabled)) {
      return a.isEnabled ? -1 : 1;
    }

    /*
     * Then latest version.
     */
    return Number(b.version || 0) - Number(a.version || 0);
  });
};

function ResumeManagement() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);

  const token = localStorage.getItem("adminToken");

  const [resumes, setResumes] = useState([]);

  const [currentResume, setCurrentResumeState] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [actionId, setActionId] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /*
   * =========================================================
   * UPLOAD STATE
   * =========================================================
   */

  const [selectedFile, setSelectedFile] = useState(null);

  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState("");

  const [uploadTitle, setUploadTitle] = useState("Resume");

  const [setAsCurrent, setSetAsCurrent] = useState(true);

  /*
   * =========================================================
   * EDIT STATE
   * =========================================================
   */

  const [editingResume, setEditingResume] = useState(null);

  const [editForm, setEditForm] = useState(EMPTY_EDIT);

  /*
   * =========================================================
   * PREVIEW STATE
   * =========================================================
   */

  const [previewResume, setPreviewResume] = useState(null);

  /*
   * =========================================================
   * AUTH FAILURE
   * =========================================================
   */

  const handleAuthFailure = useCallback(() => {
    localStorage.removeItem("adminToken");

    localStorage.removeItem("adminUser");

    navigate("/admin/login");
  }, [navigate]);

  /*
   * =========================================================
   * LOAD DATA
   * =========================================================
   */

  const loadResumes = useCallback(
    async ({ initial = false, refresh = false } = {}) => {
      if (!token) {
        handleAuthFailure();
        return;
      }

      try {
        if (initial) {
          setLoading(true);
        }

        if (refresh) {
          setRefreshing(true);
        }

        setError("");

        const [currentResponse, historyResponse] = await Promise.all([
          fetchCurrentResume().catch(() => null),

          fetchResumeHistory(token),
        ]);

        const history = Array.isArray(historyResponse)
          ? historyResponse
          : Array.isArray(historyResponse?.resumes)
            ? historyResponse.resumes
            : [];

        const normalized = history.map(normalizeResume).filter(Boolean);

        setResumes(sortResumes(normalized));

        setCurrentResumeState(normalizeResume(currentResponse));
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          handleAuthFailure();
          return;
        }

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load resume management data.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, handleAuthFailure],
  );

  useEffect(() => {
    loadResumes({
      initial: true,
    });
  }, [loadResumes]);

  /*
   * =========================================================
   * CLEAN PREVIEW OBJECT URL
   * =========================================================
   */

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }
    };
  }, [selectedPreviewUrl]);

  /*
   * =========================================================
   * DERIVED DATA
   * =========================================================
   */

  const sortedResumes = useMemo(() => sortResumes(resumes), [resumes]);

  const activeResumes = useMemo(
    () =>
      sortedResumes.filter(
        (resume) => !resume.isDeleted && resume.isEnabled !== false,
      ),
    [sortedResumes],
  );

  const disabledResumes = useMemo(
    () =>
      sortedResumes.filter(
        (resume) => !resume.isDeleted && resume.isEnabled === false,
      ),
    [sortedResumes],
  );

  const deletedResumes = useMemo(
    () => sortedResumes.filter((resume) => resume.isDeleted),
    [sortedResumes],
  );

  const current =
    currentResume ||
    sortedResumes.find((resume) => resume.isCurrent && !resume.isDeleted) ||
    null;

  const totalViews = sortedResumes.reduce(
    (sum, resume) => sum + Number(resume.viewCount || 0),
    0,
  );

  const totalDownloads = sortedResumes.reduce(
    (sum, resume) => sum + Number(resume.downloadCount || 0),
    0,
  );

  /*
   * =========================================================
   * ALERT HELPERS
   * =========================================================
   */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /*
   * =========================================================
   * UPLOAD FILE
   * =========================================================
   */

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    clearMessages();

    if (!file) {
      setSelectedFile(null);
      setSelectedPreviewUrl("");
      return;
    }

    const fileName = String(file.name || "").toLowerCase();

    const isPdf = file.type === "application/pdf" || fileName.endsWith(".pdf");

    if (!isPdf) {
      event.target.value = "";

      setSelectedFile(null);
      setSelectedPreviewUrl("");

      setError("Only PDF resume files are allowed.");

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

    if (uploadTitle === "Resume") {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, "")
        .replace(/[_-]+/g, " ")
        .trim();

      if (cleanName) {
        setUploadTitle(cleanName);
      }
    }
  };

  /*
   * =========================================================
   * REMOVE SELECTED FILE
   * =========================================================
   */

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

  /*
   * =========================================================
   * UPLOAD
   * =========================================================
   */

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!token) {
      handleAuthFailure();
      return;
    }

    clearMessages();

    if (!selectedFile) {
      setError("Please select a resume PDF first.");
      return;
    }

    try {
      setUploading(true);

      await uploadResume({
        file: selectedFile,
        title: uploadTitle.trim() || "Resume",
        setCurrent: setAsCurrent,
        token,
      });

      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }

      setSelectedFile(null);
      setSelectedPreviewUrl("");

      setUploadTitle("Resume");
      setSetAsCurrent(true);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setSuccess(
        setAsCurrent
          ? "Resume uploaded and set as current successfully."
          : "Resume uploaded as an archived version successfully.",
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

  /*
   * =========================================================
   * EDIT
   * =========================================================
   */

  const openEdit = (resume) => {
    if (!resume?._id) {
      return;
    }

    if (resume.isDeleted) {
      setError("Deleted resume cannot be edited.");
      return;
    }

    setError("");
    setSuccess("");

    setEditingResume(resume);

    setEditForm({
      title: resume.title || "Resume",
    });
  };

  const closeEdit = () => {
    setEditingResume(null);

    setEditForm(EMPTY_EDIT);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      handleAuthFailure();
      return;
    }

    if (!editingResume?._id) {
      return;
    }

    const cleanTitle = editForm.title.trim();

    if (!cleanTitle) {
      setError("Resume title cannot be empty.");
      return;
    }

    try {
      setActionId(`edit-${editingResume._id}`);

      clearMessages();

      await updateResume(
        editingResume._id,
        {
          title: cleanTitle,
        },
        token,
      );

      closeEdit();

      setSuccess("Resume details updated successfully.");

      await loadResumes();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleAuthFailure();
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update resume.",
      );
    } finally {
      setActionId("");
    }
  };

  /*
   * =========================================================
   * SET CURRENT
   * =========================================================
   */

  const handleSetCurrent = async (resume) => {
    if (!token) {
      handleAuthFailure();
      return;
    }

    if (!resume?._id) {
      return;
    }

    if (resume.isDeleted) {
      setError("Deleted resume cannot be set as current.");
      return;
    }

    if (resume.isEnabled === false) {
      setError("Disabled resume must be enabled before making it current.");
      return;
    }

    if (resume.isCurrent) {
      return;
    }

    const confirmed = window.confirm(
      `Make "${resume.title || resume.originalName || "this resume"}" the current portfolio resume?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(`current-${resume._id}`);

      clearMessages();

      await setCurrentResume(resume._id, token);

      setSuccess("Current resume updated successfully.");

      await loadResumes();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleAuthFailure();
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to set current resume.",
      );
    } finally {
      setActionId("");
    }
  };

  /*
   * =========================================================
   * DISABLE
   * =========================================================
   */

  const handleDisable = async (resume) => {
    if (!token) {
      handleAuthFailure();
      return;
    }

    if (!resume?._id) {
      return;
    }

    if (resume.isCurrent) {
      setError(
        "Current resume cannot be disabled. Set another resume as current first.",
      );
      return;
    }

    if (resume.isDeleted) {
      setError("Deleted resume cannot be disabled.");
      return;
    }

    if (resume.isEnabled === false) {
      return;
    }

    const confirmed = window.confirm(
      `Disable "${resume.title || resume.originalName || "this resume"}"? It will be hidden from the public portfolio, but its database record and PDF will remain preserved.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(`disable-${resume._id}`);

      clearMessages();

      await disableResume(resume._id, token);

      setSuccess(
        "Resume disabled successfully. The original data and PDF were preserved.",
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
          "Failed to disable resume.",
      );
    } finally {
      setActionId("");
    }
  };

  /*
   * =========================================================
   * ENABLE
   * =========================================================
   */

  const handleEnable = async (resume) => {
    if (!token) {
      handleAuthFailure();
      return;
    }

    if (!resume?._id) {
      return;
    }

    if (resume.isDeleted) {
      setError("Deleted resume cannot be enabled.");
      return;
    }

    if (resume.isEnabled !== false) {
      return;
    }

    try {
      setActionId(`enable-${resume._id}`);

      clearMessages();

      await enableResume(resume._id, token);

      setSuccess("Resume enabled successfully.");

      await loadResumes();
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleAuthFailure();
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to enable resume.",
      );
    } finally {
      setActionId("");
    }
  };

  /*
   * =========================================================
   * SOFT DELETE
   * =========================================================
   */

  const handleDelete = async (resume) => {
    if (!token) {
      handleAuthFailure();
      return;
    }

    if (!resume?._id) {
      return;
    }

    if (resume.isCurrent) {
      setError(
        "Current resume cannot be deleted. Set another resume as current first.",
      );
      return;
    }

    if (resume.isDeleted) {
      setError("This resume is already in deleted history.");
      return;
    }

    const confirmed = window.confirm(
      `Move "${resume.title || resume.originalName || "this resume"}" to Deleted History?\n\nThe MongoDB record and PDF file will be preserved.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(`delete-${resume._id}`);

      clearMessages();

      await deleteResume(resume._id, token);

      setSuccess(
        "Resume moved to Deleted History. The original record and PDF were preserved.",
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
          "Failed to delete resume.",
      );
    } finally {
      setActionId("");
    }
  };

  /*
   * =========================================================
   * PERMANENT DELETE
   * =========================================================
   *
   * Only deleted/non-current versions can be permanently
   * removed from MongoDB through this UI.
   */
  const handlePermanentDelete = async (resume) => {
    if (!token) {
      handleAuthFailure();
      return;
    }

    if (!resume?._id) {
      setError("This resume does not have a valid MongoDB ID.");
      return;
    }

    if (resume.isCurrent) {
      setError("Current resume cannot be permanently deleted.");
      return;
    }

    /*
     * Permanent delete is intentionally available
     * only after soft delete.
     */
    if (!resume.isDeleted) {
      setError(
        "Move the resume to Deleted History first, then permanently delete it.",
      );
      return;
    }

    const firstConfirm = window.confirm(
      `PERMANENT DELETE\n\n"${resume.title || resume.originalName || "this resume"}" will be permanently removed from MongoDB.\n\nThe stored PDF and all metadata for this version will also be deleted.\n\nThis action cannot be undone.\n\nContinue?`,
    );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm = window.confirm(
      "FINAL CONFIRMATION\n\nPermanently delete this resume version from MongoDB?",
    );

    if (!secondConfirm) {
      return;
    }

    try {
      setActionId(`permanent-${resume._id}`);

      clearMessages();

      const response = await permanentlyDeleteResume(resume._id, token);

      const deletedId = String(response?.deletedId || "");

      /*
       * Backend must confirm exact ID.
       */
      if (!deletedId || deletedId !== String(resume._id)) {
        throw new Error(
          "Backend did not confirm permanent deletion of the selected resume.",
        );
      }

      /*
       * Fetch fresh MongoDB-backed data
       * and verify that the deleted ID is gone.
       */
      const freshResponse = await fetchResumeHistory(token);

      const freshResumes = Array.isArray(freshResponse)
        ? freshResponse
        : Array.isArray(freshResponse?.resumes)
          ? freshResponse.resumes
          : [];

      const normalizedFresh = freshResumes.map(normalizeResume).filter(Boolean);

      const stillExists = normalizedFresh.some(
        (item) => String(item._id) === String(resume._id),
      );

      if (stillExists) {
        throw new Error(
          "The resume still exists in the backend response. Permanent deletion could not be verified.",
        );
      }

      setResumes(sortResumes(normalizedFresh));

      setSuccess(
        `Resume "${resume.title || resume.originalName || "version"}" was permanently deleted from MongoDB.`,
      );
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        handleAuthFailure();
        return;
      }

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to permanently delete resume.",
      );
    } finally {
      setActionId("");
    }
  };

  /*
   * =========================================================
   * PREVIEW
   * =========================================================
   */

  const openPreview = (resume) => {
    if (!resume?._id) {
      return;
    }

    setPreviewResume(resume);
  };

  const closePreview = () => {
    setPreviewResume(null);
  };

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  const getStatus = (resume) => {
    if (resume.isDeleted) {
      return {
        label: "Deleted",
        className: "deleted",
      };
    }

    if (resume.isCurrent) {
      return {
        label: "Current",
        className: "current",
      };
    }

    if (resume.isEnabled === false) {
      return {
        label: "Disabled",
        className: "disabled",
      };
    }

    return {
      label: "Active",
      className: "active",
    };
  };

  /*
   * =========================================================
   * ACTION LOADING
   * =========================================================
   */

  const isActionRunning = (prefix, id) => actionId === `${prefix}-${id}`;

  /*
   * =========================================================
   * LOADING SCREEN
   * =========================================================
   */

  if (loading) {
    return (
      <section className="resume-manager">
        <ResumeStyles />

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
      <ResumeStyles />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="resume-page-header">
        <div className="resume-title-group">
          <div className="resume-title-icon">▣</div>

          <div>
            <span className="resume-kicker">DOCUMENT MANAGEMENT</span>

            <h2>Resume Management</h2>

            <p>
              Backend-controlled resume versions, visibility and lifecycle
              management.
            </p>
          </div>
        </div>

        <div className="resume-header-controls">
          <div className="resume-format-info">
            <span>PDF ONLY</span>

            <strong>Maximum 10 MB</strong>
          </div>

          <button
            type="button"
            className="refresh-button"
            disabled={refreshing}
            onClick={() =>
              loadResumes({
                refresh: true,
              })
            }
          >
            <span
              className={refreshing ? "refresh-icon spinning" : "refresh-icon"}
            >
              ↻
            </span>

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* =====================================================
          ALERTS
      ====================================================== */}

      {error && (
        <div className="resume-alert error">
          <span className="alert-icon">!</span>

          <div>
            <strong>Action failed</strong>

            <p>{error}</p>
          </div>

          <button type="button" onClick={() => setError("")}>
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="resume-alert success">
          <span className="alert-icon">✓</span>

          <div>
            <strong>Success</strong>

            <p>{success}</p>
          </div>

          <button type="button" onClick={() => setSuccess("")}>
            ×
          </button>
        </div>
      )}

      {/* =====================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="resume-summary-grid">
        <div className="resume-summary-card">
          <span className="summary-icon blue">▤</span>

          <div>
            <strong>{sortedResumes.length}</strong>

            <span>Total Versions</span>
          </div>
        </div>

        <div className="resume-summary-card">
          <span className="summary-icon green">●</span>

          <div>
            <strong>{activeResumes.length}</strong>

            <span>Active</span>
          </div>
        </div>

        <div className="resume-summary-card">
          <span className="summary-icon orange">◐</span>

          <div>
            <strong>{disabledResumes.length}</strong>

            <span>Disabled</span>
          </div>
        </div>

        <div className="resume-summary-card">
          <span className="summary-icon red">×</span>

          <div>
            <strong>{deletedResumes.length}</strong>

            <span>Deleted History</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          CURRENT RESUME
      ====================================================== */}

      <article className="resume-section-card current-card">
        <div className="section-card-header">
          <div>
            <span className="section-label">LIVE VERSION</span>

            <h3>Current Resume</h3>

            <p>
              This is the resume currently exposed through your public
              portfolio.
            </p>
          </div>

          {current && (
            <span className="status-badge current">
              <i />
              CURRENT
            </span>
          )}
        </div>

        {current ? (
          <div className="current-resume-body">
            <div className="file-icon-large">PDF</div>

            <div className="current-file-details">
              <div className="current-name-row">
                <h4>{current.originalName || "Resume"}</h4>

                <span className="status-badge current">CURRENT</span>
              </div>

              <span className="resume-title-muted">
                {current.title || "Portfolio Resume"}
              </span>

              <div className="resume-meta">
                <span>Version {current.version || 1}</span>

                <span>{formatFileSize(current.fileSize)}</span>

                <span>Updated {formatDate(current.uploadedAt)}</span>
              </div>

              <div className="current-action-row">
                <button
                  type="button"
                  className="action-button primary"
                  onClick={() => openPreview(current)}
                >
                  Preview
                </button>

                <a
                  className="action-button secondary"
                  href={getResumeFileUrl(current._id)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open PDF
                </a>

                <button
                  type="button"
                  className="action-button edit"
                  onClick={() => openEdit(current)}
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-current">
            <div className="empty-file-icon">PDF</div>

            <strong>No Current Resume</strong>

            <span>Upload a resume and make it current to publish it.</span>
          </div>
        )}
      </article>

      {/* =====================================================
          ANALYTICS
      ====================================================== */}

      <div className="resume-analytics-grid">
        <div className="analytics-card">
          <span>VERSIONS</span>

          <strong>{sortedResumes.length}</strong>

          <small>Total resume versions</small>
        </div>

        <div className="analytics-card">
          <span>VIEWS</span>

          <strong>{totalViews}</strong>

          <small>Total resume views</small>
        </div>

        <div className="analytics-card">
          <span>DOWNLOADS</span>

          <strong>{totalDownloads}</strong>

          <small>Total downloads</small>
        </div>

        <div className="analytics-card">
          <span>STATUS</span>

          <strong>{current ? "LIVE" : "NONE"}</strong>

          <small>Public resume</small>
        </div>
      </div>

      {/* =====================================================
          ACTIVE / VERSION MANAGEMENT
      ====================================================== */}

      <article className="resume-section-card">
        <div className="section-card-header">
          <div>
            <span className="section-label">VERSION HISTORY</span>

            <h3>Resume Versions</h3>

            <p>
              Edit, preview, enable, disable, change current version or move a
              version to deleted history.
            </p>
          </div>

          <span className="count-pill">
            {sortedResumes.length}{" "}
            {sortedResumes.length === 1 ? "Version" : "Versions"}
          </span>
        </div>

        {sortedResumes.length === 0 ? (
          <div className="empty-history">
            <strong>No resume versions</strong>

            <span>Upload your first PDF resume below.</span>
          </div>
        ) : (
          <div className="resume-table">
            <div className="resume-table-header">
              <span>RESUME</span>

              <span>VERSION</span>

              <span>STATUS</span>

              <span>DATABASE ID</span>

              <span>ACTIONS</span>
            </div>

            {sortedResumes.map((resume) => {
              const status = getStatus(resume);

              const editBusy = isActionRunning("edit", resume._id);

              const currentBusy = isActionRunning("current", resume._id);

              const disableBusy = isActionRunning("disable", resume._id);

              const enableBusy = isActionRunning("enable", resume._id);

              const deleteBusy = isActionRunning("delete", resume._id);

              const permanentBusy = isActionRunning("permanent", resume._id);

              return (
                <div
                  className={`resume-table-row ${
                    resume.isCurrent ? "is-current" : ""
                  } ${resume.isDeleted ? "is-deleted" : ""}`}
                  key={resume._id}
                >
                  {/* RESUME */}
                  <div className="table-resume-cell">
                    <div className="mini-pdf">PDF</div>

                    <div className="table-resume-info">
                      <div className="table-name">
                        <strong title={resume.originalName}>
                          {resume.originalName || "Resume"}
                        </strong>
                      </div>

                      <span>{resume.title || "Portfolio Resume"}</span>

                      <small>Uploaded {formatDate(resume.uploadedAt)}</small>
                    </div>
                  </div>

                  {/* VERSION */}
                  <div className="table-version">
                    <strong>V{resume.version || 1}</strong>

                    <span>{formatFileSize(resume.fileSize)}</span>
                  </div>

                  {/* STATUS */}
                  <div>
                    <span className={`status-badge ${status.className}`}>
                      {status.label}
                    </span>

                    <div className="table-stats">
                      <span>{resume.viewCount || 0} views</span>

                      <span>{resume.downloadCount || 0} downloads</span>
                    </div>
                  </div>

                  {/* DATABASE ID */}
                  <div className="database-id-cell">
                    <button
                      type="button"
                      className="database-id"
                      title="Copy MongoDB ID"
                      onClick={() => {
                        navigator.clipboard
                          ?.writeText(String(resume._id))
                          .then(() => {
                            setSuccess("MongoDB ID copied to clipboard.");
                          })
                          .catch(() => {
                            setError("Could not copy MongoDB ID.");
                          });
                      }}
                    >
                      <span>{String(resume._id || "")}</span>

                      <b>⧉</b>
                    </button>
                  </div>

                  {/* ACTIONS */}
                  <div className="table-actions">
                    <button
                      type="button"
                      className="table-action preview"
                      onClick={() => openPreview(resume)}
                    >
                      Preview
                    </button>

                    <button
                      type="button"
                      className="table-action edit"
                      disabled={resume.isDeleted || editBusy}
                      onClick={() => openEdit(resume)}
                    >
                      {editBusy ? "..." : "Edit"}
                    </button>

                    {!resume.isDeleted &&
                      !resume.isCurrent &&
                      resume.isEnabled !== false && (
                        <button
                          type="button"
                          className="table-action current"
                          disabled={currentBusy}
                          onClick={() => handleSetCurrent(resume)}
                        >
                          {currentBusy ? "..." : "Set Current"}
                        </button>
                      )}

                    {!resume.isDeleted &&
                      !resume.isCurrent &&
                      resume.isEnabled !== false && (
                        <button
                          type="button"
                          className="table-action warning"
                          disabled={disableBusy}
                          onClick={() => handleDisable(resume)}
                        >
                          {disableBusy ? "..." : "Disable"}
                        </button>
                      )}

                    {!resume.isDeleted &&
                      !resume.isCurrent &&
                      resume.isEnabled === false && (
                        <button
                          type="button"
                          className="table-action enable"
                          disabled={enableBusy}
                          onClick={() => handleEnable(resume)}
                        >
                          {enableBusy ? "..." : "Enable"}
                        </button>
                      )}

                    {!resume.isDeleted && !resume.isCurrent && (
                      <button
                        type="button"
                        className="table-action delete"
                        disabled={deleteBusy}
                        onClick={() => handleDelete(resume)}
                      >
                        {deleteBusy ? "..." : "Delete"}
                      </button>
                    )}

                    {resume.isDeleted && (
                      <button
                        type="button"
                        className="table-action permanent"
                        disabled={permanentBusy}
                        onClick={() => handlePermanentDelete(resume)}
                      >
                        {permanentBusy ? "Deleting..." : "Permanent Delete"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </article>

      {/* =====================================================
          DELETED HISTORY
      ====================================================== */}

      <article className="resume-section-card deleted-section">
        <div className="section-card-header">
          <div>
            <span className="section-label red-label">DELETED HISTORY</span>

            <h3>Deleted Versions</h3>

            <p>
              Soft-deleted resumes remain stored in MongoDB until you explicitly
              choose Permanent Delete.
            </p>
          </div>

          <span className="count-pill red">
            {deletedResumes.length}{" "}
            {deletedResumes.length === 1 ? "Version" : "Versions"}
          </span>
        </div>

        {deletedResumes.length === 0 ? (
          <div className="empty-deleted">
            <div className="deleted-empty-icon">✓</div>

            <strong>No deleted versions</strong>

            <span>Soft-deleted resume versions will appear here.</span>
          </div>
        ) : (
          <div className="deleted-list">
            {deletedResumes.map((resume) => (
              <div className="deleted-row" key={resume._id}>
                <div className="mini-pdf deleted-pdf">PDF</div>

                <div className="deleted-main">
                  <div>
                    <strong>{resume.originalName || "Resume"}</strong>

                    <span className="status-badge deleted">DELETED</span>
                  </div>

                  <p>{resume.title || "Portfolio Resume"}</p>

                  <small>
                    Version {resume.version || 1}
                    {" · "}
                    Deleted {formatDate(resume.deletedAt)}
                  </small>
                </div>

                <div className="deleted-actions">
                  <button
                    type="button"
                    className="table-action preview"
                    onClick={() => openPreview(resume)}
                  >
                    Preview
                  </button>

                  <button
                    type="button"
                    className="table-action permanent"
                    disabled={isActionRunning("permanent", resume._id)}
                    onClick={() => handlePermanentDelete(resume)}
                  >
                    {isActionRunning("permanent", resume._id)
                      ? "Deleting..."
                      : "Permanent Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </article>

      {/* =====================================================
          UPLOAD
      ====================================================== */}

      <article className="resume-section-card upload-card">
        <div className="section-card-header">
          <div>
            <span className="section-label">NEW VERSION</span>

            <h3>Upload New Resume</h3>

            <p>Upload a PDF. Existing resume versions will remain preserved.</p>
          </div>

          <div className="upload-icon">↑</div>
        </div>

        <form className="upload-form" onSubmit={handleUpload}>
          <div className="upload-grid">
            <div>
              <label className="field-label">Resume PDF</label>

              {!selectedFile ? (
                <label className="dropzone" htmlFor="resume-file-input">
                  <input
                    ref={fileInputRef}
                    id="resume-file-input"
                    type="file"
                    accept={ACCEPTED_EXTENSIONS}
                    onChange={handleFileChange}
                  />

                  <div className="drop-icon">↑</div>

                  <strong>Choose PDF Resume</strong>

                  <span>Only PDF files are allowed</span>

                  <small>Maximum 10 MB</small>
                </label>
              ) : (
                <div className="selected-file">
                  <div className="mini-pdf">PDF</div>

                  <div>
                    <strong title={selectedFile.name}>
                      {selectedFile.name}
                    </strong>

                    <span>{formatFileSize(selectedFile.size)}</span>
                  </div>

                  <button
                    type="button"
                    className="remove-file"
                    onClick={handleRemoveSelectedFile}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            <div className="upload-details">
              <div className="field">
                <label className="field-label">
                  Resume Title
                  <span>Optional</span>
                </label>

                <input
                  type="text"
                  value={uploadTitle}
                  maxLength={200}
                  onChange={(event) => setUploadTitle(event.target.value)}
                  placeholder="Rohit Kumar Resume"
                />

                <small>This title is stored with the resume version.</small>
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
                    Make this uploaded version the public portfolio resume.
                  </small>
                </span>
              </label>
            </div>
          </div>

          <div className="upload-footer">
            <div className="preserve-info">
              <span>✓</span>

              <div>
                <strong>Existing data is preserved</strong>

                <small>
                  Uploading a new version does not delete previous resume files.
                </small>
              </div>
            </div>

            <button
              type="submit"
              className="upload-button"
              disabled={uploading || !selectedFile}
            >
              {uploading ? (
                <>
                  <span className="button-spinner" />
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

      {/* =====================================================
          EDIT MODAL
      ====================================================== */}

      {editingResume && (
        <div className="modal-backdrop" onClick={closeEdit}>
          <div
            className="edit-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="section-label">RESUME CONTROL</span>

                <h3>Edit Resume</h3>

                <p>Update metadata without changing the stored PDF.</p>
              </div>

              <button type="button" className="modal-close" onClick={closeEdit}>
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="edit-file-info">
                <div className="mini-pdf">PDF</div>

                <div>
                  <strong>{editingResume.originalName}</strong>

                  <span>
                    Version {editingResume.version}
                    {" · "}
                    {formatFileSize(editingResume.fileSize)}
                  </span>
                </div>
              </div>

              <div className="field">
                <label className="field-label">Resume Title</label>

                <input
                  type="text"
                  value={editForm.title}
                  maxLength={200}
                  autoFocus
                  onChange={(event) =>
                    setEditForm((current) => ({
                      ...current,
                      title: event.target.value,
                    }))
                  }
                  placeholder="Resume title"
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="modal-secondary"
                  onClick={closeEdit}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="modal-primary"
                  disabled={isActionRunning("edit", editingResume._id)}
                >
                  {isActionRunning("edit", editingResume._id)
                    ? "Saving..."
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          PDF PREVIEW MODAL
      ====================================================== */}

      {previewResume && (
        <div className="modal-backdrop preview-backdrop" onClick={closePreview}>
          <div
            className="preview-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <span className="section-label">RESUME PREVIEW</span>

                <h3>{previewResume.originalName}</h3>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={closePreview}
              >
                ×
              </button>
            </div>

            <div className="pdf-preview">
              <iframe
                src={getResumeFileUrl(previewResume._id)}
                title={previewResume.originalName || "Resume Preview"}
              />
            </div>

            <div className="preview-footer">
              <span>
                Version {previewResume.version}
                {" · "}
                {formatDate(previewResume.uploadedAt)}
              </span>

              <a
                href={getResumeFileUrl(previewResume._id)}
                target="_blank"
                rel="noreferrer"
              >
                Open Full PDF ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/*
 * ============================================================
 * STYLES
 * ============================================================
 */

function ResumeStyles() {
  return (
    <style>{`
      .resume-manager {
        width: 100%;
        max-width: 1180px;
        margin: 0 auto;
        padding: 4px 0 55px;
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
        gap: 18px;
        margin-bottom: 16px;
      }

      .resume-title-group {
        display: flex;
        align-items: center;
        gap: 13px;
        min-width: 0;
      }

      .resume-title-icon {
        width: 46px;
        height: 46px;
        flex: 0 0 46px;
        display: grid;
        place-items: center;
        border-radius: 12px;
        background: linear-gradient(
          145deg,
          #2563eb,
          #3b82f6
        );
        color: #fff;
        font-size: 18px;
        font-weight: 900;
        box-shadow:
          0 10px 26px
          rgba(37, 99, 235, 0.2);
      }

      .resume-kicker,
      .section-label {
        display: block;
        color: #60a5fa;
        font-size: 8px;
        font-weight: 900;
        letter-spacing: 0.16em;
      }

      .resume-title-group h2 {
        margin: 3px 0 0;
        color: #f8fafc;
        font-size: 24px;
        line-height: 1.1;
      }

      .resume-title-group p {
        margin: 5px 0 0;
        color: #71839a;
        font-size: 10px;
      }

      .resume-header-controls {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .resume-format-info {
        min-width: 125px;
        padding: 10px 12px;
        border: 1px solid
          rgba(59, 130, 246, 0.22);
        border-radius: 10px;
        background:
          rgba(17, 34, 58, 0.62);
      }

      .resume-format-info span {
        display: block;
        color: #60a5fa;
        font-size: 7px;
        font-weight: 900;
      }

      .resume-format-info strong {
        display: block;
        margin-top: 4px;
        color: #dbeafe;
        font-size: 9px;
      }

      .refresh-button {
        min-height: 38px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0 11px;
        border: 1px solid
          rgba(148, 163, 184, 0.14);
        border-radius: 8px;
        background:
          rgba(15, 23, 42, 0.72);
        color: #cbd5e1;
        font-size: 9px;
        font-weight: 800;
        cursor: pointer;
      }

      .refresh-button:hover {
        border-color:
          rgba(96, 165, 250, 0.35);
      }

      .refresh-button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }

      .refresh-icon {
        font-size: 15px;
      }

      .refresh-icon.spinning {
        animation:
          resume-spin
          0.7s
          linear
          infinite;
      }

      .resume-alert {
        display: flex;
        align-items: flex-start;
        gap: 9px;
        margin-bottom: 12px;
        padding: 10px 12px;
        border-radius: 9px;
      }

      .resume-alert.error {
        border: 1px solid
          rgba(248, 113, 113, 0.18);
        background:
          rgba(127, 29, 29, 0.12);
        color: #fecaca;
      }

      .resume-alert.success {
        border: 1px solid
          rgba(74, 222, 128, 0.18);
        background:
          rgba(20, 83, 45, 0.1);
        color: #bbf7d0;
      }

      .alert-icon {
        width: 21px;
        height: 21px;
        flex: 0 0 21px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        font-size: 9px;
        font-weight: 900;
      }

      .error .alert-icon {
        background:
          rgba(239, 68, 68, 0.13);
        color: #f87171;
      }

      .success .alert-icon {
        background:
          rgba(34, 197, 94, 0.13);
        color: #4ade80;
      }

      .resume-alert div {
        flex: 1;
      }

      .resume-alert strong {
        display: block;
        font-size: 9px;
      }

      .resume-alert p {
        margin: 2px 0 0;
        font-size: 8px;
        line-height: 1.5;
      }

      .resume-alert > button {
        border: 0;
        background: transparent;
        color: #64748b;
        font-size: 16px;
        cursor: pointer;
      }

      .resume-summary-grid {
        display: grid;
        grid-template-columns:
          repeat(4, minmax(0, 1fr));
        gap: 9px;
        margin-bottom: 14px;
      }

      .resume-summary-card {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 68px;
        padding: 11px;
        border: 1px solid
          rgba(148, 163, 184, 0.09);
        border-radius: 11px;
        background:
          rgba(14, 23, 35, 0.78);
      }

      .summary-icon {
        width: 30px;
        height: 30px;
        flex: 0 0 30px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        font-size: 10px;
        font-weight: 900;
      }

      .summary-icon.blue {
        background:
          rgba(59, 130, 246, 0.1);
        color: #60a5fa;
      }

      .summary-icon.green {
        background:
          rgba(34, 197, 94, 0.1);
        color: #4ade80;
      }

      .summary-icon.orange {
        background:
          rgba(249, 115, 22, 0.1);
        color: #fb923c;
      }

      .summary-icon.red {
        background:
          rgba(239, 68, 68, 0.1);
        color: #f87171;
      }

      .resume-summary-card strong {
        display: block;
        color: #f1f5f9;
        font-size: 17px;
      }

      .resume-summary-card span:last-child {
        display: block;
        margin-top: 2px;
        color: #63758e;
        font-size: 8px;
      }

      .resume-section-card {
        margin-bottom: 14px;
        padding: 17px;
        border: 1px solid
          rgba(148, 163, 184, 0.1);
        border-radius: 14px;
        background:
          linear-gradient(
            145deg,
            rgba(17, 26, 38, 0.98),
            rgba(9, 16, 25, 0.98)
          );
        box-shadow:
          0 10px 30px
          rgba(0, 0, 0, 0.13);
      }

      .section-card-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 15px;
      }

      .section-card-header h3 {
        margin: 3px 0 0;
        color: #f1f5f9;
        font-size: 16px;
      }

      .section-card-header p {
        margin: 4px 0 0;
        color: #687b94;
        font-size: 9px;
        line-height: 1.45;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        width: fit-content;
        padding: 4px 7px;
        border-radius: 999px;
        font-size: 7px;
        font-weight: 900;
        letter-spacing: 0.05em;
        white-space: nowrap;
      }

      .status-badge.current {
        border: 1px solid
          rgba(74, 222, 128, 0.18);
        background:
          rgba(34, 197, 94, 0.08);
        color: #86efac;
      }

      .status-badge.active {
        border: 1px solid
          rgba(96, 165, 250, 0.18);
        background:
          rgba(59, 130, 246, 0.08);
        color: #93c5fd;
      }

      .status-badge.disabled {
        border: 1px solid
          rgba(251, 146, 60, 0.18);
        background:
          rgba(249, 115, 22, 0.08);
        color: #fdba74;
      }

      .status-badge.deleted {
        border: 1px solid
          rgba(248, 113, 113, 0.18);
        background:
          rgba(239, 68, 68, 0.08);
        color: #fca5a5;
      }

      .status-badge.current i {
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: #4ade80;
        box-shadow:
          0 0 7px
          rgba(74, 222, 128, 0.8);
      }

      .count-pill {
        padding: 5px 8px;
        border: 1px solid
          rgba(148, 163, 184, 0.12);
        border-radius: 999px;
        color: #7d90aa;
        font-size: 8px;
        white-space: nowrap;
      }

      .count-pill.red {
        border-color:
          rgba(248, 113, 113, 0.14);
        color: #fca5a5;
      }

      .current-resume-body {
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 13px;
        border: 1px solid
          rgba(59, 130, 246, 0.12);
        border-radius: 10px;
        background:
          rgba(37, 99, 235, 0.035);
      }

      .file-icon-large {
        width: 58px;
        height: 70px;
        flex: 0 0 58px;
        display: grid;
        place-items: center;
        border: 1px solid
          rgba(248, 113, 113, 0.22);
        border-radius: 9px;
        background:
          rgba(127, 29, 29, 0.38);
        color: #fca5a5;
        font-size: 11px;
        font-weight: 900;
      }

      .current-file-details {
        min-width: 0;
        flex: 1;
      }

      .current-name-row {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 7px;
      }

      .current-name-row h4 {
        margin: 0;
        overflow: hidden;
        color: #f1f5f9;
        font-size: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .resume-title-muted {
        display: block;
        margin-top: 3px;
        color: #7185a1;
        font-size: 9px;
      }

      .resume-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 5px 13px;
        margin-top: 7px;
        color: #61748e;
        font-size: 8px;
      }

      .current-action-row {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 13px;
      }

      .action-button {
        min-height: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 10px;
        border-radius: 6px;
        font-size: 8px;
        font-weight: 800;
        text-decoration: none;
        cursor: pointer;
      }

      .action-button.primary {
        border: 1px solid #2563eb;
        background: #2563eb;
        color: #fff;
      }

      .action-button.secondary {
        border: 1px solid
          rgba(148, 163, 184, 0.14);
        background:
          rgba(15, 23, 42, 0.65);
        color: #cbd5e1;
      }

      .action-button.edit {
        border: 1px solid
          rgba(168, 85, 247, 0.18);
        background:
          rgba(168, 85, 247, 0.08);
        color: #c084fc;
      }

      .empty-current,
      .empty-history,
      .empty-deleted {
        min-height: 115px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 1px dashed
          rgba(148, 163, 184, 0.11);
        border-radius: 10px;
        text-align: center;
      }

      .empty-current strong,
      .empty-history strong,
      .empty-deleted strong {
        margin-top: 7px;
        color: #cbd5e1;
        font-size: 10px;
      }

      .empty-current span,
      .empty-history span,
      .empty-deleted span {
        margin-top: 3px;
        color: #5f728c;
        font-size: 8px;
      }

      .empty-file-icon,
      .deleted-empty-icon {
        width: 38px;
        height: 44px;
        display: grid;
        place-items: center;
        border: 1px solid
          rgba(148, 163, 184, 0.12);
        border-radius: 8px;
        background:
          rgba(15, 23, 42, 0.65);
        color: #64748b;
        font-size: 8px;
        font-weight: 900;
      }

      .deleted-empty-icon {
        border-radius: 50%;
        color: #4ade80;
      }

      .resume-analytics-grid {
        display: grid;
        grid-template-columns:
          repeat(4, minmax(0, 1fr));
        gap: 9px;
        margin-bottom: 14px;
      }

      .analytics-card {
        min-height: 86px;
        padding: 12px;
        border: 1px solid
          rgba(148, 163, 184, 0.08);
        border-radius: 10px;
        background:
          rgba(14, 23, 35, 0.72);
      }

      .analytics-card > span {
        display: block;
        color: #59708b;
        font-size: 7px;
        font-weight: 900;
        letter-spacing: 0.08em;
      }

      .analytics-card strong {
        display: block;
        margin-top: 5px;
        color: #f1f5f9;
        font-size: 18px;
      }

      .analytics-card small {
        display: block;
        margin-top: 2px;
        color: #53667f;
        font-size: 7px;
      }

      .resume-table {
        overflow-x: auto;
        border: 1px solid
          rgba(148, 163, 184, 0.08);
        border-radius: 10px;
      }

      .resume-table-header,
      .resume-table-row {
        min-width: 1060px;
        display: grid;
        grid-template-columns:
          minmax(220px, 1.55fr)
          90px
          125px
          210px
          minmax(300px, 1.55fr);
        gap: 10px;
        align-items: center;
      }

      .resume-table-header {
        min-height: 34px;
        padding: 0 10px;
        border-bottom: 1px solid
          rgba(148, 163, 184, 0.08);
        background:
          rgba(15, 23, 42, 0.55);
      }

      .resume-table-header span {
        color: #53667f;
        font-size: 7px;
        font-weight: 900;
        letter-spacing: 0.08em;
      }

      .resume-table-row {
        min-height: 76px;
        padding: 9px 10px;
        border-bottom: 1px solid
          rgba(148, 163, 184, 0.06);
        background:
          rgba(8, 15, 24, 0.35);
      }

      .resume-table-row:last-child {
        border-bottom: 0;
      }

      .resume-table-row.is-current {
        background:
          rgba(37, 99, 235, 0.045);
      }

      .resume-table-row.is-deleted {
        opacity: 0.82;
        background:
          rgba(127, 29, 29, 0.035);
      }

      .table-resume-cell {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
      }

      .mini-pdf {
        width: 31px;
        height: 39px;
        flex: 0 0 31px;
        display: grid;
        place-items: center;
        border: 1px solid
          rgba(248, 113, 113, 0.2);
        border-radius: 7px;
        background:
          rgba(127, 29, 29, 0.34);
        color: #fca5a5;
        font-size: 6px;
        font-weight: 900;
      }

      .deleted-pdf {
        opacity: 0.72;
      }

      .table-resume-info {
        min-width: 0;
      }

      .table-name {
        min-width: 0;
      }

      .table-name strong {
        display: block;
        overflow: hidden;
        color: #dbe4ef;
        font-size: 9px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .table-resume-info > span {
        display: block;
        margin-top: 2px;
        overflow: hidden;
        color: #60738d;
        font-size: 7px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .table-resume-info small {
        display: block;
        margin-top: 3px;
        color: #4f627b;
        font-size: 6px;
      }

      .table-version strong {
        display: block;
        color: #60a5fa;
        font-size: 9px;
      }

      .table-version span {
        display: block;
        margin-top: 3px;
        color: #596c85;
        font-size: 7px;
      }

      .table-stats {
        display: flex;
        flex-direction: column;
        gap: 3px;
        margin-top: 5px;
        color: #596c85;
        font-size: 6px;
      }

      .database-id {
        max-width: 200px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 5px 6px;
        border: 1px solid
          rgba(148, 163, 184, 0.09);
        border-radius: 5px;
        background:
          rgba(15, 23, 42, 0.42);
        color: #64748b;
        cursor: pointer;
        text-align: left;
      }

      .database-id span {
        overflow: hidden;
        font-family:
          ui-monospace,
          SFMono-Regular,
          Menlo,
          Monaco,
          Consolas,
          monospace;
        font-size: 6px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .database-id b {
        flex: 0 0 auto;
        color: #60a5fa;
        font-size: 9px;
      }

      .table-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 5px;
      }

      .table-action {
        min-height: 26px;
        padding: 0 7px;
        border-radius: 5px;
        font-size: 7px;
        font-weight: 800;
        cursor: pointer;
        white-space: nowrap;
      }

      .table-action:disabled {
        opacity: 0.42;
        cursor: not-allowed;
      }

      .table-action.preview {
        border: 1px solid
          rgba(59, 130, 246, 0.18);
        background:
          rgba(37, 99, 235, 0.08);
        color: #60a5fa;
      }

      .table-action.edit {
        border: 1px solid
          rgba(168, 85, 247, 0.18);
        background:
          rgba(168, 85, 247, 0.07);
        color: #c084fc;
      }

      .table-action.current {
        border: 1px solid
          rgba(59, 130, 246, 0.16);
        background:
          rgba(59, 130, 246, 0.06);
        color: #93c5fd;
      }

      .table-action.warning {
        border: 1px solid
          rgba(251, 146, 60, 0.18);
        background:
          rgba(249, 115, 22, 0.07);
        color: #fb923c;
      }

      .table-action.enable {
        border: 1px solid
          rgba(74, 222, 128, 0.18);
        background:
          rgba(34, 197, 94, 0.07);
        color: #4ade80;
      }

      .table-action.delete {
        border: 1px solid
          rgba(248, 113, 113, 0.16);
        background:
          rgba(239, 68, 68, 0.06);
        color: #f87171;
      }

      .table-action.permanent {
        border: 1px solid
          rgba(244, 63, 94, 0.28);
        background:
          rgba(159, 18, 57, 0.11);
        color: #fb7185;
      }

      .deleted-section {
        border-color:
          rgba(248, 113, 113, 0.1);
      }

      .red-label {
        color: #f87171;
      }

      .deleted-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }

      .deleted-row {
        display: grid;
        grid-template-columns:
          35px
          minmax(0, 1fr)
          auto;
        align-items: center;
        gap: 10px;
        padding: 9px;
        border: 1px solid
          rgba(248, 113, 113, 0.08);
        border-radius: 9px;
        background:
          rgba(127, 29, 29, 0.035);
      }

      .deleted-main {
        min-width: 0;
      }

      .deleted-main > div {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }

      .deleted-main strong {
        color: #cbd5e1;
        font-size: 9px;
      }

      .deleted-main p {
        margin: 3px 0 0;
        color: #60738d;
        font-size: 7px;
      }

      .deleted-main small {
        display: block;
        margin-top: 3px;
        color: #4f627b;
        font-size: 6px;
      }

      .deleted-actions {
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-end;
        gap: 5px;
      }

      .upload-icon {
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 8px;
        background:
          rgba(37, 99, 235, 0.1);
        color: #60a5fa;
        font-size: 16px;
        font-weight: 900;
      }

      .upload-grid {
        display: grid;
        grid-template-columns:
          minmax(0, 1.15fr)
          minmax(260px, 0.85fr);
        gap: 15px;
      }

      .field-label {
        display: block;
        margin-bottom: 6px;
        color: #cbd5e1;
        font-size: 8px;
        font-weight: 800;
      }

      .field-label span {
        margin-left: 4px;
        color: #52657e;
        font-weight: 500;
      }

      .dropzone {
        min-height: 125px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 1px dashed
          rgba(59, 130, 246, 0.3);
        border-radius: 10px;
        background:
          rgba(37, 99, 235, 0.03);
        cursor: pointer;
        text-align: center;
      }

      .dropzone:hover {
        border-color:
          rgba(59, 130, 246, 0.55);
        background:
          rgba(37, 99, 235, 0.055);
      }

      .dropzone input {
        display: none;
      }

      .drop-icon {
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        margin-bottom: 6px;
        border-radius: 7px;
        background:
          rgba(37, 99, 235, 0.1);
        color: #60a5fa;
        font-size: 14px;
        font-weight: 900;
      }

      .dropzone strong {
        color: #dbe4ef;
        font-size: 9px;
      }

      .dropzone span {
        margin-top: 3px;
        color: #63758e;
        font-size: 7px;
      }

      .dropzone small {
        margin-top: 4px;
        color: #4f627b;
        font-size: 7px;
      }

      .selected-file {
        min-height: 125px;
        display: flex;
        align-items: center;
        gap: 9px;
        padding: 13px;
        border: 1px solid
          rgba(74, 222, 128, 0.15);
        border-radius: 10px;
        background:
          rgba(20, 83, 45, 0.055);
      }

      .selected-file > div:nth-child(2) {
        min-width: 0;
        flex: 1;
      }

      .selected-file strong {
        display: block;
        overflow: hidden;
        color: #dbe4ef;
        font-size: 8px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .selected-file span {
        display: block;
        margin-top: 3px;
        color: #60738d;
        font-size: 7px;
      }

      .remove-file {
        width: 26px;
        height: 26px;
        border: 1px solid
          rgba(248, 113, 113, 0.15);
        border-radius: 6px;
        background:
          rgba(239, 68, 68, 0.06);
        color: #f87171;
        font-size: 16px;
        cursor: pointer;
      }

      .field input {
        width: 100%;
        height: 38px;
        padding: 0 10px;
        border: 1px solid
          rgba(148, 163, 184, 0.13);
        border-radius: 7px;
        outline: none;
        background:
          rgba(7, 13, 22, 0.72);
        color: #e2e8f0;
        font-size: 9px;
      }

      .field input:focus {
        border-color:
          rgba(59, 130, 246, 0.5);
        box-shadow:
          0 0 0 3px
          rgba(37, 99, 235, 0.06);
      }

      .field > small {
        display: block;
        margin-top: 4px;
        color: #52657e;
        font-size: 7px;
      }

      .current-toggle {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-top: 15px;
        padding: 10px;
        border: 1px solid
          rgba(148, 163, 184, 0.08);
        border-radius: 8px;
        background:
          rgba(15, 23, 42, 0.34);
        cursor: pointer;
      }

      .current-toggle input {
        display: none;
      }

      .toggle-box {
        width: 18px;
        height: 18px;
        flex: 0 0 18px;
        display: grid;
        place-items: center;
        border: 1px solid
          rgba(148, 163, 184, 0.22);
        border-radius: 4px;
        color: #fff;
        font-size: 9px;
        font-weight: 900;
      }

      .current-toggle input:checked
        + .toggle-box {
        border-color: #2563eb;
        background: #2563eb;
      }

      .current-toggle strong {
        display: block;
        color: #cbd5e1;
        font-size: 8px;
      }

      .current-toggle small {
        display: block;
        margin-top: 2px;
        color: #5e718a;
        font-size: 7px;
        line-height: 1.4;
      }

      .upload-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        margin-top: 14px;
        padding-top: 13px;
        border-top: 1px solid
          rgba(148, 163, 184, 0.07);
      }

      .preserve-info {
        display: flex;
        align-items: flex-start;
        gap: 7px;
      }

      .preserve-info > span {
        width: 20px;
        height: 20px;
        flex: 0 0 20px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background:
          rgba(34, 197, 94, 0.09);
        color: #4ade80;
        font-size: 8px;
        font-weight: 900;
      }

      .preserve-info strong {
        display: block;
        color: #9fb0c4;
        font-size: 7px;
      }

      .preserve-info small {
        display: block;
        margin-top: 2px;
        color: #53667f;
        font-size: 7px;
      }

      .upload-button {
        min-height: 38px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 0 14px;
        border: 0;
        border-radius: 7px;
        background:
          linear-gradient(
            135deg,
            #2563eb,
            #3b82f6
          );
        color: #fff;
        font-size: 8px;
        font-weight: 800;
        cursor: pointer;
      }

      .upload-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .button-spinner {
        width: 11px;
        height: 11px;
        border: 2px solid
          rgba(255,255,255,0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation:
          resume-spin
          0.7s
          linear
          infinite;
      }

      .resume-loading {
        min-height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 11px;
        border: 1px solid
          rgba(148, 163, 184, 0.1);
        border-radius: 14px;
        background:
          rgba(15, 23, 35, 0.8);
      }

      .resume-loading-spinner {
        width: 23px;
        height: 23px;
        border: 2px solid
          rgba(96, 165, 250, 0.18);
        border-top-color: #60a5fa;
        border-radius: 50%;
        animation:
          resume-spin
          0.7s
          linear
          infinite;
      }

      .resume-loading strong {
        display: block;
        color: #dbe4ef;
        font-size: 10px;
      }

      .resume-loading span {
        display: block;
        margin-top: 3px;
        color: #60738d;
        font-size: 7px;
      }

      .modal-backdrop {
        position: fixed;
        inset: 0;
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background:
          rgba(2, 6, 12, 0.78);
        backdrop-filter: blur(8px);
      }

      .edit-modal {
        width: min(470px, 100%);
        overflow: hidden;
        border: 1px solid
          rgba(148, 163, 184, 0.15);
        border-radius: 14px;
        background: #0c141f;
        box-shadow:
          0 30px 80px
          rgba(0, 0, 0, 0.45);
      }

      .modal-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 10px;
        padding: 14px 15px;
        border-bottom: 1px solid
          rgba(148, 163, 184, 0.08);
      }

      .modal-header h3 {
        margin: 3px 0 0;
        color: #e2e8f0;
        font-size: 14px;
      }

      .modal-header p {
        margin: 3px 0 0;
        color: #60738d;
        font-size: 7px;
      }

      .modal-close {
        width: 28px;
        height: 28px;
        border: 1px solid
          rgba(148, 163, 184, 0.13);
        border-radius: 7px;
        background:
          rgba(15, 23, 42, 0.7);
        color: #94a3b8;
        font-size: 17px;
        cursor: pointer;
      }

      .edit-modal form {
        padding: 15px;
      }

      .edit-file-info {
        display: flex;
        align-items: center;
        gap: 9px;
        margin-bottom: 14px;
        padding: 9px;
        border: 1px solid
          rgba(148, 163, 184, 0.08);
        border-radius: 8px;
        background:
          rgba(15, 23, 42, 0.4);
      }

      .edit-file-info > div:last-child {
        min-width: 0;
      }

      .edit-file-info strong {
        display: block;
        overflow: hidden;
        color: #cbd5e1;
        font-size: 8px;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .edit-file-info span {
        display: block;
        margin-top: 3px;
        color: #5f728c;
        font-size: 7px;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 6px;
        margin-top: 15px;
        padding-top: 12px;
        border-top: 1px solid
          rgba(148, 163, 184, 0.07);
      }

      .modal-secondary,
      .modal-primary {
        min-height: 31px;
        padding: 0 11px;
        border-radius: 6px;
        font-size: 8px;
        font-weight: 800;
        cursor: pointer;
      }

      .modal-secondary {
        border: 1px solid
          rgba(148, 163, 184, 0.13);
        background:
          rgba(15, 23, 42, 0.65);
        color: #94a3b8;
      }

      .modal-primary {
        border: 1px solid #2563eb;
        background: #2563eb;
        color: #fff;
      }

      .modal-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .preview-backdrop {
        padding: 15px;
      }

      .preview-modal {
        width: min(1000px, 100%);
        height: min(820px, 92vh);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid
          rgba(148, 163, 184, 0.15);
        border-radius: 14px;
        background: #0c141f;
        box-shadow:
          0 30px 90px
          rgba(0, 0, 0, 0.5);
      }

      .pdf-preview {
        min-height: 0;
        flex: 1;
        padding: 10px;
        background: #070d15;
      }

      .pdf-preview iframe {
        width: 100%;
        height: 100%;
        min-height: 450px;
        border: 0;
        border-radius: 6px;
        background: #fff;
      }

      .preview-footer {
        min-height: 47px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 14px;
        border-top: 1px solid
          rgba(148, 163, 184, 0.08);
      }

      .preview-footer span {
        color: #60738d;
        font-size: 7px;
      }

      .preview-footer a {
        padding: 6px 9px;
        border: 1px solid
          rgba(59, 130, 246, 0.18);
        border-radius: 5px;
        background:
          rgba(37, 99, 235, 0.08);
        color: #60a5fa;
        font-size: 7px;
        font-weight: 800;
        text-decoration: none;
      }

      @keyframes resume-spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 1050px) {
        .resume-summary-grid,
        .resume-analytics-grid {
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
        }

        .upload-grid {
          grid-template-columns: 1fr;
        }
      }

      @media (max-width: 760px) {
        .resume-page-header {
          flex-direction: column;
        }

        .resume-header-controls {
          width: 100%;
        }

        .resume-format-info {
          flex: 1;
        }

        .refresh-button {
          flex: 0 0 auto;
        }

        .current-resume-body {
          flex-direction: column;
        }

        .current-action-row {
          width: 100%;
        }

        .action-button {
          flex: 1;
        }

        .upload-footer {
          align-items: stretch;
          flex-direction: column;
        }

        .upload-button {
          width: 100%;
        }

        .deleted-row {
          grid-template-columns:
            35px
            minmax(0, 1fr);
        }

        .deleted-actions {
          grid-column: 2;
          justify-content: flex-start;
        }
      }

      @media (max-width: 520px) {
        .resume-summary-grid,
        .resume-analytics-grid {
          grid-template-columns: 1fr 1fr;
        }

        .resume-section-card {
          padding: 13px;
          border-radius: 11px;
        }

        .section-card-header {
          flex-direction: column;
        }

        .resume-title-group h2 {
          font-size: 20px;
        }

        .resume-header-controls {
          align-items: stretch;
        }

        .resume-format-info {
          min-width: 0;
        }

        .preview-backdrop {
          padding: 7px;
        }

        .preview-modal {
          height: 95vh;
          border-radius: 10px;
        }

        .modal-backdrop {
          padding: 8px;
        }
      }
    `}</style>
  );
}

export default ResumeManagement;
