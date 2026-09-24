import { useCallback, useEffect, useMemo, useState } from "react";

import {
  fetchAdminContactLinks,
  createContactLink,
  updateContactLink,
  permanentlyDeleteContactLink,
  reorderContactLinks,
} from "../../api/api.js";

import "./ContactLinksManagement.css";

const EMPTY_LINK = {
  platform: "",
  label: "",
  url: "",
  icon: "",
  isActive: true,
  order: 0,
};

const normalizeLink = (link, index = 0) => ({
  _id: link?._id || "",
  platform: link?.platform || "",
  label: link?.label || "",
  url: link?.url || "",
  icon: link?.icon || "",
  isActive: link?.isActive !== false,
  order: Number.isFinite(Number(link?.order)) ? Number(link.order) : index,
  createdAt: link?.createdAt || null,
  updatedAt: link?.updatedAt || null,
});

const sortLinks = (items) =>
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

const getShortId = (id) => {
  if (!id) {
    return "N/A";
  }

  const value = String(id);

  if (value.length <= 18) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-6)}`;
};

const getPlatformIcon = (link) => {
  const icon = String(link?.icon || "")
    .trim()
    .toLowerCase();

  const platform = String(link?.platform || "")
    .trim()
    .toLowerCase();

  const value = icon || platform;

  const icons = {
    linkedin: "in",
    github: "GH",
    youtube: "YT",
    instagram: "IG",
    facebook: "f",
    twitter: "X",
    x: "X",
    email: "@",
    resume: "CV",
    website: "WEB",
    leetcode: "LC",
    kaggle: "K",
  };

  return icons[value] || "↗";
};

function ContactLinksManagement() {
  const token = localStorage.getItem("adminToken");

  const [links, setLinks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState("");

  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    ...EMPTY_LINK,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
   * ============================================================
   * COUNTS
   * ============================================================
   */

  const activeCount = useMemo(
    () => links.filter((link) => link.isActive !== false).length,
    [links],
  );

  const disabledCount = links.length - activeCount;

  const firstOrder =
    links.length > 0
      ? Math.min(...links.map((link) => Number(link.order || 0)))
      : 0;

  const lastOrder =
    links.length > 0
      ? Math.max(...links.map((link) => Number(link.order || 0)))
      : 0;

  /*
   * ============================================================
   * AUTH ERROR
   * ============================================================
   */

  const handleAuthError = (err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
    }
  };

  /*
   * ============================================================
   * LOAD
   * ============================================================
   */

  const loadLinks = useCallback(
    async ({ isRefresh = false } = {}) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        if (!token) {
          setError("Admin authentication token is missing.");
          return;
        }

        const data = await fetchAdminContactLinks(token);

        const loadedLinks = Array.isArray(data)
          ? data.map(normalizeLink)
          : Array.isArray(data?.contactLinks)
            ? data.contactLinks.map(normalizeLink)
            : [];

        setLinks(sortLinks(loadedLinks));
      } catch (err) {
        handleAuthError(err);

        setError(
          err?.response?.data?.message || "Failed to load contact links.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  /*
   * ============================================================
   * FORM
   * ============================================================
   */

  const resetForm = () => {
    setForm({
      ...EMPTY_LINK,
      order: links.length,
    });

    setEditingId(null);
    setError("");
    setSuccess("");
  };

  const handleFormChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  };

  /*
   * ============================================================
   * ADD
   * ============================================================
   */

  const handleAddLink = async () => {
    const platform = form.platform.trim();

    const label = form.label.trim();

    const url = form.url.trim();

    const icon = form.icon.trim();

    if (!platform) {
      setError("Platform name is required.");
      return;
    }

    if (!label) {
      setError("Link label is required.");
      return;
    }

    if (!url) {
      setError("URL is required.");
      return;
    }

    if (!token) {
      setError("Admin authentication token is missing.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const numericOrder = Number(form.order);

      const payload = {
        platform,
        label,
        url,
        icon,
        isActive: form.isActive !== false,
        order:
          Number.isFinite(numericOrder) && numericOrder >= 0
            ? Math.floor(numericOrder)
            : links.length,
      };

      const response = await createContactLink(payload, token);

      const createdLink = response?.contactLink;

      if (createdLink) {
        setLinks((current) =>
          sortLinks([...current, normalizeLink(createdLink)]),
        );
      } else {
        await loadLinks();
      }

      setSuccess("Contact link added successfully.");

      setForm({
        ...EMPTY_LINK,
        order: links.length + 1,
      });

      setEditingId(null);
    } catch (err) {
      handleAuthError(err);

      setError(err?.response?.data?.message || "Failed to add contact link.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * EDIT
   * ============================================================
   */

  const handleEdit = (link) => {
    if (!link?._id) {
      setError("This contact link does not have a valid database ID.");
      return;
    }

    setEditingId(link._id);

    setForm({
      platform: link.platform || "",
      label: link.label || "",
      url: link.url || "",
      icon: link.icon || "",
      isActive: link.isActive !== false,
      order: link.order ?? 0,
    });

    setError("");
    setSuccess("");
  };

  /*
   * ============================================================
   * UPDATE
   * ============================================================
   */

  const handleUpdate = async () => {
    if (!editingId) {
      return;
    }

    const platform = form.platform.trim();

    const label = form.label.trim();

    const url = form.url.trim();

    const icon = form.icon.trim();

    if (!platform) {
      setError("Platform name is required.");
      return;
    }

    if (!label) {
      setError("Link label is required.");
      return;
    }

    if (!url) {
      setError("URL is required.");
      return;
    }

    if (!token) {
      setError("Admin authentication token is missing.");
      return;
    }

    const numericOrder = Number(form.order);

    if (!Number.isFinite(numericOrder) || numericOrder < 0) {
      setError("Order must be 0 or greater.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await updateContactLink(
        editingId,
        {
          platform,
          label,
          url,
          icon,
          isActive: form.isActive !== false,
          order: Math.floor(numericOrder),
        },
        token,
      );

      const updatedLink = response?.contactLink;

      if (updatedLink) {
        setLinks((current) =>
          sortLinks(
            current.map((link) =>
              String(link._id) === String(editingId)
                ? normalizeLink(updatedLink)
                : link,
            ),
          ),
        );
      } else {
        await loadLinks();
      }

      setEditingId(null);

      setForm({
        ...EMPTY_LINK,
        order: links.length,
      });

      setSuccess("Contact link updated successfully.");
    } catch (err) {
      handleAuthError(err);

      setError(
        err?.response?.data?.message || "Failed to update contact link.",
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ============================================================
   * ENABLE / DISABLE
   * ============================================================
   */

  const handleToggle = async (link) => {
    if (!link?._id) {
      setError("This contact link does not have a valid database ID.");
      return;
    }

    if (!token) {
      setError("Admin authentication token is missing.");
      return;
    }

    const nextActive = link.isActive === false;

    try {
      setActionId(String(link._id));

      setError("");
      setSuccess("");

      const response = await updateContactLink(
        link._id,
        {
          isActive: nextActive,
        },
        token,
      );

      const updatedLink = response?.contactLink;

      if (updatedLink) {
        setLinks((current) =>
          current.map((item) =>
            String(item._id) === String(link._id)
              ? normalizeLink(updatedLink)
              : item,
          ),
        );
      } else {
        await loadLinks({
          isRefresh: true,
        });
      }

      setSuccess(
        nextActive ? "Contact link enabled." : "Contact link disabled.",
      );
    } catch (err) {
      handleAuthError(err);

      setError(
        err?.response?.data?.message || "Failed to update contact link.",
      );
    } finally {
      setActionId("");
    }
  };

  /*
   * ============================================================
   * DISABLE
   * ============================================================
   */

  const handleDisable = async (link) => {
    if (!link?._id) {
      return;
    }

    if (link.isActive === false) {
      return;
    }

    const confirmed = window.confirm(
      `Disable "${link.label || link.platform}"?\n\nThe record will remain safely stored in MongoDB and disappear from the public Contact section.`,
    );

    if (!confirmed) {
      return;
    }

    await handleToggle(link);
  };

  /*
   * ============================================================
   * PERMANENT DELETE
   * ============================================================
   */

  const handlePermanentDelete = async (link) => {
    if (!link?._id) {
      setError("This contact link does not have a valid database ID.");
      return;
    }

    if (!token) {
      setError("Admin authentication token is missing.");
      return;
    }

    const firstConfirm = window.confirm(
      `PERMANENT DELETE\n\n"${link.label || link.platform}" will be permanently removed from MongoDB.\n\nThis cannot be undone.\n\nContinue?`,
    );

    if (!firstConfirm) {
      return;
    }

    const secondConfirm = window.confirm(
      "Final confirmation:\n\nPermanently delete this Contact Link from the database?",
    );

    if (!secondConfirm) {
      return;
    }

    try {
      setActionId(`permanent-${link._id}`);

      setError("");
      setSuccess("");

      const response = await permanentlyDeleteContactLink(link._id, token);

      const deletedId = String(response?.deletedId || "");

      if (deletedId && deletedId !== String(link._id)) {
        throw new Error(
          "Backend returned an unexpected deleted contact link ID.",
        );
      }

      const freshData = await fetchAdminContactLinks(token);

      const freshLinks = Array.isArray(freshData)
        ? freshData.map(normalizeLink)
        : Array.isArray(freshData?.contactLinks)
          ? freshData.contactLinks.map(normalizeLink)
          : [];

      const stillExists = freshLinks.some(
        (item) => String(item._id) === String(link._id),
      );

      if (stillExists) {
        throw new Error(
          "The deleted contact link is still present in the database response.",
        );
      }

      setLinks(sortLinks(freshLinks));

      if (String(editingId) === String(link._id)) {
        resetForm();
      }

      setSuccess(
        `Contact link "${link.label || link.platform}" was permanently deleted from MongoDB.`,
      );
    } catch (err) {
      handleAuthError(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to permanently delete contact link.",
      );
    } finally {
      setActionId("");
    }
  };

  /*
   * ============================================================
   * ORDER
   * ============================================================
   */

  const persistOrder = async (reorderedLinks) => {
    if (!token) {
      setError("Admin authentication token is missing.");
      return false;
    }

    const normalized = reorderedLinks.map((link, index) => ({
      ...link,
      order: index,
    }));

    const orderedIds = normalized.map((link) => link._id);

    if (orderedIds.some((id) => !id)) {
      setError("One or more contact links do not have a valid database ID.");
      return false;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await reorderContactLinks(orderedIds, token);

      const updatedLinks = Array.isArray(response?.contactLinks)
        ? response.contactLinks.map(normalizeLink)
        : normalized;

      setLinks(sortLinks(updatedLinks));

      setSuccess("Contact link order saved successfully.");

      return true;
    } catch (err) {
      handleAuthError(err);

      setError(
        err?.response?.data?.message || "Failed to save contact link order.",
      );

      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index, direction) => {
    if (saving || links.length < 2) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= links.length) {
      return;
    }

    const reordered = [...links];

    const current = reordered[index];

    reordered[index] = reordered[targetIndex];

    reordered[targetIndex] = current;

    await persistOrder(reordered);
  };

  const handleSaveOrder = async () => {
    await persistOrder(sortLinks(links));
  };

  /*
   * ============================================================
   * COPY DATABASE ID
   * ============================================================
   */

  const handleCopyId = async (id) => {
    if (!id) {
      return;
    }

    try {
      await navigator.clipboard.writeText(String(id));

      setSuccess("MongoDB document ID copied.");

      setTimeout(() => {
        setSuccess("");
      }, 1800);
    } catch {
      setError("Could not copy the MongoDB ID.");
    }
  };

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <section className="admin-contact-links-management">
        <div className="admin-contact-links-loading">
          <div className="admin-contact-loading-spinner" />
          <p>Loading contact links...</p>
        </div>
      </section>
    );
  }

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <section className="admin-contact-links-management">
      {/* ======================================================
          PAGE HEADER
          ====================================================== */}

      <header className="admin-contact-page-header">
        <div className="admin-contact-page-title">
          <div className="admin-contact-page-icon" aria-hidden="true">
            ↗
          </div>

          <div>
            <span className="admin-contact-eyebrow">PORTFOLIO CMS</span>

            <h2>Contact Links</h2>

            <p>
              Manage the social, professional and contact links shown on your
              public portfolio.
            </p>
          </div>
        </div>

        <div className="admin-contact-backend-badge">
          <span className="admin-contact-backend-dot" />

          <div>
            <strong>Backend Controlled</strong>

            <small>ContactLink database</small>
          </div>
        </div>
      </header>

      {/* ======================================================
          ALERTS
          ====================================================== */}

      {error && (
        <div className="admin-contact-alert admin-contact-alert-error">
          <span>!</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="admin-contact-alert admin-contact-alert-success">
          <span>✓</span>
          <p>{success}</p>
        </div>
      )}

      {/* ======================================================
          SUMMARY
          ====================================================== */}

      <div className="admin-contact-summary-grid">
        <div className="admin-contact-summary-card">
          <span className="admin-contact-summary-label">Total Links</span>

          <strong>{links.length}</strong>

          <small>Database records</small>
        </div>

        <div className="admin-contact-summary-card">
          <span className="admin-contact-summary-label">Active</span>

          <strong>{activeCount}</strong>

          <small>Visible publicly</small>
        </div>

        <div className="admin-contact-summary-card">
          <span className="admin-contact-summary-label">Disabled</span>

          <strong>{disabledCount}</strong>

          <small>Safely preserved</small>
        </div>

        <div className="admin-contact-summary-card">
          <span className="admin-contact-summary-label">Public Order</span>

          <strong>{links.length ? `${firstOrder}–${lastOrder}` : "—"}</strong>

          <small>Display sequence</small>
        </div>
      </div>

      {/* ======================================================
          CREATE / EDIT CARD
          ====================================================== */}

      <section className="admin-contact-section-card">
        <div className="admin-contact-section-header">
          <div>
            <span className="admin-contact-section-kicker">
              {editingId ? "UPDATE" : "CREATE"}
            </span>

            <h3>{editingId ? "Edit Contact Link" : "Add New Link"}</h3>

            <p>
              {editingId
                ? "Update the selected contact link without changing its database identity."
                : "Create a new social or professional profile link."}
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              className="admin-contact-btn admin-contact-btn-secondary"
              onClick={resetForm}
              disabled={saving}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="admin-contact-form">
          <div className="admin-contact-field">
            <label htmlFor="contact-link-platform">Platform</label>

            <select
              id="contact-link-platform"
              value={form.platform}
              onChange={(event) =>
                handleFormChange("platform", event.target.value)
              }
            >
              <option value="">Select platform</option>

              <option value="LinkedIn">LinkedIn</option>

              <option value="GitHub">GitHub</option>

              <option value="Instagram">Instagram</option>

              <option value="YouTube">YouTube</option>

              <option value="Facebook">Facebook</option>

              <option value="X">X / Twitter</option>

              <option value="LeetCode">LeetCode</option>

              <option value="Kaggle">Kaggle</option>

              <option value="Email">Email</option>

              <option value="Website">Website</option>

              <option value="Resume">Resume</option>

              <option value="Other">Other</option>
            </select>
          </div>

          <div className="admin-contact-field">
            <label htmlFor="contact-link-label">Label</label>

            <input
              id="contact-link-label"
              type="text"
              value={form.label}
              onChange={(event) =>
                handleFormChange("label", event.target.value)
              }
              placeholder="e.g. LinkedIn"
              maxLength={100}
            />
          </div>

          <div className="admin-contact-field admin-contact-field-full">
            <label htmlFor="contact-link-url">URL</label>

            <input
              id="contact-link-url"
              type="text"
              value={form.url}
              onChange={(event) => handleFormChange("url", event.target.value)}
              placeholder="https://example.com/profile"
              maxLength={500}
            />

            <small className="admin-contact-field-help">
              Use a complete public URL or an internal route such as /resume.
            </small>
          </div>

          <div className="admin-contact-field">
            <label htmlFor="contact-link-icon">
              Icon
              <span>Optional</span>
            </label>

            <input
              id="contact-link-icon"
              type="text"
              value={form.icon}
              onChange={(event) => handleFormChange("icon", event.target.value)}
              placeholder="linkedin"
              maxLength={100}
            />
          </div>

          <div className="admin-contact-field">
            <label htmlFor="contact-link-order">Display Order</label>

            <input
              id="contact-link-order"
              type="number"
              min="0"
              value={form.order}
              onChange={(event) =>
                handleFormChange("order", event.target.value)
              }
            />

            <small className="admin-contact-field-help">
              Lower number appears first.
            </small>
          </div>

          <label className="admin-contact-public-toggle">
            <input
              type="checkbox"
              checked={form.isActive !== false}
              onChange={(event) =>
                handleFormChange("isActive", event.target.checked)
              }
            />

            <span className="admin-contact-toggle-box">✓</span>

            <span>
              <strong>Show on public portfolio</strong>

              <small>Keep this link visible to visitors.</small>
            </span>
          </label>
        </div>

        <div className="admin-contact-form-footer">
          <span>
            {editingId
              ? "Changes will be saved directly to MongoDB."
              : "The new link will be stored in the ContactLink collection."}
          </span>

          <button
            type="button"
            className="admin-contact-btn admin-contact-btn-primary"
            onClick={editingId ? handleUpdate : handleAddLink}
            disabled={saving}
          >
            {saving
              ? editingId
                ? "Updating..."
                : "Adding..."
              : editingId
                ? "✓ Update Link"
                : "+ Add Link"}
          </button>
        </div>
      </section>

      {/* ======================================================
          EXISTING LINKS
          ====================================================== */}

      <section className="admin-contact-section-card">
        <div className="admin-contact-section-header admin-contact-existing-header">
          <div>
            <span className="admin-contact-section-kicker">DATABASE</span>

            <h3>Existing Contact Links</h3>

            <p>Records currently stored in the ContactLink collection.</p>
          </div>

          <div className="admin-contact-count-badge">
            {links.length} {links.length === 1 ? "Link" : "Links"}
          </div>
        </div>

        {links.length === 0 ? (
          <div className="admin-contact-empty">
            <div className="admin-contact-empty-icon">↗</div>

            <h4>No contact links</h4>

            <p>Add your first contact or social profile above.</p>
          </div>
        ) : (
          <div className="admin-contact-table-container">
            <table className="admin-contact-table">
              <thead>
                <tr>
                  <th className="admin-contact-col-number">#</th>

                  <th>Platform</th>

                  <th>URL</th>

                  <th className="admin-contact-col-order">Order</th>

                  <th className="admin-contact-col-status">Status</th>

                  <th className="admin-contact-col-actions">Actions</th>
                </tr>
              </thead>

              <tbody>
                {links.map((link, index) => {
                  const busy = actionId === String(link._id);

                  const permanentBusy = actionId === `permanent-${link._id}`;

                  return (
                    <tr key={link._id || `${link.platform}-${index}`}>
                      <td className="admin-contact-row-number">
                        {String(index + 1).padStart(2, "0")}
                      </td>

                      <td>
                        <div className="admin-contact-platform-cell">
                          <span className="admin-contact-platform-icon">
                            {getPlatformIcon(link)}
                          </span>

                          <div className="admin-contact-platform-info">
                            <strong>{link.platform || "Other"}</strong>

                            <span>{link.label || "Profile"}</span>

                            <button
                              type="button"
                              className="admin-contact-id"
                              title={`MongoDB ID: ${link._id}`}
                              onClick={() => handleCopyId(link._id)}
                            >
                              ID {getShortId(link._id)}
                              <span>Copy</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      <td>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-contact-url"
                          title={link.url}
                        >
                          {link.url}
                        </a>
                      </td>

                      <td>
                        <div className="admin-contact-order-controls">
                          <button
                            type="button"
                            className="admin-contact-order-button"
                            title="Move up"
                            disabled={saving || index === 0}
                            onClick={() => handleMove(index, "up")}
                          >
                            ↑
                          </button>

                          <strong>{link.order}</strong>

                          <button
                            type="button"
                            className="admin-contact-order-button"
                            title="Move down"
                            disabled={saving || index === links.length - 1}
                            onClick={() => handleMove(index, "down")}
                          >
                            ↓
                          </button>
                        </div>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            link.isActive !== false
                              ? "admin-contact-status admin-contact-status-active"
                              : "admin-contact-status admin-contact-status-disabled"
                          }
                          onClick={() => handleToggle(link)}
                          disabled={busy || permanentBusy}
                        >
                          <span>●</span>

                          {busy
                            ? "..."
                            : link.isActive !== false
                              ? "Active"
                              : "Disabled"}
                        </button>
                      </td>

                      <td>
                        <div className="admin-contact-actions">
                          <button
                            type="button"
                            className="admin-contact-action-edit"
                            onClick={() => handleEdit(link)}
                            disabled={busy || permanentBusy}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className={
                              link.isActive !== false
                                ? "admin-contact-action-disable"
                                : "admin-contact-action-enable"
                            }
                            onClick={() =>
                              link.isActive !== false
                                ? handleDisable(link)
                                : handleToggle(link)
                            }
                            disabled={busy || permanentBusy}
                          >
                            {link.isActive !== false ? "Disable" : "Enable"}
                          </button>

                          <button
                            type="button"
                            className="admin-contact-action-danger"
                            onClick={() => handlePermanentDelete(link)}
                            disabled={busy || permanentBusy}
                          >
                            {permanentBusy ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {links.length > 1 && (
          <div className="admin-contact-order-footer">
            <div>
              <strong>Public display order</strong>

              <span>
                Use ↑ / ↓ to change the sequence shown on the public portfolio.
              </span>
            </div>

            <button
              type="button"
              className="admin-contact-btn admin-contact-btn-primary"
              onClick={handleSaveOrder}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Order"}
            </button>
          </div>
        )}
      </section>

      {/* ======================================================
          FOOTER / REFRESH
          ====================================================== */}

      <div className="admin-contact-footer">
        <div>
          <strong>Database synchronized</strong>

          <span>
            Refresh reads the latest ContactLink records directly from the
            backend.
          </span>
        </div>

        <button
          type="button"
          className="admin-contact-btn admin-contact-btn-secondary"
          disabled={refreshing || saving}
          onClick={() =>
            loadLinks({
              isRefresh: true,
            })
          }
        >
          {refreshing ? "↻ Refreshing..." : "↻ Refresh"}
        </button>
      </div>
    </section>
  );
}

export default ContactLinksManagement;
