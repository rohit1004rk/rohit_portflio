import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import { fetchHomeAdmin, updateHome } from "../api/api.js";

const normalizeHome = (data) => ({
  ...data,
  hero: {
    eyebrow: data?.hero?.eyebrow || "",
    name: data?.hero?.name || "",
    role: data?.hero?.role || "",
    description: data?.hero?.description || "",
    primaryButtonText: data?.hero?.primaryButtonText || "",
    primaryButtonLink: data?.hero?.primaryButtonLink || "",
    secondaryButtonText: data?.hero?.secondaryButtonText || "",
    secondaryButtonLink: data?.hero?.secondaryButtonLink || "",
  },
  codeShowcase: {
    enabled: data?.codeShowcase?.enabled !== false,
    captionName: data?.codeShowcase?.captionName || "",
    captionRole: data?.codeShowcase?.captionRole || "",
    snippets: Array.isArray(data?.codeShowcase?.snippets)
      ? data.codeShowcase.snippets
      : [],
  },
  featuredProjects: {
    enabled: data?.featuredProjects?.enabled !== false,
    limit: Number(data?.featuredProjects?.limit) || 2,
  },
});

function AdminHomePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [home, setHome] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    loadHome();
  }, [token, navigate]);

  const loadHome = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchHomeAdmin(token);
      setHome(normalizeHome(data));
    } catch (err) {
      console.error("Failed to load Home settings:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load Home settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (section, field, value) => {
    setHome((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));

    setSuccess("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        hero: {
          eyebrow: home.hero.eyebrow.trim(),
          name: home.hero.name.trim(),
          role: home.hero.role.trim(),
          description: home.hero.description.trim(),
          primaryButtonText: home.hero.primaryButtonText.trim(),
          primaryButtonLink: home.hero.primaryButtonLink.trim(),
          secondaryButtonText: home.hero.secondaryButtonText.trim(),
          secondaryButtonLink: home.hero.secondaryButtonLink.trim(),
        },

        codeShowcase: {
          enabled: Boolean(home.codeShowcase.enabled),
          captionName: home.codeShowcase.captionName.trim(),
          captionRole: home.codeShowcase.captionRole.trim(),
          snippets: Array.isArray(home.codeShowcase.snippets)
            ? home.codeShowcase.snippets
            : [],
        },

        featuredProjects: {
          enabled: Boolean(home.featuredProjects.enabled),
          limit: Math.min(
            6,
            Math.max(1, Number(home.featuredProjects.limit) || 2),
          ),
        },
      };

      const data = await updateHome(payload, token);

      setHome(normalizeHome(data.home));
      setSuccess("Home settings saved successfully.");
    } catch (err) {
      console.error("Failed to save Home settings:", err);

      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to save Home settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <>
        <style>{styles}</style>

        <div className="home-admin-loading">
          <div className="home-admin-spinner" />
          <p>Loading Home Management...</p>
        </div>
      </>
    );
  }

  if (!home) {
    return (
      <>
        <style>{styles}</style>

        <div className="home-admin-loading">
          <p>{error || "Home settings are not available."}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>

      <div className="home-admin-layout">
        <AdminSidebar onLogout={logout} />

        <main className="home-admin-main">
          <div className="home-admin-container">
            <header className="home-page-header">
              <div>
                <div className="home-breadcrumb">
                  ADMIN PANEL <span>/</span> HOME
                </div>

                <h1>Home Management</h1>

                <p>
                  Manage the content and presentation of your portfolio Home
                  page.
                </p>
              </div>

              <button
                type="button"
                className="home-dashboard-btn"
                onClick={() => navigate("/admin")}
              >
                <span>←</span>
                Dashboard
              </button>
            </header>

            {(error || success) && (
              <div
                className={`home-alert ${
                  error ? "home-alert-error" : "home-alert-success"
                }`}
              >
                <span className="home-alert-icon">{error ? "!" : "✓"}</span>

                <span>{error || success}</span>
              </div>
            )}

            <form onSubmit={handleSave}>
              {/* HERO / INTRODUCTION */}
              <section className="home-card">
                <div className="home-card-header">
                  <div className="home-section-icon">⌂</div>

                  <div>
                    <div className="home-section-kicker">HERO SECTION</div>

                    <h2>Introduction</h2>

                    <p>
                      Control the main introduction, role and call-to-action
                      buttons shown on your Home page.
                    </p>
                  </div>
                </div>

                <div className="home-form-grid">
                  <label>
                    <span>Eyebrow</span>

                    <input
                      type="text"
                      value={home.hero.eyebrow}
                      onChange={(event) =>
                        handleChange("hero", "eyebrow", event.target.value)
                      }
                      placeholder="FULL STACK + AI/ML DEVELOPER"
                    />
                  </label>

                  <label>
                    <span>Name</span>

                    <input
                      type="text"
                      value={home.hero.name}
                      onChange={(event) =>
                        handleChange("hero", "name", event.target.value)
                      }
                      placeholder="Rohit Kumar"
                    />
                  </label>

                  <label>
                    <span>Role / Highlight</span>

                    <input
                      type="text"
                      value={home.hero.role}
                      onChange={(event) =>
                        handleChange("hero", "role", event.target.value)
                      }
                      placeholder="Full Stack + AI/ML"
                    />
                  </label>

                  <label className="home-wide">
                    <span>Description</span>

                    <textarea
                      rows="5"
                      value={home.hero.description}
                      onChange={(event) =>
                        handleChange("hero", "description", event.target.value)
                      }
                      placeholder="Write the short introduction shown on your Home page..."
                    />
                  </label>
                </div>

                <div className="home-subsection">
                  <div className="home-subsection-title">
                    <span>HERO BUTTONS</span>
                  </div>

                  <div className="home-form-grid">
                    <label>
                      <span>Primary Button Text</span>

                      <input
                        type="text"
                        value={home.hero.primaryButtonText}
                        onChange={(event) =>
                          handleChange(
                            "hero",
                            "primaryButtonText",
                            event.target.value,
                          )
                        }
                        placeholder="View Projects"
                      />
                    </label>

                    <label>
                      <span>Primary Button Link</span>

                      <input
                        type="text"
                        value={home.hero.primaryButtonLink}
                        onChange={(event) =>
                          handleChange(
                            "hero",
                            "primaryButtonLink",
                            event.target.value,
                          )
                        }
                        placeholder="/projects"
                      />
                    </label>

                    <label>
                      <span>Secondary Button Text</span>

                      <input
                        type="text"
                        value={home.hero.secondaryButtonText}
                        onChange={(event) =>
                          handleChange(
                            "hero",
                            "secondaryButtonText",
                            event.target.value,
                          )
                        }
                        placeholder="Contact Me"
                      />
                    </label>

                    <label>
                      <span>Secondary Button Link</span>

                      <input
                        type="text"
                        value={home.hero.secondaryButtonLink}
                        onChange={(event) =>
                          handleChange(
                            "hero",
                            "secondaryButtonLink",
                            event.target.value,
                          )
                        }
                        placeholder="/contact"
                      />
                    </label>
                  </div>
                </div>
              </section>

              {/* CODE SHOWCASE */}
              <section className="home-card">
                <div className="home-card-header">
                  <div className="home-section-icon">{"</>"}</div>

                  <div>
                    <div className="home-section-kicker">CODE SHOWCASE</div>

                    <h2>Developer Showcase</h2>

                    <p>
                      Control the visibility and caption information used by the
                      Home page code showcase.
                    </p>
                  </div>
                </div>

                <div className="home-showcase-status">
                  <label className="home-toggle">
                    <input
                      type="checkbox"
                      checked={home.codeShowcase.enabled}
                      onChange={(event) =>
                        handleChange(
                          "codeShowcase",
                          "enabled",
                          event.target.checked,
                        )
                      }
                    />

                    <span className="home-toggle-track">
                      <span className="home-toggle-thumb" />
                    </span>

                    <span>
                      {home.codeShowcase.enabled
                        ? "Code Showcase Enabled"
                        : "Code Showcase Disabled"}
                    </span>
                  </label>
                </div>

                <div className="home-form-grid">
                  <label>
                    <span>Caption Name</span>

                    <input
                      type="text"
                      value={home.codeShowcase.captionName}
                      onChange={(event) =>
                        handleChange(
                          "codeShowcase",
                          "captionName",
                          event.target.value,
                        )
                      }
                      placeholder="Rohit Kumar"
                    />
                  </label>

                  <label>
                    <span>Caption Role</span>

                    <input
                      type="text"
                      value={home.codeShowcase.captionRole}
                      onChange={(event) =>
                        handleChange(
                          "codeShowcase",
                          "captionRole",
                          event.target.value,
                        )
                      }
                      placeholder="Full Stack + AI/ML Developer"
                    />
                  </label>
                </div>

                <div className="home-info-box">
                  <span>i</span>

                  <p>
                    Code snippets remain part of the Home page showcase.
                    Existing snippet data is preserved and is not replaced by
                    this section.
                  </p>
                </div>
              </section>

              {/* FEATURED PROJECTS */}
              <section className="home-card">
                <div className="home-card-header">
                  <div className="home-section-icon">▣</div>

                  <div>
                    <div className="home-section-kicker">FEATURED PROJECTS</div>

                    <h2>Featured Projects</h2>

                    <p>
                      Control the Featured Projects section without creating a
                      duplicate project editor.
                    </p>
                  </div>
                </div>

                <div className="home-showcase-status">
                  <label className="home-toggle">
                    <input
                      type="checkbox"
                      checked={home.featuredProjects.enabled}
                      onChange={(event) =>
                        handleChange(
                          "featuredProjects",
                          "enabled",
                          event.target.checked,
                        )
                      }
                    />

                    <span className="home-toggle-track">
                      <span className="home-toggle-thumb" />
                    </span>

                    <span>
                      {home.featuredProjects.enabled
                        ? "Featured Projects Enabled"
                        : "Featured Projects Disabled"}
                    </span>
                  </label>
                </div>

                <div className="home-form-grid">
                  <label>
                    <span>Number of Projects</span>

                    <input
                      type="number"
                      min="1"
                      max="6"
                      value={home.featuredProjects.limit}
                      onChange={(event) =>
                        handleChange(
                          "featuredProjects",
                          "limit",
                          Number(event.target.value),
                        )
                      }
                    />

                    <small>
                      Projects themselves are managed from the Projects section.
                    </small>
                  </label>
                </div>
              </section>

              {/* SAVE */}
              <div className="home-form-actions">
                <button
                  type="button"
                  className="home-secondary-btn"
                  onClick={() => navigate("/admin")}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="home-primary-btn"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Home Settings"}
                  <span>→</span>
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

const styles = `
  .home-admin-layout {
    min-height: 100vh;
    width: 100%;
    display: flex;
    background: var(--bg, #0b0f14);
    color: var(--text, #f1f5f9);
  }

  .home-admin-main {
    flex: 1;
    min-width: 0;
    margin-left: 250px;
    padding: 48px 40px 80px;
  }

  .home-admin-container {
    width: min(1240px, 100%);
    margin: 0 auto;
  }

  .home-page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 28px;
    margin-bottom: 28px;
  }

  .home-breadcrumb {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 12px;
    color: var(--teal, #4fd8c4);
    font-family: var(--font-mono, monospace);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
  }

  .home-breadcrumb span {
    color: var(--text-3, #64748b);
  }

  .home-page-header h1 {
    margin: 0;
    color: var(--text, #f1f5f9);
    font-size: clamp(32px, 4vw, 48px);
    line-height: 1.08;
    letter-spacing: -0.035em;
  }

  .home-page-header p {
    margin: 10px 0 0;
    color: var(--text-2, #94a3b8);
    font-size: 15px;
    line-height: 1.6;
  }

  .home-dashboard-btn {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    padding: 10px 16px;
    border: 1px solid var(--border, rgba(148, 163, 184, 0.16));
    border-radius: 9px;
    background: rgba(15, 23, 33, 0.7);
    color: var(--text-2, #94a3b8);
    font-size: 13px;
    font-weight: 600;
    transition: all 180ms ease;
  }

  .home-dashboard-btn:hover {
    border-color: var(--teal, #4fd8c4);
    color: var(--text, #f1f5f9);
    transform: translateY(-1px);
  }

  .home-alert {
    display: flex;
    align-items: center;
    gap: 11px;
    margin-bottom: 20px;
    padding: 13px 15px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
  }

  .home-alert-icon {
    width: 25px;
    height: 25px;
    flex: 0 0 25px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    font-weight: 800;
  }

  .home-alert-error {
    border: 1px solid rgba(255, 107, 107, 0.22);
    background: rgba(255, 107, 107, 0.07);
    color: #ff9b9b;
  }

  .home-alert-error .home-alert-icon {
    background: rgba(255, 107, 107, 0.12);
    color: #ff6b6b;
  }

  .home-alert-success {
    border: 1px solid rgba(79, 216, 196, 0.2);
    background: rgba(79, 216, 196, 0.06);
    color: #8de8db;
  }

  .home-alert-success .home-alert-icon {
    background: rgba(79, 216, 196, 0.12);
    color: var(--teal, #4fd8c4);
  }

  .home-card {
    margin-bottom: 20px;
    padding: 24px;
    border: 1px solid var(--border, rgba(148, 163, 184, 0.14));
    border-radius: 16px;
    background:
      linear-gradient(
        145deg,
        rgba(20, 30, 42, 0.88),
        rgba(12, 19, 28, 0.94)
      );
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.015);
  }

  .home-card-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.09);
    margin-bottom: 22px;
  }

  .home-section-icon {
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    display: grid;
    place-items: center;
    border: 1px solid rgba(79, 216, 196, 0.18);
    border-radius: 11px;
    background: rgba(79, 216, 196, 0.06);
    color: var(--teal, #4fd8c4);
    font-family: var(--font-mono, monospace);
    font-size: 14px;
    font-weight: 800;
  }

  .home-section-kicker {
    margin-bottom: 5px;
    color: var(--teal, #4fd8c4);
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.17em;
  }

  .home-card-header h2 {
    margin: 0;
    color: var(--text, #f1f5f9);
    font-size: 22px;
  }

  .home-card-header p {
    margin: 7px 0 0;
    color: var(--text-2, #94a3b8);
    font-size: 13px;
    line-height: 1.55;
  }

  .home-form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .home-form-grid label {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 7px;
    color: var(--text-2, #94a3b8);
    font-size: 12px;
    font-weight: 600;
  }

  .home-form-grid label > span {
    color: var(--text-2, #94a3b8);
  }

  .home-form-grid input,
  .home-form-grid textarea {
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.14);
    border-radius: 9px;
    outline: none;
    background: rgba(5, 10, 16, 0.68);
    color: var(--text, #f1f5f9);
    font: inherit;
    font-size: 13px;
    transition:
      border-color 160ms ease,
      background 160ms ease,
      box-shadow 160ms ease;
  }

  .home-form-grid input {
    min-height: 43px;
    padding: 10px 12px;
  }

  .home-form-grid textarea {
    min-height: 115px;
    padding: 11px 12px;
    resize: vertical;
    line-height: 1.55;
  }

  .home-form-grid input::placeholder,
  .home-form-grid textarea::placeholder {
    color: #536275;
  }

  .home-form-grid input:focus,
  .home-form-grid textarea:focus {
    border-color: rgba(79, 216, 196, 0.5);
    background: rgba(5, 10, 16, 0.9);
    box-shadow: 0 0 0 3px rgba(79, 216, 196, 0.06);
  }

  .home-wide {
    grid-column: 1 / -1;
  }

  .home-form-grid small {
    color: var(--text-3, #64748b);
    font-size: 11px;
    font-weight: 400;
    line-height: 1.45;
  }

  .home-subsection {
    margin-top: 24px;
    padding-top: 22px;
    border-top: 1px solid rgba(148, 163, 184, 0.09);
  }

  .home-subsection-title {
    margin-bottom: 16px;
    color: var(--text-3, #64748b);
    font-family: var(--font-mono, monospace);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
  }

  .home-showcase-status {
    margin-bottom: 20px;
  }

  .home-toggle {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: var(--text, #f1f5f9);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }

  .home-toggle input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .home-toggle-track {
    position: relative;
    width: 42px;
    height: 24px;
    flex: 0 0 42px;
    border-radius: 999px;
    background: #253140;
    border: 1px solid rgba(148, 163, 184, 0.15);
    transition: background 160ms ease;
  }

  .home-toggle-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #94a3b8;
    transition: transform 160ms ease, background 160ms ease;
  }

  .home-toggle input:checked + .home-toggle-track {
    background: rgba(79, 216, 196, 0.22);
    border-color: rgba(79, 216, 196, 0.38);
  }

  .home-toggle input:checked + .home-toggle-track .home-toggle-thumb {
    transform: translateX(18px);
    background: var(--teal, #4fd8c4);
  }

  .home-info-box {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 18px;
    padding: 12px 14px;
    border: 1px solid rgba(79, 216, 196, 0.12);
    border-radius: 9px;
    background: rgba(79, 216, 196, 0.035);
  }

  .home-info-box > span {
    width: 21px;
    height: 21px;
    flex: 0 0 21px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    background: rgba(79, 216, 196, 0.1);
    color: var(--teal, #4fd8c4);
    font-family: var(--font-mono, monospace);
    font-size: 11px;
    font-weight: 700;
  }

  .home-info-box p {
    margin: 1px 0 0;
    color: var(--text-3, #64748b);
    font-size: 12px;
    line-height: 1.55;
  }

  .home-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 4px;
  }

  .home-secondary-btn,
  .home-primary-btn {
    min-height: 44px;
    padding: 10px 17px;
    border-radius: 9px;
    font-size: 13px;
    font-weight: 700;
    transition: all 160ms ease;
  }

  .home-secondary-btn {
    border: 1px solid rgba(148, 163, 184, 0.15);
    background: transparent;
    color: var(--text-2, #94a3b8);
  }

  .home-secondary-btn:hover {
    border-color: rgba(148, 163, 184, 0.3);
    color: var(--text, #f1f5f9);
  }

  .home-primary-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 9px;
    border: 1px solid var(--accent, #ffb454);
    background: var(--accent, #ffb454);
    color: #0b0f14;
  }

  .home-primary-btn:hover:not(:disabled) {
    background: #ffc06e;
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(255, 180, 84, 0.16);
  }

  .home-primary-btn:disabled {
    opacity: 0.6;
    cursor: wait;
  }

  .home-admin-loading {
    min-height: 100vh;
    display: grid;
    place-items: center;
    align-content: center;
    gap: 12px;
    background: var(--bg, #0b0f14);
    color: var(--text-2, #94a3b8);
  }

  .home-admin-spinner {
    width: 30px;
    height: 30px;
    border: 2px solid rgba(79, 216, 196, 0.14);
    border-top-color: var(--teal, #4fd8c4);
    border-radius: 50%;
    animation: homeAdminSpin 0.8s linear infinite;
  }

  @keyframes homeAdminSpin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 900px) {
    .home-admin-main {
      margin-left: 220px;
      padding: 36px 24px 60px;
    }
  }

  @media (max-width: 700px) {
    .home-admin-layout {
      display: block;
    }

    .home-admin-main {
      width: 100%;
      margin-left: 0;
      padding: 28px 16px 50px;
    }

    .home-page-header {
      flex-direction: column;
    }

    .home-dashboard-btn {
      width: 100%;
      justify-content: center;
    }

    .home-form-grid {
      grid-template-columns: 1fr;
    }

    .home-wide {
      grid-column: auto;
    }

    .home-card {
      padding: 18px;
    }

    .home-form-actions {
      flex-direction: column-reverse;
    }

    .home-secondary-btn,
    .home-primary-btn {
      width: 100%;
    }
  }
`;

export default AdminHomePage;
