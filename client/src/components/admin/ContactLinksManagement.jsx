import { useEffect, useMemo, useState } from "react";
import {
  fetchPortfolioSettings,
  updatePortfolioSettings,
} from "../../api/api.js";

const EMPTY_LINK = {
  platform: "",
  label: "",
  url: "",
  icon: "",
  enabled: true,
  order: 0,
};

const normalizeLink = (link, index) => ({
  platform: link?.platform || "",
  label: link?.label || "",
  url: link?.url || "",
  icon: link?.icon || "",
  enabled: link?.enabled !== false,
  order: Number.isFinite(Number(link?.order)) ? Number(link.order) : index,
});

function ContactLinksManagement() {
  const token = localStorage.getItem("adminToken");

  const [profile, setProfile] = useState(null);
  const [links, setLinks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(EMPTY_LINK);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const activeCount = useMemo(
    () => links.filter((link) => link.enabled !== false).length,
    [links],
  );

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchPortfolioSettings(token);

      const loadedProfile = data?.profile || {};

      const loadedLinks = Array.isArray(loadedProfile.socialLinks)
        ? loadedProfile.socialLinks.map(normalizeLink)
        : [];

      loadedLinks.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      setProfile(loadedProfile);
      setLinks(loadedLinks);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load contact links.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setError("Admin authentication token is missing.");
      setLoading(false);
      return;
    }

    loadSettings();
  }, [token]);

  const resetForm = () => {
    setForm({
      ...EMPTY_LINK,
      order: links.length,
    });

    setEditingIndex(null);
  };

  const handleFormChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleAddLink = () => {
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

    setError("");
    setSuccess("");

    const newLink = {
      platform,
      label,
      url,
      icon,
      enabled: form.enabled !== false,
      order: links.length,
    };

    setLinks((current) => [...current, newLink]);

    setForm({
      ...EMPTY_LINK,
      order: links.length + 1,
    });
  };

  const handleEdit = (index) => {
    const selected = links[index];

    if (!selected) return;

    setError("");
    setSuccess("");

    setEditingIndex(index);

    setForm({
      platform: selected.platform || "",
      label: selected.label || "",
      url: selected.url || "",
      icon: selected.icon || "",
      enabled: selected.enabled !== false,
      order: selected.order ?? index,
    });
  };

  const handleUpdate = () => {
    if (editingIndex === null) return;

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

    setLinks((current) =>
      current.map((link, index) =>
        index === editingIndex
          ? {
              ...link,
              platform,
              label,
              url,
              icon,
              enabled: form.enabled !== false,
            }
          : link,
      ),
    );

    setEditingIndex(null);

    setForm({
      ...EMPTY_LINK,
      order: links.length,
    });

    setError("");
    setSuccess("");
  };

  const handleDelete = (index) => {
    const link = links[index];

    if (!link) return;

    const confirmed = window.confirm(
      `Delete "${link.label || link.platform}" from the portfolio contact links?`,
    );

    if (!confirmed) return;

    setLinks((current) =>
      current
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex,
        })),
    );

    if (editingIndex === index) {
      resetForm();
    }

    setError("");
    setSuccess("");
  };

  const handleToggle = (index) => {
    setLinks((current) =>
      current.map((link, itemIndex) =>
        itemIndex === index
          ? {
              ...link,
              enabled: link.enabled === false,
            }
          : link,
      ),
    );

    setSuccess("");
  };

  const handleSave = async () => {
    if (!profile) {
      setError("Profile settings are not loaded.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const normalizedLinks = links.map((link, index) => ({
        platform: link.platform.trim(),
        label: link.label.trim(),
        url: link.url.trim(),
        icon: link.icon?.trim() || "",
        enabled: link.enabled !== false,
        order: index,
      }));

      const response = await updatePortfolioSettings(
        {
          profile: {
            ...profile,
            socialLinks: normalizedLinks,
          },
        },
        token,
      );

      if (response?.settings?.profile) {
        const savedProfile = response.settings.profile;

        const savedLinks = Array.isArray(savedProfile.socialLinks)
          ? savedProfile.socialLinks.map(normalizeLink)
          : [];

        savedLinks.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        setProfile(savedProfile);
        setLinks(savedLinks);
      } else {
        setProfile((current) => ({
          ...current,
          socialLinks: normalizedLinks,
        }));

        setLinks(normalizedLinks);
      }

      setSuccess("Contact links saved successfully.");
      setEditingIndex(null);
      setForm({
        ...EMPTY_LINK,
        order: normalizedLinks.length,
      });
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
      }

      setError(err?.response?.data?.message || "Failed to save contact links.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="admin-contact-links-management">
        <div className="admin-contact-links-loading">
          <p>Loading contact links...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-contact-links-management">
      <div className="admin-contact-links-header">
        <div className="admin-contact-links-heading">
          <div className="admin-contact-links-icon" aria-hidden="true">
            ↗
          </div>

          <div>
            <h2>Contact Links Management</h2>

            <p>
              Add, edit, or remove your social and professional profile links.
            </p>
          </div>
        </div>

        <div className="admin-contact-links-info">
          <strong>Manage Portfolio Contact Links</strong>

          <span>These links are displayed on your public Contact section.</span>

          <small>Changes are saved to your existing Portfolio Settings.</small>
        </div>
      </div>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}

      {success && (
        <div className="admin-alert admin-alert-success">{success}</div>
      )}

      <div className="admin-contact-links-grid">
        <div className="admin-contact-link-form-card">
          <div className="admin-contact-card-heading">
            <div>
              <h3>
                {editingIndex === null ? "Add New Link" : "Edit Contact Link"}
              </h3>

              <p>Add a social, professional, website, or contact profile.</p>
            </div>

            {editingIndex !== null && (
              <button
                type="button"
                className="admin-contact-secondary-btn"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>

          <div className="admin-contact-form-grid">
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
                placeholder="LinkedIn"
                maxLength={100}
              />
            </div>

            <div className="admin-contact-field admin-contact-field-full">
              <label htmlFor="contact-link-url">URL</label>

              <input
                id="contact-link-url"
                type="text"
                value={form.url}
                onChange={(event) =>
                  handleFormChange("url", event.target.value)
                }
                placeholder="https://www.linkedin.com/in/yourprofile"
                maxLength={500}
              />
            </div>

            <div className="admin-contact-field">
              <label htmlFor="contact-link-icon">
                Icon <span>(Optional)</span>
              </label>

              <input
                id="contact-link-icon"
                type="text"
                value={form.icon}
                onChange={(event) =>
                  handleFormChange("icon", event.target.value)
                }
                placeholder="linkedin"
                maxLength={100}
              />
            </div>

            <label className="admin-contact-enabled-toggle">
              <input
                type="checkbox"
                checked={form.enabled !== false}
                onChange={(event) =>
                  handleFormChange("enabled", event.target.checked)
                }
              />

              <span>Active on portfolio</span>
            </label>
          </div>

          <div className="admin-contact-form-actions">
            {editingIndex === null ? (
              <button
                type="button"
                className="admin-contact-primary-btn"
                onClick={handleAddLink}
              >
                <span aria-hidden="true">+</span>
                Add Link
              </button>
            ) : (
              <button
                type="button"
                className="admin-contact-primary-btn"
                onClick={handleUpdate}
              >
                <span aria-hidden="true">✓</span>
                Update Link
              </button>
            )}
          </div>
        </div>

        <div className="admin-contact-existing-card">
          <div className="admin-contact-card-heading">
            <div>
              <h3>Existing Contact Links</h3>

              <p>
                {activeCount} active link
                {activeCount === 1 ? "" : "s"} available on the portfolio.
              </p>
            </div>

            <span className="admin-contact-count">
              {links.length} {links.length === 1 ? "Link" : "Links"}
            </span>
          </div>

          {links.length === 0 ? (
            <div className="admin-contact-empty">
              <div aria-hidden="true">🔗</div>

              <h4>No contact links added</h4>

              <p>
                Add LinkedIn, GitHub, Instagram, YouTube, Email, or another
                profile from the form.
              </p>
            </div>
          ) : (
            <div className="admin-contact-table-wrapper">
              <table className="admin-contact-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Platform</th>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {links.map((link, index) => (
                    <tr key={`${link.platform}-${index}`}>
                      <td>{index + 1}</td>

                      <td>
                        <div className="admin-contact-platform">
                          <span
                            className="admin-contact-platform-icon"
                            aria-hidden="true"
                          >
                            {link.icon || "↗"}
                          </span>

                          <div>
                            <strong>{link.platform || "Other"}</strong>

                            <small>{link.label || "Profile"}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="admin-contact-url"
                        >
                          {link.url}
                        </a>
                      </td>

                      <td>
                        <button
                          type="button"
                          className={
                            link.enabled !== false
                              ? "admin-contact-status admin-contact-status-active"
                              : "admin-contact-status admin-contact-status-disabled"
                          }
                          onClick={() => handleToggle(index)}
                        >
                          {link.enabled !== false ? "Active" : "Disabled"}
                        </button>
                      </td>

                      <td>
                        <div className="admin-contact-row-actions">
                          <button
                            type="button"
                            className="admin-contact-edit-btn"
                            onClick={() => handleEdit(index)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="admin-contact-delete-btn"
                            onClick={() => handleDelete(index)}
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
        </div>
      </div>

      <div className="admin-contact-save-bar">
        <div>
          <strong>Contact links changes</strong>

          <span>
            Add/edit/delete operations are local until you click Save Changes.
          </span>
        </div>

        <button
          type="button"
          className="admin-contact-save-btn"
          disabled={saving}
          onClick={handleSave}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </section>
  );
}

export default ContactLinksManagement;
