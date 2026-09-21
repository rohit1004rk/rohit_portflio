import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import { fetchAboutAdmin, updateAbout } from "../api/api.js";

const defaultAbout = {
  hero: {
    enabled: true,
    eyebrow: "ABOUT",
    title: "Turning problems into software",
    lead: "I'm Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions.",
  },

  introduction: {
    enabled: true,
    paragraph1: "",
    paragraph2: "",
    paragraph3: "",
  },

  focusCards: {
    enabled: true,
    items: [],
  },

  visibility: {
    hero: true,
    introduction: true,
    focusCards: true,
  },
};

const createEmptyCard = (order = 1) => ({
  icon: "✦",
  title: "",
  description: "",
  enabled: true,
  order,
});

function AdminAboutPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [about, setAbout] = useState(defaultAbout);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    loadAbout();
  }, [token, navigate]);

  const loadAbout = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const data = await fetchAboutAdmin(token);

      setAbout({
        hero: {
          ...defaultAbout.hero,
          ...(data?.hero || {}),
        },

        introduction: {
          ...defaultAbout.introduction,
          ...(data?.introduction || {}),
        },

        focusCards: {
          ...defaultAbout.focusCards,
          ...(data?.focusCards || {}),
          items: Array.isArray(data?.focusCards?.items)
            ? data.focusCards.items
            : [],
        },

        visibility: {
          ...defaultAbout.visibility,
          ...(data?.visibility || {}),
        },
      });
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
          "Failed to load About settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHeroChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAbout((current) => ({
      ...current,
      hero: {
        ...current.hero,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleIntroductionChange = (event) => {
    const { name, value, type, checked } = event.target;

    setAbout((current) => ({
      ...current,
      introduction: {
        ...current.introduction,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleVisibilityChange = (event) => {
    const { name, checked } = event.target;

    setAbout((current) => ({
      ...current,
      visibility: {
        ...current.visibility,
        [name]: checked,
      },
    }));
  };

  const handleFocusCardsEnabled = (event) => {
    setAbout((current) => ({
      ...current,
      focusCards: {
        ...current.focusCards,
        enabled: event.target.checked,
      },
    }));
  };

  const handleCardChange = (index, field, value) => {
    setAbout((current) => ({
      ...current,
      focusCards: {
        ...current.focusCards,
        items: current.focusCards.items.map((card, cardIndex) =>
          cardIndex === index
            ? {
                ...card,
                [field]: value,
              }
            : card,
        ),
      },
    }));
  };

  const addFocusCard = () => {
    setAbout((current) => ({
      ...current,
      focusCards: {
        ...current.focusCards,
        items: [
          ...current.focusCards.items,
          createEmptyCard(current.focusCards.items.length + 1),
        ],
      },
    }));
  };

  const removeFocusCard = (index) => {
    setAbout((current) => ({
      ...current,
      focusCards: {
        ...current.focusCards,
        items: current.focusCards.items
          .filter((_, cardIndex) => cardIndex !== index)
          .map((card, cardIndex) => ({
            ...card,
            order: cardIndex + 1,
          })),
      },
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        hero: {
          enabled: Boolean(about.hero.enabled),
          eyebrow: String(about.hero.eyebrow || "").trim(),
          title: String(about.hero.title || "").trim(),
          lead: String(about.hero.lead || "").trim(),
        },

        introduction: {
          enabled: Boolean(about.introduction.enabled),
          paragraph1: String(about.introduction.paragraph1 || "").trim(),
          paragraph2: String(about.introduction.paragraph2 || "").trim(),
          paragraph3: String(about.introduction.paragraph3 || "").trim(),
        },

        focusCards: {
          enabled: Boolean(about.focusCards.enabled),
          items: about.focusCards.items.map((card, index) => ({
            icon: String(card.icon || "✦").trim(),
            title: String(card.title || "").trim(),
            description: String(card.description || "").trim(),
            enabled: Boolean(card.enabled),
            order: Math.max(0, Number(card.order) || index + 1),
          })),
        },

        visibility: {
          hero: Boolean(about.visibility.hero),
          introduction: Boolean(about.visibility.introduction),
          focusCards: Boolean(about.visibility.focusCards),
        },
      };

      await updateAbout(payload, token);

      setSuccess("About settings saved successfully.");

      await loadAbout();
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
          "Failed to save About settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="about-admin-loading">
        <div className="about-admin-loading-card">
          <div className="about-admin-loading-mark">ABOUT</div>

          <h2>Loading About Settings</h2>

          <p>Please wait while your existing About content is loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{responsiveStyles}</style>

      <div className="about-admin-page">
        <AdminSidebar onLogout={handleLogout} />

        <main className="about-admin-main">
          <div className="about-admin-container">
            {/* PAGE HEADER */}
            <header className="about-admin-header">
              <div className="about-admin-heading">
                <div className="about-admin-eyebrow">ADMIN / ABOUT</div>

                <h1>About Section</h1>

                <p>
                  Manage the content and visibility of your public About page
                  without changing Projects, Skills, Experience, Education,
                  Certificates, or Blog data.
                </p>
              </div>

              <div className="about-admin-header-action">
                <button
                  type="submit"
                  form="about-admin-form"
                  disabled={saving}
                  className="about-save-button"
                >
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                  {!saving && <span>→</span>}
                </button>
              </div>
            </header>

            {/* STATUS */}
            {error ? (
              <div className="about-alert about-alert-error">
                <strong>Error</strong>
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="about-alert about-alert-success">
                <span className="about-success-dot" />
                <span>{success}</span>
              </div>
            ) : null}

            <form
              id="about-admin-form"
              onSubmit={handleSave}
              className="about-admin-form"
            >
              {/* =====================================================
                  01 — HERO
              ====================================================== */}
              <section className="about-section">
                <SectionHeader
                  number="01"
                  title="About Page Hero"
                  description="Control the main heading and introductory text shown at the top of the About page."
                  enabled={about.hero.enabled}
                  onEnabledChange={handleHeroChange}
                  enabledName="enabled"
                />

                <div className="about-field-grid">
                  <Field
                    label="Eyebrow"
                    name="eyebrow"
                    value={about.hero.eyebrow}
                    onChange={handleHeroChange}
                    placeholder="ABOUT"
                  />

                  <Field
                    label="Title"
                    name="title"
                    value={about.hero.title}
                    onChange={handleHeroChange}
                    placeholder="Turning problems into software"
                  />

                  <TextAreaField
                    wrapperClassName="about-field-full"
                    label="Lead / Intro"
                    name="lead"
                    value={about.hero.lead}
                    onChange={handleHeroChange}
                    placeholder="Write the short introduction shown below the About heading."
                    rows={4}
                  />
                </div>
              </section>

              {/* =====================================================
                  02 — INTRODUCTION
              ====================================================== */}
              <section className="about-section">
                <SectionHeader
                  number="02"
                  title="About Introduction"
                  description="Manage the three existing paragraphs used in the main About introduction."
                  enabled={about.introduction.enabled}
                  onEnabledChange={handleIntroductionChange}
                  enabledName="enabled"
                />

                <div className="about-introduction-list">
                  <TextAreaField
                    label="Paragraph 1"
                    name="paragraph1"
                    value={about.introduction.paragraph1}
                    onChange={handleIntroductionChange}
                    placeholder="About introduction paragraph 1"
                    rows={5}
                    numbered
                    number="01"
                  />

                  <TextAreaField
                    label="Paragraph 2"
                    name="paragraph2"
                    value={about.introduction.paragraph2}
                    onChange={handleIntroductionChange}
                    placeholder="About introduction paragraph 2"
                    rows={5}
                    numbered
                    number="02"
                  />

                  <TextAreaField
                    label="Paragraph 3"
                    name="paragraph3"
                    value={about.introduction.paragraph3}
                    onChange={handleIntroductionChange}
                    placeholder="About introduction paragraph 3"
                    rows={5}
                    numbered
                    number="03"
                  />
                </div>
              </section>

              {/* =====================================================
                  03 — FOCUS CARDS
              ====================================================== */}
              <section className="about-section">
                <SectionHeader
                  number="03"
                  title="About Focus Cards"
                  description="Manage the existing About focus cards. Each card can be enabled, edited, reordered, or extended."
                  enabled={about.focusCards.enabled}
                  onEnabledChange={handleFocusCardsEnabled}
                />

                {about.focusCards.items.length === 0 ? (
                  <div className="about-empty-state">
                    <div className="about-empty-icon">✦</div>

                    <strong>No focus cards found</strong>

                    <span>Add your first About focus card below.</span>
                  </div>
                ) : (
                  <div className="about-focus-grid">
                    {about.focusCards.items.map((card, index) => (
                      <article
                        key={card._id || index}
                        className="about-focus-card"
                      >
                        <div className="about-focus-card-top">
                          <div className="about-focus-card-index">
                            CARD {String(index + 1).padStart(2, "0")}
                          </div>

                          <label className="about-switch">
                            <input
                              type="checkbox"
                              checked={card.enabled !== false}
                              onChange={(event) =>
                                handleCardChange(
                                  index,
                                  "enabled",
                                  event.target.checked,
                                )
                              }
                            />

                            <span className="about-switch-track">
                              <span className="about-switch-thumb" />
                            </span>

                            <span>Enabled</span>
                          </label>
                        </div>

                        <div className="about-focus-preview">
                          <div className="about-focus-icon">
                            {card.icon || "✦"}
                          </div>

                          <div>
                            <div className="about-focus-title">
                              {card.title || "Untitled Card"}
                            </div>

                            <div className="about-focus-order">
                              Display order {card.order ?? index + 1}
                            </div>
                          </div>
                        </div>

                        <div className="about-card-fields">
                          <Field
                            label="Icon"
                            value={card.icon || ""}
                            onChange={(event) =>
                              handleCardChange(
                                index,
                                "icon",
                                event.target.value,
                              )
                            }
                            placeholder="👤"
                          />

                          <Field
                            label="Title"
                            value={card.title || ""}
                            onChange={(event) =>
                              handleCardChange(
                                index,
                                "title",
                                event.target.value,
                              )
                            }
                            placeholder="Who I Am"
                          />

                          <TextAreaField
                            wrapperClassName="about-field-full"
                            label="Description"
                            value={card.description || ""}
                            onChange={(event) =>
                              handleCardChange(
                                index,
                                "description",
                                event.target.value,
                              )
                            }
                            placeholder="Focus card description"
                            rows={4}
                          />

                          <Field
                            label="Display Order"
                            type="number"
                            value={card.order ?? index + 1}
                            onChange={(event) =>
                              handleCardChange(
                                index,
                                "order",
                                event.target.value,
                              )
                            }
                            min="0"
                          />
                        </div>

                        <div className="about-focus-card-footer">
                          <span>
                            Changes are saved with the main Save button.
                          </span>

                          <button
                            type="button"
                            onClick={() => removeFocusCard(index)}
                            className="about-remove-button"
                          >
                            Remove Card
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addFocusCard}
                  className="about-add-button"
                >
                  <span>+</span>
                  <span>Add Focus Card</span>
                </button>
              </section>

              {/* =====================================================
                  04 — VISIBILITY
              ====================================================== */}
              <section className="about-section">
                <SectionHeader
                  number="04"
                  title="About Visibility"
                  description="Control which major About sections are visible on the public page."
                  showToggle={false}
                />

                <div className="about-visibility-grid">
                  <VisibilityControl
                    label="Hero Section"
                    description="Show the About page hero."
                    checked={about.visibility.hero}
                    onChange={handleVisibilityChange}
                    name="hero"
                    icon="01"
                  />

                  <VisibilityControl
                    label="Introduction"
                    description="Show the main About introduction."
                    checked={about.visibility.introduction}
                    onChange={handleVisibilityChange}
                    name="introduction"
                    icon="02"
                  />

                  <VisibilityControl
                    label="Focus Cards"
                    description="Show the About focus cards."
                    checked={about.visibility.focusCards}
                    onChange={handleVisibilityChange}
                    name="focusCards"
                    icon="03"
                  />
                </div>
              </section>

              {/* BOTTOM ACTION */}
              <div className="about-bottom-actions">
                <div>
                  <strong>Ready to publish your changes?</strong>
                  <span>Save once after reviewing all About sections.</span>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="about-save-button about-save-button-bottom"
                >
                  <span>{saving ? "Saving..." : "Save About Settings"}</span>
                  {!saving && <span>→</span>}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </>
  );
}

function SectionHeader({
  number,
  title,
  description,
  enabled,
  onEnabledChange,
  enabledName,
  showToggle = true,
}) {
  return (
    <div className="about-section-header">
      <div className="about-section-heading">
        <div className="about-section-number">{number}</div>

        <div>
          <h2>{title}</h2>

          <p>{description}</p>
        </div>
      </div>

      {showToggle ? (
        <label className="about-switch">
          <input
            type="checkbox"
            name={enabledName}
            checked={Boolean(enabled)}
            onChange={onEnabledChange}
          />

          <span className="about-switch-track">
            <span className="about-switch-thumb" />
          </span>

          <span>Enabled</span>
        </label>
      ) : null}
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}) {
  return (
    <div className="about-field">
      <label htmlFor={name}>{label}</label>

      <input
        id={name}
        name={name}
        type={type}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  rows = 5,
  wrapperClassName = "",
  numbered = false,
  number,
}) {
  return (
    <div className={`about-field ${wrapperClassName}`}>
      <div className="about-field-label-row">
        <label htmlFor={name}>{label}</label>

        {numbered ? <span className="about-field-number">{number}</span> : null}
      </div>

      <textarea
        id={name}
        name={name}
        value={value ?? ""}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  );
}

function VisibilityControl({
  label,
  description,
  checked,
  onChange,
  name,
  icon,
}) {
  return (
    <label
      className={`about-visibility-card ${
        checked ? "is-visible" : "is-hidden"
      }`}
    >
      <div className="about-visibility-left">
        <div className="about-visibility-icon">{icon}</div>

        <div>
          <strong>{label}</strong>
          <span>{description}</span>
        </div>
      </div>

      <div className="about-switch">
        <input
          type="checkbox"
          name={name}
          checked={Boolean(checked)}
          onChange={onChange}
        />

        <span className="about-switch-track">
          <span className="about-switch-thumb" />
        </span>
      </div>
    </label>
  );
}

const responsiveStyles = `
  * {
    box-sizing: border-box;
  }

  .about-admin-page {
    min-height: 100vh;
    display: flex;
    color: #e8eef7;
    background:
      radial-gradient(
        circle at 70% 0%,
        rgba(45, 212, 191, 0.055),
        transparent 28%
      ),
      #07111f;
  }

  .about-admin-main {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  margin-left: 250px;
  padding: 28px 30px 48px;
}
  .about-admin-container {
    width: 100%;
    max-width: 1320px;
    margin: 0 auto;
  }

  /* -------------------------------------------------------
     HEADER
  ------------------------------------------------------- */

  .about-admin-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 28px;
    padding: 4px 2px 24px;
    margin-bottom: 8px;
    border-bottom: 1px solid rgba(148, 163, 184, 0.10);
  }

  .about-admin-heading {
    min-width: 0;
  }

  .about-admin-eyebrow {
    margin-bottom: 7px;
    color: #5eead4;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.15em;
  }

  .about-admin-heading h1 {
    margin: 0;
    color: #f8fafc;
    font-size: clamp(28px, 3vw, 38px);
    line-height: 1.1;
    letter-spacing: -0.035em;
  }

  .about-admin-heading p {
    max-width: 760px;
    margin: 10px 0 0;
    color: #8294aa;
    font-size: 13px;
    line-height: 1.65;
  }

  .about-admin-header-action {
    flex-shrink: 0;
  }

  .about-save-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-height: 42px;
    padding: 0 17px;
    border: 1px solid rgba(94, 234, 212, 0.30);
    border-radius: 10px;
    background: rgba(20, 184, 166, 0.13);
    color: #99f6e4;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
    transition:
      transform 160ms ease,
      background 160ms ease,
      border-color 160ms ease;
  }

  .about-save-button:hover:not(:disabled) {
    transform: translateY(-1px);
    background: rgba(20, 184, 166, 0.19);
    border-color: rgba(94, 234, 212, 0.45);
  }

  .about-save-button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  /* -------------------------------------------------------
     ALERTS
  ------------------------------------------------------- */

  .about-alert {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 18px 0;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.5;
  }

  .about-alert-error {
    border: 1px solid rgba(248, 113, 113, 0.22);
    background: rgba(127, 29, 29, 0.14);
    color: #fca5a5;
  }

  .about-alert-success {
    border: 1px solid rgba(52, 211, 153, 0.20);
    background: rgba(6, 78, 59, 0.15);
    color: #86efac;
  }

  .about-success-dot {
    width: 7px;
    height: 7px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 0 4px rgba(74, 222, 128, 0.08);
  }

  /* -------------------------------------------------------
     FORM
  ------------------------------------------------------- */

  .about-admin-form {
    display: grid;
    gap: 16px;
  }

  .about-section {
    padding: 22px;
    border: 1px solid rgba(148, 163, 184, 0.115);
    border-radius: 16px;
    background: rgba(10, 23, 39, 0.76);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.11);
  }

  .about-section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    margin-bottom: 20px;
  }

  .about-section-heading {
    display: flex;
    align-items: flex-start;
    gap: 13px;
    min-width: 0;
  }

  .about-section-number {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border: 1px solid rgba(94, 234, 212, 0.18);
    border-radius: 8px;
    background: rgba(20, 184, 166, 0.07);
    color: #5eead4;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.04em;
  }

  .about-section-heading h2 {
    margin: 2px 0 0;
    color: #f8fafc;
    font-size: 18px;
    line-height: 1.25;
    letter-spacing: -0.015em;
  }

  .about-section-heading p {
    max-width: 760px;
    margin: 5px 0 0;
    color: #778aa1;
    font-size: 12px;
    line-height: 1.55;
  }

  /* -------------------------------------------------------
     SWITCH
  ------------------------------------------------------- */

  .about-switch {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
    color: #aebdce;
    font-size: 11px;
    font-weight: 750;
    cursor: pointer;
    user-select: none;
  }

  .about-switch input {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .about-switch-track {
    position: relative;
    display: block;
    width: 34px;
    height: 19px;
    border-radius: 999px;
    background: #253449;
    border: 1px solid rgba(148, 163, 184, 0.18);
    transition:
      background 160ms ease,
      border-color 160ms ease;
  }

  .about-switch-thumb {
    position: absolute;
    top: 3px;
    left: 3px;
    width: 11px;
    height: 11px;
    border-radius: 50%;
    background: #94a3b8;
    transition:
      transform 160ms ease,
      background 160ms ease;
  }

  .about-switch input:checked + .about-switch-track {
    background: rgba(20, 184, 166, 0.45);
    border-color: rgba(94, 234, 212, 0.38);
  }

  .about-switch input:checked + .about-switch-track .about-switch-thumb {
    transform: translateX(15px);
    background: #5eead4;
  }

  /* -------------------------------------------------------
     FIELDS
  ------------------------------------------------------- */

  .about-field-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .about-field-full {
    grid-column: 1 / -1;
  }

  .about-field {
    min-width: 0;
  }

  .about-field > label,
  .about-field-label-row label {
    display: block;
    margin-bottom: 7px;
    color: #c4d0df;
    font-size: 11px;
    font-weight: 750;
  }

  .about-field-label-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }

  .about-field-label-row label {
    margin-bottom: 7px;
  }

  .about-field-number {
    margin-bottom: 7px;
    color: #52647b;
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  .about-field input,
  .about-field textarea {
    width: 100%;
    border: 1px solid rgba(148, 163, 184, 0.14);
    outline: none;
    border-radius: 9px;
    background: rgba(2, 9, 18, 0.60);
    color: #f1f5f9;
    font-family: inherit;
    font-size: 13px;
    transition:
      border-color 160ms ease,
      background 160ms ease,
      box-shadow 160ms ease;
  }

  .about-field input {
    min-height: 42px;
    padding: 0 12px;
  }

  .about-field textarea {
    display: block;
    min-height: 105px;
    padding: 11px 12px;
    resize: vertical;
    line-height: 1.6;
  }

  .about-field input::placeholder,
  .about-field textarea::placeholder {
    color: #43546a;
  }

  .about-field input:focus,
  .about-field textarea:focus {
    border-color: rgba(94, 234, 212, 0.42);
    background: rgba(2, 10, 20, 0.78);
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.06);
  }

  .about-introduction-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }

  .about-introduction-list .about-field textarea {
    min-height: 145px;
  }

  /* -------------------------------------------------------
     FOCUS CARDS
  ------------------------------------------------------- */

  .about-focus-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }

  .about-focus-card {
    min-width: 0;
    padding: 17px;
    border: 1px solid rgba(148, 163, 184, 0.11);
    border-radius: 13px;
    background: rgba(3, 10, 20, 0.38);
  }

  .about-focus-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 15px;
    margin-bottom: 14px;
  }

  .about-focus-card-index {
    color: #5f7188;
    font-size: 9px;
    font-weight: 850;
    letter-spacing: 0.14em;
  }

  .about-focus-preview {
    display: flex;
    align-items: center;
    gap: 11px;
    min-height: 52px;
    margin-bottom: 15px;
    padding: 10px 11px;
    border: 1px solid rgba(148, 163, 184, 0.08);
    border-radius: 10px;
    background: rgba(15, 31, 50, 0.58);
  }

  .about-focus-icon {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    border-radius: 9px;
    background: rgba(20, 184, 166, 0.09);
    color: #5eead4;
    font-size: 17px;
  }

  .about-focus-title {
    overflow: hidden;
    color: #edf4fb;
    font-size: 13px;
    font-weight: 750;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .about-focus-order {
    margin-top: 3px;
    color: #64758b;
    font-size: 10px;
  }

  .about-card-fields {
    display: grid;
    grid-template-columns: minmax(80px, 0.55fr) minmax(0, 1.45fr);
    gap: 13px;
  }

  .about-card-fields .about-field-full {
    grid-column: 1 / -1;
  }

  .about-focus-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 14px;
    padding-top: 13px;
    border-top: 1px solid rgba(148, 163, 184, 0.08);
  }

  .about-focus-card-footer > span {
    color: #52647a;
    font-size: 10px;
    line-height: 1.4;
  }

  .about-remove-button {
    flex-shrink: 0;
    min-height: 31px;
    padding: 0 10px;
    border: 1px solid rgba(248, 113, 113, 0.20);
    border-radius: 8px;
    background: rgba(127, 29, 29, 0.12);
    color: #fca5a5;
    font-size: 10px;
    font-weight: 750;
    cursor: pointer;
  }

  .about-remove-button:hover {
    background: rgba(127, 29, 29, 0.20);
  }

  .about-add-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 37px;
    margin-top: 15px;
    padding: 0 13px;
    border: 1px solid rgba(94, 234, 212, 0.22);
    border-radius: 9px;
    background: rgba(20, 184, 166, 0.07);
    color: #5eead4;
    font-size: 11px;
    font-weight: 800;
    cursor: pointer;
  }

  .about-add-button span:first-child {
    font-size: 17px;
    line-height: 1;
  }

  .about-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 160px;
    padding: 25px;
    border: 1px dashed rgba(148, 163, 184, 0.15);
    border-radius: 12px;
    text-align: center;
  }

  .about-empty-icon {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    margin-bottom: 9px;
    border-radius: 10px;
    background: rgba(20, 184, 166, 0.08);
    color: #5eead4;
  }

  .about-empty-state strong {
    color: #dce6f1;
    font-size: 12px;
  }

  .about-empty-state span {
    margin-top: 4px;
    color: #64758b;
    font-size: 10px;
  }

  /* -------------------------------------------------------
     VISIBILITY
  ------------------------------------------------------- */

  .about-visibility-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
  }

  .about-visibility-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-width: 0;
    padding: 14px;
    border: 1px solid rgba(148, 163, 184, 0.10);
    border-radius: 11px;
    background: rgba(3, 10, 20, 0.36);
    cursor: pointer;
    transition:
      border-color 160ms ease,
      background 160ms ease;
  }

  .about-visibility-card.is-visible {
    border-color: rgba(94, 234, 212, 0.16);
    background: rgba(20, 184, 166, 0.045);
  }

  .about-visibility-card.is-hidden {
    opacity: 0.72;
  }

  .about-visibility-left {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  .about-visibility-icon {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border: 1px solid rgba(148, 163, 184, 0.10);
    border-radius: 8px;
    background: rgba(148, 163, 184, 0.05);
    color: #7d90a7;
    font-size: 9px;
    font-weight: 850;
  }

  .about-visibility-left strong {
    display: block;
    color: #e2e8f0;
    font-size: 11px;
  }

  .about-visibility-left span {
    display: block;
    margin-top: 3px;
    color: #64758b;
    font-size: 9px;
    line-height: 1.4;
  }

  /* -------------------------------------------------------
     BOTTOM SAVE
  ------------------------------------------------------- */

  .about-bottom-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 17px 18px;
    border: 1px solid rgba(94, 234, 212, 0.13);
    border-radius: 13px;
    background: rgba(12, 30, 43, 0.58);
  }

  .about-bottom-actions > div {
    min-width: 0;
  }

  .about-bottom-actions strong {
    display: block;
    color: #dce7f2;
    font-size: 12px;
  }

  .about-bottom-actions span {
    display: block;
    margin-top: 3px;
    color: #64788e;
    font-size: 10px;
  }

  .about-save-button-bottom {
    flex-shrink: 0;
  }

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  .about-admin-loading {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 24px;
    background: #07111f;
    color: #e5edf7;
  }

  .about-admin-loading-card {
    width: min(420px, 100%);
    padding: 30px;
    border: 1px solid rgba(148, 163, 184, 0.13);
    border-radius: 16px;
    background: rgba(12, 25, 42, 0.82);
    text-align: center;
  }

  .about-admin-loading-mark {
    margin-bottom: 10px;
    color: #5eead4;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.16em;
  }

  .about-admin-loading-card h2 {
    margin: 0;
    color: #f8fafc;
    font-size: 18px;
  }

  .about-admin-loading-card p {
    margin: 8px 0 0;
    color: #718198;
    font-size: 12px;
  }

  /* -------------------------------------------------------
     RESPONSIVE
  ------------------------------------------------------- */

  @media (max-width: 1180px) {
    .about-introduction-list {
      grid-template-columns: 1fr;
    }

    .about-introduction-list .about-field textarea {
      min-height: 115px;
    }

    .about-focus-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 900px) {
    .about-admin-main {
      padding: 22px 20px 40px;
    }

    .about-admin-header {
      align-items: flex-start;
      flex-direction: column;
    }

    .about-admin-header-action {
      width: 100%;
    }

    .about-admin-header-action .about-save-button {
      width: 100%;
    }

    .about-field-grid {
      grid-template-columns: 1fr;
    }

    .about-field-full {
      grid-column: auto;
    }

    .about-visibility-grid {
      grid-template-columns: 1fr;
    }
  }
@media (max-width: 680px) {
  .about-admin-page {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .about-admin-page .admin-sidebar {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    height: auto;
    max-height: none;
    border-right: 0;
    border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  }

  .about-admin-page .admin-sidebar-nav {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr;
    gap: 6px;
    padding: 12px;
    box-sizing: border-box;
  }

  .about-admin-page .admin-sidebar-link,
  .about-admin-page .admin-sidebar-logout {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
  }

  .about-admin-main {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    margin-left: 0;
    padding: 18px 14px 30px;
    box-sizing: border-box;
    overflow-x: hidden;
  }

  .about-section {
    padding: 16px;
    border-radius: 13px;
  }

  .about-section-header {
    flex-direction: column;
    gap: 13px;
  }

  .about-section-header > .about-switch {
    align-self: flex-start;
  }

  .about-card-fields {
    grid-template-columns: 1fr;
  }

  .about-card-fields .about-field-full {
    grid-column: auto;
  }

  .about-focus-card-footer,
  .about-bottom-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .about-remove-button,
  .about-save-button-bottom {
    width: 100%;
  }

  .about-admin-heading h1 {
    font-size: 28px;
  }

  .about-admin-heading p {
    font-size: 12px;
  }
}

    .about-section {
      padding: 16px;
      border-radius: 13px;
    }

    .about-section-header {
      flex-direction: column;
      gap: 13px;
    }

    .about-section-header > .about-switch {
      align-self: flex-start;
    }

    .about-card-fields {
      grid-template-columns: 1fr;
    }

    .about-card-fields .about-field-full {
      grid-column: auto;
    }

    .about-focus-card-footer,
    .about-bottom-actions {
      align-items: flex-start;
      flex-direction: column;
    }

    .about-remove-button,
    .about-save-button-bottom {
      width: 100%;
    }

    .about-admin-heading h1 {
      font-size: 28px;
    }

    .about-admin-heading p {
      font-size: 12px;
    }
  }
`;

export default AdminAboutPage;
