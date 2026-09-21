import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import { fetchPortfolioSettings, updatePortfolioSettings } from "../api/api.js";

const defaultSettings = {
  profile: {
    name: "Rohit Kumar",
    headline: "Full Stack + AI/ML Developer",
    eyebrow: "FULL STACK + AI/ML DEVELOPER",
    shortBio: "",
    fullBio: "",
    profilePhoto: "",
    resume: "",
    email: "",
    phone: "",
    location: "",
    socialLinks: [],
    openToWork: false,
  },

  site: {
    title: "Rohit Kumar | Full Stack + AI/ML Developer",
    metaDescription: "",
    ogImage: "",
    defaultTheme: "dark",
    customDomain: "",
  },

  branding: {
    brandName: "Rohit Kumar",
    brandText: "FULL STACK + AI/ML",
    logo: "",
    logoMark: "",
    lightLogo: "",
    darkLogo: "",
    accentColor: "",
    favicon: "",
  },

  homepage: {
    heroTitle: "",
    heroSubtitle: "",
    heroDescription: "",
    primaryCta: {
      label: "View Projects",
      url: "/projects",
      style: "primary",
      enabled: true,
    },
    secondaryCta: {
      label: "Contact Me",
      url: "/contact",
      style: "secondary",
      enabled: true,
    },
    showStats: true,
    showAvailability: true,
    featuredProjectCount: 3,
    sections: {
      hero: true,
      about: true,
      skills: true,
      experience: true,
      projects: true,
      achievements: true,
      education: true,
      certificates: true,
      testimonials: false,
      blog: false,
      contact: true,
    },
  },

  navigation: {
    enabled: true,
    items: [
      { id: "home", label: "Home", url: "/", enabled: true, order: 0 },
      { id: "about", label: "About", url: "/about", enabled: true, order: 1 },
      {
        id: "skills",
        label: "Skills",
        url: "/skills",
        enabled: true,
        order: 2,
      },
      {
        id: "projects",
        label: "Projects",
        url: "/projects",
        enabled: true,
        order: 3,
      },
      {
        id: "experience",
        label: "Experience",
        url: "/experience",
        enabled: true,
        order: 4,
      },
      {
        id: "achievements",
        label: "Achievements",
        url: "/achievements",
        enabled: true,
        order: 5,
      },
      {
        id: "education",
        label: "Education",
        url: "/education",
        enabled: true,
        order: 6,
      },
      {
        id: "resume",
        label: "Resume",
        url: "/resume",
        enabled: true,
        order: 7,
      },
      {
        id: "contact",
        label: "Contact",
        url: "/contact",
        enabled: true,
        order: 8,
      },
    ],
  },

  contact: {
    enabled: true,
    successMessage:
      "Your message has been sent successfully. I will get back to you soon.",
    formCategories: ["General", "Project", "Job Opportunity", "Collaboration"],
    notificationEmail: "",
    enableEmailNotification: true,
    enableHoneypot: true,
    enableCaptcha: false,
    rateLimitEnabled: true,
    rateLimitWindowMinutes: 15,
    rateLimitMaxRequests: 20,
  },

  seo: {
    canonicalUrl: "",
    robotsIndex: true,
    robotsFollow: true,
    keywords: [],
    author: "Rohit Kumar",
    ogTitle: "",
    ogDescription: "",
    twitterCard: "summary_large_image",
  },

  features: {
    contactEnabled: true,
    projectsEnabled: true,
    skillsEnabled: true,
    experienceEnabled: true,
    educationEnabled: true,
    certificatesEnabled: true,
    achievementsEnabled: true,
    testimonialsEnabled: false,
    blogEnabled: false,
    chatbotEnabled: false,
    analyticsEnabled: false,
    maintenanceMode: false,
  },

  integrations: {
    github: {
      enabled: false,
      username: "",
    },
    linkedin: {
      enabled: false,
      profileUrl: "",
    },
    googleAnalytics: {
      enabled: false,
      measurementId: "",
    },
    googleSearchConsole: {
      enabled: false,
      verificationCode: "",
    },
    cloudinary: {
      enabled: false,
    },
  },

  privacy: {
    showEmail: true,
    showPhone: true,
    showLocation: true,
    showSocialLinks: true,
    allowContactForm: true,
    showAvailability: true,
    cookieNoticeEnabled: false,
    privacyPolicyUrl: "",
    termsUrl: "",
  },

  contentControls: {
    projects: {
      manageEnabled: true,
      reorderEnabled: true,
      deleteConfirmationRequired: true,
    },
    skills: {
      manageEnabled: true,
      reorderEnabled: true,
      deleteConfirmationRequired: true,
    },
    experience: {
      manageEnabled: true,
      reorderEnabled: true,
      deleteConfirmationRequired: true,
    },
    education: {
      manageEnabled: true,
      reorderEnabled: true,
      deleteConfirmationRequired: true,
    },
    certificates: {
      manageEnabled: true,
      reorderEnabled: true,
      deleteConfirmationRequired: true,
    },
    achievements: {
      manageEnabled: true,
      reorderEnabled: true,
      deleteConfirmationRequired: true,
    },
    testimonials: {
      manageEnabled: true,
      reorderEnabled: true,
      deleteConfirmationRequired: true,
    },
    blog: {
      manageEnabled: true,
      reorderEnabled: true,
      deleteConfirmationRequired: true,
    },
  },

  controlCenter: {
    confirmDestructiveActions: true,
    requireSaveConfirmation: false,
    showAdvancedControls: true,
    auditLogEnabled: true,
    backupBeforeReset: true,
    maxRevisionEntries: 50,
  },
  footer: {
    enabled: true,
    copyrightText: "© {year} Rohit Kumar. All rights reserved.",
    tagline: "FULL STACK + AI/ML DEVELOPER",
    showSocialLinks: true,
    showEmail: true,
    showAdminLink: true,
  },
  settingsVersion: 1,
};

const tabs = [
  { id: "profile", label: "Profile & Identity", icon: "👤" },
  { id: "branding", label: "Branding", icon: "🎨" },
  { id: "site", label: "Website & SEO", icon: "🌐" },
  { id: "homepage", label: "Homepage", icon: "🏠" },
  { id: "navigation", label: "Navigation", icon: "🧭" },
  { id: "contact", label: "Contact", icon: "✉️" },
  { id: "features", label: "Features", icon: "⚡" },
  { id: "integrations", label: "Integrations", icon: "🔌" },
  { id: "privacy", label: "Privacy", icon: "🔒" },
  { id: "content", label: "Content Management", icon: "🗂️" },
  { id: "advanced", label: "Advanced / Control Center", icon: "⚙️" },
  { id: "footer", label: "Footer", icon: "📌" },
];

const sectionLabels = {
  hero: "Hero",
  about: "About",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  achievements: "Achievements",
  education: "Education",
  certificates: "Certificates",
  testimonials: "Testimonials",
  blog: "Blog",
  contact: "Contact",
};

const cloneDefaults = () => JSON.parse(JSON.stringify(defaultSettings));

function mergeSettings(data) {
  const defaults = cloneDefaults();

  return {
    ...defaults,
    ...data,

    profile: {
      ...defaults.profile,
      ...(data?.profile || {}),
      socialLinks: Array.isArray(data?.profile?.socialLinks)
        ? data.profile.socialLinks
        : [],
    },

    site: {
      ...defaults.site,
      ...(data?.site || {}),
    },

    branding: {
      ...defaults.branding,
      ...(data?.branding || {}),
    },

    homepage: {
      ...defaults.homepage,
      ...(data?.homepage || {}),
      primaryCta: {
        ...defaults.homepage.primaryCta,
        ...(data?.homepage?.primaryCta || {}),
      },
      secondaryCta: {
        ...defaults.homepage.secondaryCta,
        ...(data?.homepage?.secondaryCta || {}),
      },
      sections: {
        ...defaults.homepage.sections,
        ...(data?.homepage?.sections || {}),
      },
    },

    navigation: {
      ...defaults.navigation,
      ...(data?.navigation || {}),
      items: Array.isArray(data?.navigation?.items)
        ? data.navigation.items
        : defaults.navigation.items,
    },

    contact: {
      ...defaults.contact,
      ...(data?.contact || {}),
      formCategories: Array.isArray(data?.contact?.formCategories)
        ? data.contact.formCategories
        : defaults.contact.formCategories,
    },

    seo: {
      ...defaults.seo,
      ...(data?.seo || {}),
      keywords: Array.isArray(data?.seo?.keywords) ? data.seo.keywords : [],
    },

    features: {
      ...defaults.features,
      ...(data?.features || {}),
    },

    integrations: {
      ...defaults.integrations,
      ...(data?.integrations || {}),
      github: {
        ...defaults.integrations.github,
        ...(data?.integrations?.github || {}),
      },
      linkedin: {
        ...defaults.integrations.linkedin,
        ...(data?.integrations?.linkedin || {}),
      },
      googleAnalytics: {
        ...defaults.integrations.googleAnalytics,
        ...(data?.integrations?.googleAnalytics || {}),
      },
      googleSearchConsole: {
        ...defaults.integrations.googleSearchConsole,
        ...(data?.integrations?.googleSearchConsole || {}),
      },
      cloudinary: {
        ...defaults.integrations.cloudinary,
        ...(data?.integrations?.cloudinary || {}),
      },
    },

    privacy: {
      ...defaults.privacy,
      ...(data?.privacy || {}),
    },

    contentControls: {
      ...defaults.contentControls,
      ...(data?.contentControls || {}),
      projects: {
        ...defaults.contentControls.projects,
        ...(data?.contentControls?.projects || {}),
      },
      skills: {
        ...defaults.contentControls.skills,
        ...(data?.contentControls?.skills || {}),
      },
      experience: {
        ...defaults.contentControls.experience,
        ...(data?.contentControls?.experience || {}),
      },
      education: {
        ...defaults.contentControls.education,
        ...(data?.contentControls?.education || {}),
      },
      certificates: {
        ...defaults.contentControls.certificates,
        ...(data?.contentControls?.certificates || {}),
      },
      achievements: {
        ...defaults.contentControls.achievements,
        ...(data?.contentControls?.achievements || {}),
      },
      testimonials: {
        ...defaults.contentControls.testimonials,
        ...(data?.contentControls?.testimonials || {}),
      },
      blog: {
        ...defaults.contentControls.blog,
        ...(data?.contentControls?.blog || {}),
      },
    },

    controlCenter: {
      ...defaults.controlCenter,
      ...(data?.controlCenter || {}),
    },
    footer: {
      ...defaults.footer,
      ...(data?.footer || {}),
    },
  };
}

function AdminPortfolioSettingsPage() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(cloneDefaults());
  const [activeTab, setActiveTab] = useState("profile");
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [activeTab]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    loadSettings();
  }, [token, navigate]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await fetchPortfolioSettings(token);
      setSettings(mergeSettings(data));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err.response?.data?.message || "Failed to load portfolio settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSectionField = (section, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [field]: value,
      },
    }));
  };

  const updateNestedField = (section, parent, field, value) => {
    setSettings((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [parent]: {
          ...current[section][parent],
          [field]: value,
        },
      },
    }));
  };

  const updateHomepageSection = (section, value) => {
    setSettings((current) => ({
      ...current,
      homepage: {
        ...current.homepage,
        sections: {
          ...current.homepage.sections,
          [section]: value,
        },
      },
    }));
  };

  const updateIntegration = (integration, field, value) => {
    setSettings((current) => ({
      ...current,
      integrations: {
        ...current.integrations,
        [integration]: {
          ...current.integrations[integration],
          [field]: value,
        },
      },
    }));
  };

  const handleAddSocial = () => {
    setSettings((current) => ({
      ...current,
      profile: {
        ...current.profile,
        socialLinks: [
          ...current.profile.socialLinks,
          {
            platform: "",
            label: "",
            url: "",
            icon: "",
            enabled: true,
            order: current.profile.socialLinks.length,
          },
        ],
      },
    }));
  };

  const handleSocialChange = (index, field, value) => {
    setSettings((current) => ({
      ...current,
      profile: {
        ...current.profile,
        socialLinks: current.profile.socialLinks.map((item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item,
        ),
      },
    }));
  };

  const handleRemoveSocial = (index) => {
    setSettings((current) => ({
      ...current,
      profile: {
        ...current.profile,
        socialLinks: current.profile.socialLinks.filter(
          (_, itemIndex) => itemIndex !== index,
        ),
      },
    }));
  };

  const handleAddNavigationItem = () => {
    setSettings((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        items: [
          ...current.navigation.items,
          {
            id: `custom-${Date.now()}`,
            label: `New Link ${current.navigation.items.length + 1}`,
            url: "/",
            enabled: true,
            order: current.navigation.items.length,
          },
        ],
      },
    }));
  };

  const handleNavigationChange = (index, field, value) => {
    setSettings((current) => ({
      ...current,
      navigation: {
        ...current.navigation,
        items: current.navigation.items.map((item, itemIndex) =>
          itemIndex === index ? { ...item, [field]: value } : item,
        ),
      },
    }));
  };

  const handleRemoveNavigationItem = (index) => {
    setSettings((current) => {
      const items = current.navigation.items
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, itemIndex) => ({
          ...item,
          order: itemIndex,
        }));

      return {
        ...current,
        navigation: {
          ...current.navigation,
          items,
        },
      };
    });
  };

  const moveNavigationItem = (index, direction) => {
    setSettings((current) => {
      const items = [...current.navigation.items];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= items.length) {
        return current;
      }

      [items[index], items[targetIndex]] = [items[targetIndex], items[index]];

      return {
        ...current,
        navigation: {
          ...current.navigation,
          items: items.map((item, itemIndex) => ({
            ...item,
            order: itemIndex,
          })),
        },
      };
    });
  };

  const handleAddCategory = () => {
    setSettings((current) => ({
      ...current,
      contact: {
        ...current.contact,
        formCategories: [
          ...current.contact.formCategories,
          `Category ${current.contact.formCategories.length + 1}`,
        ],
      },
    }));
  };

  const handleCategoryChange = (index, value) => {
    setSettings((current) => ({
      ...current,
      contact: {
        ...current.contact,
        formCategories: current.contact.formCategories.map(
          (category, categoryIndex) =>
            categoryIndex === index ? value : category,
        ),
      },
    }));
  };

  const handleRemoveCategory = (index) => {
    setSettings((current) => ({
      ...current,
      contact: {
        ...current.contact,
        formCategories: current.contact.formCategories.filter(
          (_, categoryIndex) => categoryIndex !== index,
        ),
      },
    }));
  };

  const handleAddKeyword = (event) => {
    if (event.key !== "Enter") return;

    event.preventDefault();

    const value = event.currentTarget.value.trim();

    if (!value) return;

    setSettings((current) => ({
      ...current,
      seo: {
        ...current.seo,
        keywords: current.seo.keywords.includes(value)
          ? current.seo.keywords
          : [...current.seo.keywords, value],
      },
    }));

    event.currentTarget.value = "";
  };

  const removeKeyword = (keyword) => {
    setSettings((current) => ({
      ...current,
      seo: {
        ...current.seo,
        keywords: current.seo.keywords.filter((item) => item !== keyword),
      },
    }));
  };

  const handleSave = async (event) => {
    event?.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        profile: settings.profile,
        site: settings.site,
        branding: settings.branding,
        homepage: settings.homepage,
        navigation: settings.navigation,
        contact: settings.contact,
        seo: settings.seo,
        features: settings.features,
        integrations: settings.integrations,
        privacy: settings.privacy,
        contentControls: settings.contentControls,
        controlCenter: settings.controlCenter,
        footer: settings.footer,
      };
      console.log("HOMEPAGE SAVE PAYLOAD:", payload.homepage);
      const response = await updatePortfolioSettings(payload, token);

      if (response.settings) {
        setSettings(mergeSettings(response.settings));
      }

      setSuccess("Portfolio settings saved successfully.");

      window.setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setError(
        err.response?.data?.message || "Failed to save portfolio settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  const renderToggle = (label, description, checked, onChange) => (
    <div className="settings-toggle">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>

      <button
        type="button"
        className={`settings-switch ${checked ? "active" : ""}`}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="admin-shell">
        <AdminSidebar />

        <main className="admin-main">
          <div className="settings-loading">
            <div className="settings-loading-spinner" />
            <p>Loading portfolio settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminSidebar />

      <main className="admin-main">
        <div className="settings-page">
          <header className="settings-header">
            <div>
              <p className="settings-eyebrow">ADMIN CONTROL CENTER</p>

              <h1>Portfolio Settings</h1>

              <p className="settings-description">
                Manage your portfolio identity, branding, homepage, contact
                system, SEO, features, and integrations from one central control
                panel.
              </p>
            </div>

            <button
              type="button"
              className="settings-save-top"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </header>

          {error && (
            <div className="settings-alert settings-error">{error}</div>
          )}

          {success && (
            <div className="settings-alert settings-success">{success}</div>
          )}
          <div className="settings-layout">
            <div className="settings-navigation">
              <div className="settings-navigation-label">SETTINGS</div>

              <div className="settings-dropdown">
                <button
                  type="button"
                  className={`settings-dropdown-trigger ${
                    settingsMenuOpen ? "open" : ""
                  }`}
                  onClick={() => setSettingsMenuOpen((current) => !current)}
                  aria-expanded={settingsMenuOpen}
                  aria-haspopup="listbox"
                >
                  <span className="settings-dropdown-trigger-left">
                    <span className="settings-dropdown-trigger-icon">
                      {tabs.find((tab) => tab.id === activeTab)?.icon || "⚙️"}
                    </span>

                    <span>
                      <small>Current Section</small>

                      <strong>
                        {tabs.find((tab) => tab.id === activeTab)?.label ||
                          "Profile & Identity"}
                      </strong>
                    </span>
                  </span>

                  <span className="settings-dropdown-arrow">
                    {settingsMenuOpen ? "⌃" : "⌄"}
                  </span>
                </button>

                {settingsMenuOpen && (
                  <div className="settings-dropdown-menu" role="listbox">
                    <div className="settings-dropdown-menu-title">
                      PORTFOLIO SETTINGS
                    </div>

                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        role="option"
                        aria-selected={activeTab === tab.id}
                        className={`settings-dropdown-item ${
                          activeTab === tab.id ? "active" : ""
                        }`}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSettingsMenuOpen(false);

                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                      >
                        <span className="settings-dropdown-item-icon">
                          {tab.icon}
                        </span>

                        <span className="settings-dropdown-item-content">
                          <strong>{tab.label}</strong>

                          <small>
                            {
                              {
                                profile:
                                  "Personal information and social links",
                                branding:
                                  "Logo, brand identity and visual style",
                                site: "Website configuration and SEO",
                                homepage: "Hero, CTA and section visibility",
                                navigation:
                                  "Manage public navbar links, visibility and display order",
                                contact: "Contact form and spam protection",
                                features: "Portfolio feature controls",
                                integrations: "GitHub, LinkedIn and analytics",
                                privacy:
                                  "Public personal-data visibility and privacy controls",
                                content:
                                  "Manage content permissions and safeguards",
                                advanced:
                                  "Safeguards, revisions and advanced controls",
                                footer:
                                  "Manage public footer visibility and content",
                              }[tab.id]
                            }
                          </small>
                        </span>

                        {activeTab === tab.id && (
                          <span className="settings-dropdown-check">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="settings-version-compact">
                <span>Settings Version</span>
                <strong>v{settings.settingsVersion || 1}</strong>
              </div>
            </div>

            <form className="settings-content" onSubmit={handleSave}>
              {/* =====================================================
                  PROFILE
              ====================================================== */}

              {activeTab === "profile" && (
                <>
                  <section className="settings-card">
                    <CardHeader
                      icon="👤"
                      title="Profile & Identity"
                      description="Control the personal information displayed across your portfolio."
                    />

                    <div className="settings-grid">
                      <Field label="Name">
                        <input
                          type="text"
                          value={settings.profile.name}
                          onChange={(e) =>
                            updateSectionField(
                              "profile",
                              "name",
                              e.target.value,
                            )
                          }
                          placeholder="Rohit Kumar"
                        />
                      </Field>

                      <Field label="Professional Headline">
                        <input
                          type="text"
                          value={settings.profile.headline}
                          onChange={(e) =>
                            updateSectionField(
                              "profile",
                              "headline",
                              e.target.value,
                            )
                          }
                          placeholder="Full Stack + AI/ML Developer"
                        />
                      </Field>

                      <Field label="Eyebrow / Tagline" full>
                        <input
                          type="text"
                          value={settings.profile.eyebrow}
                          onChange={(e) =>
                            updateSectionField(
                              "profile",
                              "eyebrow",
                              e.target.value,
                            )
                          }
                          placeholder="FULL STACK + AI/ML DEVELOPER"
                        />
                      </Field>

                      <Field label="Short Bio" full>
                        <textarea
                          rows="5"
                          value={settings.profile.shortBio}
                          onChange={(e) =>
                            updateSectionField(
                              "profile",
                              "shortBio",
                              e.target.value,
                            )
                          }
                          placeholder="Short professional introduction..."
                        />
                      </Field>

                      <Field label="Long Bio" full>
                        <textarea
                          rows="9"
                          value={settings.profile.fullBio}
                          onChange={(e) =>
                            updateSectionField(
                              "profile",
                              "fullBio",
                              e.target.value,
                            )
                          }
                          placeholder="Detailed professional biography..."
                        />
                      </Field>

                      <Field label="Profile Photo URL">
                        <input
                          type="url"
                          value={settings.profile.profilePhoto}
                          onChange={(e) =>
                            updateSectionField(
                              "profile",
                              "profilePhoto",
                              e.target.value,
                            )
                          }
                          placeholder="https://..."
                        />
                      </Field>

                      <Field label="Resume / CV URL">
                        <input
                          type="text"
                          value={settings.profile.resume}
                          onChange={(e) =>
                            updateSectionField(
                              "profile",
                              "resume",
                              e.target.value,
                            )
                          }
                          placeholder="/resume.pdf"
                        />
                      </Field>

                      <Field label="Email">
                        <input
                          type="email"
                          value={settings.profile.email}
                          onChange={(e) =>
                            updateSectionField(
                              "profile",
                              "email",
                              e.target.value,
                            )
                          }
                          placeholder="you@example.com"
                        />
                      </Field>

                      <Field label="Phone">
                        <input
                          type="text"
                          value={settings.profile.phone}
                          onChange={(e) =>
                            updateSectionField(
                              "profile",
                              "phone",
                              e.target.value,
                            )
                          }
                          placeholder="+91..."
                        />
                      </Field>

                      <Field label="Location">
                        <input
                          type="text"
                          value={settings.profile.location}
                          onChange={(e) =>
                            updateSectionField(
                              "profile",
                              "location",
                              e.target.value,
                            )
                          }
                          placeholder="Bihar, India"
                        />
                      </Field>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Open to Work",
                          "Show that you are currently open to professional opportunities.",
                          settings.profile.openToWork,
                          (value) =>
                            updateSectionField("profile", "openToWork", value),
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="settings-card">
                    <div className="settings-card-header settings-card-header-row">
                      <CardHeader
                        icon="🔗"
                        title="Social Links"
                        description="Manage social profiles displayed on your portfolio."
                      />

                      <button
                        type="button"
                        className="settings-secondary-button"
                        onClick={handleAddSocial}
                      >
                        + Add Social Link
                      </button>
                    </div>

                    {settings.profile.socialLinks.length === 0 ? (
                      <div className="settings-empty">
                        <span>🔗</span>
                        <p>No social links added yet.</p>

                        <button
                          type="button"
                          className="settings-secondary-button"
                          onClick={handleAddSocial}
                        >
                          Add First Link
                        </button>
                      </div>
                    ) : (
                      <div className="social-links-list">
                        {settings.profile.socialLinks.map((social, index) => (
                          <div
                            className="social-link-row"
                            key={social._id || index}
                          >
                            <div className="social-link-number">
                              {index + 1}
                            </div>

                            <Field label="Platform">
                              <input
                                type="text"
                                value={social.platform || ""}
                                onChange={(e) =>
                                  handleSocialChange(
                                    index,
                                    "platform",
                                    e.target.value,
                                  )
                                }
                                placeholder="GitHub"
                              />
                            </Field>

                            <Field label="Label">
                              <input
                                type="text"
                                value={social.label || ""}
                                onChange={(e) =>
                                  handleSocialChange(
                                    index,
                                    "label",
                                    e.target.value,
                                  )
                                }
                                placeholder="GitHub"
                              />
                            </Field>

                            <Field label="URL">
                              <input
                                type="url"
                                value={social.url || ""}
                                onChange={(e) =>
                                  handleSocialChange(
                                    index,
                                    "url",
                                    e.target.value,
                                  )
                                }
                                placeholder="https://..."
                              />
                            </Field>

                            <Field label="Icon">
                              <input
                                type="text"
                                value={social.icon || ""}
                                onChange={(e) =>
                                  handleSocialChange(
                                    index,
                                    "icon",
                                    e.target.value,
                                  )
                                }
                                placeholder="github"
                              />
                            </Field>

                            <div className="social-link-actions">
                              <label className="social-enabled">
                                <input
                                  type="checkbox"
                                  checked={social.enabled !== false}
                                  onChange={(e) =>
                                    handleSocialChange(
                                      index,
                                      "enabled",
                                      e.target.checked,
                                    )
                                  }
                                />
                                Enabled
                              </label>

                              <button
                                type="button"
                                className="settings-delete-button"
                                onClick={() => handleRemoveSocial(index)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}

              {/* =====================================================
                  BRANDING
              ====================================================== */}

              {activeTab === "branding" && (
                <section className="settings-card">
                  <CardHeader
                    icon="🎨"
                    title="Branding"
                    description="Manage the visual identity used across the portfolio."
                  />

                  <div className="settings-grid">
                    <Field label="Brand Name">
                      <input
                        type="text"
                        value={settings.branding.brandName}
                        onChange={(e) =>
                          updateSectionField(
                            "branding",
                            "brandName",
                            e.target.value,
                          )
                        }
                        placeholder="Rohit Kumar"
                      />
                    </Field>

                    <Field label="Brand Text">
                      <input
                        type="text"
                        value={settings.branding.brandText}
                        onChange={(e) =>
                          updateSectionField(
                            "branding",
                            "brandText",
                            e.target.value,
                          )
                        }
                        placeholder="FULL STACK + AI/ML"
                      />
                    </Field>

                    <Field label="Main Logo URL">
                      <input
                        type="url"
                        value={settings.branding.logo}
                        onChange={(e) =>
                          updateSectionField("branding", "logo", e.target.value)
                        }
                        placeholder="https://..."
                      />
                    </Field>

                    <Field label="Logo Mark URL">
                      <input
                        type="url"
                        value={settings.branding.logoMark}
                        onChange={(e) =>
                          updateSectionField(
                            "branding",
                            "logoMark",
                            e.target.value,
                          )
                        }
                        placeholder="https://..."
                      />
                    </Field>

                    <Field label="Light Theme Logo">
                      <input
                        type="url"
                        value={settings.branding.lightLogo}
                        onChange={(e) =>
                          updateSectionField(
                            "branding",
                            "lightLogo",
                            e.target.value,
                          )
                        }
                        placeholder="https://..."
                      />
                    </Field>

                    <Field label="Dark Theme Logo">
                      <input
                        type="url"
                        value={settings.branding.darkLogo}
                        onChange={(e) =>
                          updateSectionField(
                            "branding",
                            "darkLogo",
                            e.target.value,
                          )
                        }
                        placeholder="https://..."
                      />
                    </Field>

                    <Field label="Accent Color">
                      <input
                        type="text"
                        value={settings.branding.accentColor}
                        onChange={(e) =>
                          updateSectionField(
                            "branding",
                            "accentColor",
                            e.target.value,
                          )
                        }
                        placeholder="#16b8a6"
                      />
                    </Field>

                    <Field label="Favicon URL">
                      <input
                        type="url"
                        value={settings.branding.favicon}
                        onChange={(e) =>
                          updateSectionField(
                            "branding",
                            "favicon",
                            e.target.value,
                          )
                        }
                        placeholder="/favicon.ico"
                      />
                    </Field>
                  </div>
                </section>
              )}

              {/* =====================================================
                  SITE + SEO
              ====================================================== */}

              {activeTab === "site" && (
                <>
                  <section className="settings-card">
                    <CardHeader
                      icon="🌐"
                      title="Website"
                      description="Configure core website settings and appearance."
                    />

                    <div className="settings-grid">
                      <Field label="Site Title" full>
                        <input
                          type="text"
                          value={settings.site.title}
                          onChange={(e) =>
                            updateSectionField("site", "title", e.target.value)
                          }
                          placeholder="Rohit Kumar | Full Stack + AI/ML Developer"
                        />
                      </Field>

                      <Field label="Meta Description" full>
                        <textarea
                          rows="5"
                          value={settings.site.metaDescription}
                          onChange={(e) =>
                            updateSectionField(
                              "site",
                              "metaDescription",
                              e.target.value,
                            )
                          }
                          placeholder="Describe your portfolio for search engines..."
                        />
                      </Field>

                      <Field label="OG Image URL">
                        <input
                          type="url"
                          value={settings.site.ogImage}
                          onChange={(e) =>
                            updateSectionField(
                              "site",
                              "ogImage",
                              e.target.value,
                            )
                          }
                          placeholder="https://..."
                        />
                      </Field>

                      <Field label="Default Theme">
                        <select
                          value={settings.site.defaultTheme}
                          onChange={(e) =>
                            updateSectionField(
                              "site",
                              "defaultTheme",
                              e.target.value,
                            )
                          }
                        >
                          <option value="dark">Dark</option>
                          <option value="light">Light</option>
                          <option value="system">System</option>
                        </select>
                      </Field>

                      <Field label="Custom Domain" full>
                        <input
                          type="text"
                          value={settings.site.customDomain}
                          onChange={(e) =>
                            updateSectionField(
                              "site",
                              "customDomain",
                              e.target.value,
                            )
                          }
                          placeholder="portfolio.example.com"
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="settings-card">
                    <CardHeader
                      icon="🔎"
                      title="SEO"
                      description="Control search-engine metadata and indexing behaviour."
                    />

                    <div className="settings-grid">
                      <Field label="Canonical URL" full>
                        <input
                          type="url"
                          value={settings.seo.canonicalUrl}
                          onChange={(e) =>
                            updateSectionField(
                              "seo",
                              "canonicalUrl",
                              e.target.value,
                            )
                          }
                          placeholder="https://example.com"
                        />
                      </Field>

                      <Field label="Author">
                        <input
                          type="text"
                          value={settings.seo.author}
                          onChange={(e) =>
                            updateSectionField("seo", "author", e.target.value)
                          }
                          placeholder="Rohit Kumar"
                        />
                      </Field>

                      <Field label="Twitter Card">
                        <select
                          value={settings.seo.twitterCard}
                          onChange={(e) =>
                            updateSectionField(
                              "seo",
                              "twitterCard",
                              e.target.value,
                            )
                          }
                        >
                          <option value="summary">Summary</option>
                          <option value="summary_large_image">
                            Summary Large Image
                          </option>
                        </select>
                      </Field>

                      <Field label="OG Title">
                        <input
                          type="text"
                          value={settings.seo.ogTitle}
                          onChange={(e) =>
                            updateSectionField("seo", "ogTitle", e.target.value)
                          }
                        />
                      </Field>

                      <Field label="OG Description">
                        <textarea
                          rows="4"
                          value={settings.seo.ogDescription}
                          onChange={(e) =>
                            updateSectionField(
                              "seo",
                              "ogDescription",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      <div className="settings-field settings-field-full">
                        <div className="settings-inline-toggles">
                          {renderToggle(
                            "Search Indexing",
                            "Allow search engines to index the portfolio.",
                            settings.seo.robotsIndex,
                            (value) =>
                              updateSectionField("seo", "robotsIndex", value),
                          )}

                          {renderToggle(
                            "Follow Links",
                            "Allow search engines to follow links.",
                            settings.seo.robotsFollow,
                            (value) =>
                              updateSectionField("seo", "robotsFollow", value),
                          )}
                        </div>
                      </div>

                      <Field label="SEO Keywords" full>
                        <input
                          type="text"
                          placeholder="Type keyword and press Enter"
                          onKeyDown={handleAddKeyword}
                        />

                        <div className="keyword-list">
                          {settings.seo.keywords.map((keyword) => (
                            <span className="keyword-chip" key={keyword}>
                              {keyword}

                              <button
                                type="button"
                                onClick={() => removeKeyword(keyword)}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </Field>
                    </div>
                  </section>
                </>
              )}

              {/* =====================================================
                  HOMEPAGE
              ====================================================== */}

              {activeTab === "homepage" && (
                <>
                  <section className="settings-card">
                    <CardHeader
                      icon="🏠"
                      title="Homepage Hero"
                      description="Control the primary content visitors see on the homepage."
                    />

                    <div className="settings-grid">
                      <Field label="Hero Title" full>
                        <input
                          type="text"
                          value={settings.homepage.heroTitle}
                          onChange={(e) =>
                            updateSectionField(
                              "homepage",
                              "heroTitle",
                              e.target.value,
                            )
                          }
                          placeholder="Rohit Kumar — Full Stack + AI/ML Developer"
                        />
                      </Field>

                      <Field label="Hero Subtitle" full>
                        <input
                          type="text"
                          value={settings.homepage.heroSubtitle}
                          onChange={(e) =>
                            updateSectionField(
                              "homepage",
                              "heroSubtitle",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      <Field label="Hero Description" full>
                        <textarea
                          rows="6"
                          value={settings.homepage.heroDescription}
                          onChange={(e) =>
                            updateSectionField(
                              "homepage",
                              "heroDescription",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      <Field label="Featured Project Count">
                        <input
                          type="number"
                          min="0"
                          max="20"
                          value={settings.homepage.featuredProjectCount}
                          onChange={(e) =>
                            updateSectionField(
                              "homepage",
                              "featuredProjectCount",
                              Number(e.target.value),
                            )
                          }
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="settings-card">
                    <CardHeader
                      icon="🎯"
                      title="Homepage CTA"
                      description="Configure the primary and secondary hero buttons."
                    />

                    <div className="settings-grid">
                      <Field label="Primary CTA Label">
                        <input
                          type="text"
                          value={settings.homepage.primaryCta.label}
                          onChange={(e) =>
                            updateNestedField(
                              "homepage",
                              "primaryCta",
                              "label",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      <Field label="Primary CTA URL">
                        <input
                          type="text"
                          value={settings.homepage.primaryCta.url}
                          onChange={(e) =>
                            updateNestedField(
                              "homepage",
                              "primaryCta",
                              "url",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      <Field label="Primary CTA Style">
                        <select
                          value={settings.homepage.primaryCta.style}
                          onChange={(e) =>
                            updateNestedField(
                              "homepage",
                              "primaryCta",
                              "style",
                              e.target.value,
                            )
                          }
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                          <option value="ghost">Ghost</option>
                          <option value="outline">Outline</option>
                        </select>
                      </Field>

                      <Field label="Secondary CTA Label">
                        <input
                          type="text"
                          value={settings.homepage.secondaryCta.label}
                          onChange={(e) =>
                            updateNestedField(
                              "homepage",
                              "secondaryCta",
                              "label",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      <Field label="Secondary CTA URL">
                        <input
                          type="text"
                          value={settings.homepage.secondaryCta.url}
                          onChange={(e) =>
                            updateNestedField(
                              "homepage",
                              "secondaryCta",
                              "url",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      <Field label="Secondary CTA Style">
                        <select
                          value={settings.homepage.secondaryCta.style}
                          onChange={(e) =>
                            updateNestedField(
                              "homepage",
                              "secondaryCta",
                              "style",
                              e.target.value,
                            )
                          }
                        >
                          <option value="primary">Primary</option>
                          <option value="secondary">Secondary</option>
                          <option value="ghost">Ghost</option>
                          <option value="outline">Outline</option>
                        </select>
                      </Field>

                      <div className="settings-field settings-field-full">
                        <div className="settings-inline-toggles">
                          {renderToggle(
                            "Show Stats",
                            "Display project/statistics information on the homepage.",
                            settings.homepage.showStats,
                            (value) =>
                              updateSectionField(
                                "homepage",
                                "showStats",
                                value,
                              ),
                          )}

                          {renderToggle(
                            "Show Availability",
                            "Display the availability/open-to-work indicator.",
                            settings.homepage.showAvailability,
                            (value) =>
                              updateSectionField(
                                "homepage",
                                "showAvailability",
                                value,
                              ),
                          )}
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="settings-card">
                    <CardHeader
                      icon="👁️"
                      title="Section Visibility"
                      description="Choose which portfolio sections are enabled."
                    />

                    <div className="visibility-grid">
                      {Object.entries(settings.homepage.sections).map(
                        ([key, value]) => (
                          <div className="visibility-item" key={key}>
                            <div>
                              <strong>{sectionLabels[key] || key}</strong>
                              <span>{value ? "Visible" : "Hidden"}</span>
                            </div>

                            <button
                              type="button"
                              className={`settings-switch ${
                                value ? "active" : ""
                              }`}
                              aria-pressed={value}
                              onClick={() => updateHomepageSection(key, !value)}
                            >
                              <span />
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                </>
              )}

              {/* =====================================================
                  NAVIGATION
              ====================================================== */}

              {activeTab === "navigation" && (
                <>
                  <section className="settings-card">
                    <CardHeader
                      icon="🧭"
                      title="Navigation Control"
                      description="Manage the public navbar, link visibility and display order without changing the actual portfolio pages."
                    />

                    <div className="settings-field settings-field-full">
                      {renderToggle(
                        "Navigation Enabled",
                        "Show the configured navigation links on the public website.",
                        settings.navigation.enabled,
                        (value) =>
                          updateSectionField("navigation", "enabled", value),
                      )}
                    </div>
                  </section>

                  <section className="settings-card">
                    <div className="settings-card-header settings-card-header-row">
                      <CardHeader
                        icon="🔗"
                        title="Navigation Items"
                        description="Edit labels, URLs, visibility and order of public navigation links."
                      />

                      <button
                        type="button"
                        className="settings-secondary-button"
                        onClick={handleAddNavigationItem}
                      >
                        + Add Navigation Item
                      </button>
                    </div>

                    {settings.navigation.items.length === 0 ? (
                      <div className="settings-empty">
                        <span>🧭</span>
                        <p>No navigation items configured yet.</p>

                        <button
                          type="button"
                          className="settings-secondary-button"
                          onClick={handleAddNavigationItem}
                        >
                          Add First Item
                        </button>
                      </div>
                    ) : (
                      <div className="navigation-items-list">
                        {settings.navigation.items.map((item, index) => (
                          <div
                            className="navigation-item-row"
                            key={`${item.id || "navigation"}-${index}`}
                          >
                            <div className="navigation-item-number">
                              {index + 1}
                            </div>

                            <Field label="ID">
                              <input
                                type="text"
                                value={item.id || ""}
                                onChange={(e) =>
                                  handleNavigationChange(
                                    index,
                                    "id",
                                    e.target.value,
                                  )
                                }
                                placeholder="projects"
                              />
                            </Field>

                            <Field label="Label">
                              <input
                                type="text"
                                value={item.label || ""}
                                onChange={(e) =>
                                  handleNavigationChange(
                                    index,
                                    "label",
                                    e.target.value,
                                  )
                                }
                                placeholder="Projects"
                              />
                            </Field>

                            <Field label="URL">
                              <input
                                type="text"
                                value={item.url || ""}
                                onChange={(e) =>
                                  handleNavigationChange(
                                    index,
                                    "url",
                                    e.target.value,
                                  )
                                }
                                placeholder="/projects"
                              />
                            </Field>

                            <Field label="Order">
                              <input
                                type="number"
                                min="0"
                                value={
                                  Number.isFinite(Number(item.order))
                                    ? item.order
                                    : index
                                }
                                onChange={(e) =>
                                  handleNavigationChange(
                                    index,
                                    "order",
                                    Math.max(0, Number(e.target.value) || 0),
                                  )
                                }
                              />
                            </Field>

                            <div className="navigation-item-actions">
                              <label className="social-enabled">
                                <input
                                  type="checkbox"
                                  checked={item.enabled !== false}
                                  onChange={(e) =>
                                    handleNavigationChange(
                                      index,
                                      "enabled",
                                      e.target.checked,
                                    )
                                  }
                                />
                                Enabled
                              </label>

                              <div className="navigation-move-actions">
                                <button
                                  type="button"
                                  className="navigation-action-button"
                                  onClick={() => moveNavigationItem(index, -1)}
                                  disabled={index === 0}
                                  aria-label={`Move ${item.label || "item"} up`}
                                >
                                  ↑
                                </button>

                                <button
                                  type="button"
                                  className="navigation-action-button"
                                  onClick={() => moveNavigationItem(index, 1)}
                                  disabled={
                                    index ===
                                    settings.navigation.items.length - 1
                                  }
                                  aria-label={`Move ${item.label || "item"} down`}
                                >
                                  ↓
                                </button>

                                <button
                                  type="button"
                                  className="settings-delete-button"
                                  onClick={() =>
                                    handleRemoveNavigationItem(index)
                                  }
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                </>
              )}

              {/* =====================================================
                  CONTACT
              ====================================================== */}

              {activeTab === "contact" && (
                <>
                  <section className="settings-card">
                    <CardHeader
                      icon="✉️"
                      title="Contact Form"
                      description="Configure the public contact form and its notification behaviour."
                    />

                    <div className="settings-grid">
                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Contact Form Enabled",
                          "Allow visitors to submit messages through the portfolio.",
                          settings.contact.enabled,
                          (value) =>
                            updateSectionField("contact", "enabled", value),
                        )}
                      </div>

                      <Field label="Notification Email">
                        <input
                          type="email"
                          value={settings.contact.notificationEmail}
                          onChange={(e) =>
                            updateSectionField(
                              "contact",
                              "notificationEmail",
                              e.target.value,
                            )
                          }
                          placeholder="you@example.com"
                        />
                      </Field>

                      <Field label="Success Message">
                        <input
                          type="text"
                          value={settings.contact.successMessage}
                          onChange={(e) =>
                            updateSectionField(
                              "contact",
                              "successMessage",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Email Notifications",
                          "Send an email notification when a new portfolio message arrives.",
                          settings.contact.enableEmailNotification,
                          (value) =>
                            updateSectionField(
                              "contact",
                              "enableEmailNotification",
                              value,
                            ),
                        )}
                      </div>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Honeypot Protection",
                          "Use a hidden honeypot field as an additional spam protection layer.",
                          settings.contact.enableHoneypot,
                          (value) =>
                            updateSectionField(
                              "contact",
                              "enableHoneypot",
                              value,
                            ),
                        )}
                      </div>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "CAPTCHA",
                          "Enable CAPTCHA protection when a supported provider is configured.",
                          settings.contact.enableCaptcha,
                          (value) =>
                            updateSectionField(
                              "contact",
                              "enableCaptcha",
                              value,
                            ),
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="settings-card">
                    <CardHeader
                      icon="🛡️"
                      title="Rate Limiting"
                      description="Control how frequently visitors can submit contact requests."
                    />

                    <div className="settings-grid">
                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Rate Limiting Enabled",
                          "Protect the contact endpoint against excessive requests.",
                          settings.contact.rateLimitEnabled,
                          (value) =>
                            updateSectionField(
                              "contact",
                              "rateLimitEnabled",
                              value,
                            ),
                        )}
                      </div>

                      <Field label="Window (minutes)">
                        <input
                          type="number"
                          min="1"
                          max="1440"
                          value={settings.contact.rateLimitWindowMinutes}
                          onChange={(e) =>
                            updateSectionField(
                              "contact",
                              "rateLimitWindowMinutes",
                              Number(e.target.value),
                            )
                          }
                        />
                      </Field>

                      <Field label="Maximum Requests">
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={settings.contact.rateLimitMaxRequests}
                          onChange={(e) =>
                            updateSectionField(
                              "contact",
                              "rateLimitMaxRequests",
                              Number(e.target.value),
                            )
                          }
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="settings-card">
                    <div className="settings-card-header settings-card-header-row">
                      <CardHeader
                        icon="🏷️"
                        title="Form Categories"
                        description="Categories visitors can use when contacting you."
                      />

                      <button
                        type="button"
                        className="settings-secondary-button"
                        onClick={handleAddCategory}
                      >
                        + Add Category
                      </button>
                    </div>

                    <div className="category-list">
                      {settings.contact.formCategories.map(
                        (category, index) => (
                          <div
                            className="category-row"
                            key={`${category}-${index}`}
                          >
                            <span>{index + 1}</span>

                            <input
                              type="text"
                              value={category}
                              onChange={(e) =>
                                handleCategoryChange(index, e.target.value)
                              }
                            />

                            <button
                              type="button"
                              className="settings-delete-button"
                              onClick={() => handleRemoveCategory(index)}
                            >
                              Remove
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                </>
              )}

              {/* =====================================================
                  FEATURES
              ====================================================== */}

              {activeTab === "features" && (
                <section className="settings-card">
                  <CardHeader
                    icon="⚡"
                    title="Feature Flags"
                    description="Enable or disable portfolio functionality without changing application code."
                  />

                  <div className="feature-list">
                    {[
                      [
                        "contactEnabled",
                        "Contact",
                        "Enable the public contact system.",
                      ],
                      [
                        "projectsEnabled",
                        "Projects",
                        "Enable the projects section.",
                      ],
                      ["skillsEnabled", "Skills", "Enable the skills section."],
                      [
                        "experienceEnabled",
                        "Experience",
                        "Enable the experience section.",
                      ],
                      [
                        "educationEnabled",
                        "Education",
                        "Enable the education section.",
                      ],
                      [
                        "certificatesEnabled",
                        "Certificates",
                        "Enable certificates.",
                      ],
                      [
                        "achievementsEnabled",
                        "Achievements",
                        "Enable achievements.",
                      ],
                      [
                        "testimonialsEnabled",
                        "Testimonials",
                        "Enable testimonials.",
                      ],
                      ["blogEnabled", "Blog", "Enable the future blog module."],
                      [
                        "chatbotEnabled",
                        "AI Chatbot",
                        "Enable the future AI chatbot integration.",
                      ],
                      [
                        "analyticsEnabled",
                        "Analytics",
                        "Enable analytics integration.",
                      ],
                      [
                        "maintenanceMode",
                        "Maintenance Mode",
                        "Switch the public portfolio into maintenance mode.",
                      ],
                    ].map(([key, label, description]) => (
                      <div className="feature-item" key={key}>
                        {renderToggle(
                          label,
                          description,
                          settings.features[key],
                          (value) => updateSectionField("features", key, value),
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* =====================================================
                  INTEGRATIONS
              ====================================================== */}

              {activeTab === "integrations" && (
                <>
                  <section className="settings-card">
                    <CardHeader
                      icon="🐙"
                      title="GitHub"
                      description="Configure GitHub profile integration."
                    />

                    <div className="settings-grid">
                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "GitHub Integration",
                          "Enable GitHub-related portfolio integrations.",
                          settings.integrations.github.enabled,
                          (value) =>
                            updateIntegration("github", "enabled", value),
                        )}
                      </div>

                      <Field label="GitHub Username" full>
                        <input
                          type="text"
                          value={settings.integrations.github.username}
                          onChange={(e) =>
                            updateIntegration(
                              "github",
                              "username",
                              e.target.value,
                            )
                          }
                          placeholder="username"
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="settings-card">
                    <CardHeader
                      icon="💼"
                      title="LinkedIn"
                      description="Configure your LinkedIn profile integration."
                    />

                    <div className="settings-grid">
                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "LinkedIn Integration",
                          "Enable LinkedIn-related portfolio integrations.",
                          settings.integrations.linkedin.enabled,
                          (value) =>
                            updateIntegration("linkedin", "enabled", value),
                        )}
                      </div>

                      <Field label="LinkedIn Profile URL" full>
                        <input
                          type="url"
                          value={settings.integrations.linkedin.profileUrl}
                          onChange={(e) =>
                            updateIntegration(
                              "linkedin",
                              "profileUrl",
                              e.target.value,
                            )
                          }
                          placeholder="https://linkedin.com/in/..."
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="settings-card">
                    <CardHeader
                      icon="📊"
                      title="Google Analytics"
                      description="Configure Google Analytics without exposing secrets to the frontend."
                    />

                    <div className="settings-grid">
                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Google Analytics",
                          "Enable analytics tracking when the public integration is implemented.",
                          settings.integrations.googleAnalytics.enabled,
                          (value) =>
                            updateIntegration(
                              "googleAnalytics",
                              "enabled",
                              value,
                            ),
                        )}
                      </div>

                      <Field label="Measurement ID" full>
                        <input
                          type="text"
                          value={
                            settings.integrations.googleAnalytics.measurementId
                          }
                          onChange={(e) =>
                            updateIntegration(
                              "googleAnalytics",
                              "measurementId",
                              e.target.value,
                            )
                          }
                          placeholder="G-XXXXXXXXXX"
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="settings-card">
                    <CardHeader
                      icon="🔍"
                      title="Google Search Console"
                      description="Configure search-console verification."
                    />

                    <div className="settings-grid">
                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Search Console",
                          "Enable Search Console verification support.",
                          settings.integrations.googleSearchConsole.enabled,
                          (value) =>
                            updateIntegration(
                              "googleSearchConsole",
                              "enabled",
                              value,
                            ),
                        )}
                      </div>

                      <Field label="Verification Code" full>
                        <input
                          type="text"
                          value={
                            settings.integrations.googleSearchConsole
                              .verificationCode
                          }
                          onChange={(e) =>
                            updateIntegration(
                              "googleSearchConsole",
                              "verificationCode",
                              e.target.value,
                            )
                          }
                          placeholder="Verification code"
                        />
                      </Field>
                    </div>
                  </section>

                  <section className="settings-card">
                    <CardHeader
                      icon="☁️"
                      title="Cloudinary"
                      description="Media storage integration placeholder for the future Media Library."
                    />

                    {renderToggle(
                      "Cloudinary Integration",
                      "Enable Cloudinary when the Media Library is implemented.",
                      settings.integrations.cloudinary.enabled,
                      (value) =>
                        updateIntegration("cloudinary", "enabled", value),
                    )}

                    <p className="settings-security-note">
                      Cloudinary API secrets should never be stored directly in
                      this frontend settings page. They should remain
                      server-side environment variables or securely managed
                      backend secrets.
                    </p>
                  </section>
                </>
              )}

              {/* =====================================================
                  PRIVACY
              ====================================================== */}

              {activeTab === "privacy" && (
                <section className="settings-card">
                  <CardHeader
                    icon="🔒"
                    title="Privacy & Visibility"
                    description="Control which personal information and public contact options are visible on your portfolio."
                  />

                  <div className="settings-grid">
                    <div className="settings-field settings-field-full">
                      {renderToggle(
                        "Show Email",
                        "Display your email address on the public portfolio.",
                        settings.privacy.showEmail,
                        (value) =>
                          updateSectionField("privacy", "showEmail", value),
                      )}
                    </div>

                    <div className="settings-field settings-field-full">
                      {renderToggle(
                        "Show Phone",
                        "Display your phone number on the public portfolio.",
                        settings.privacy.showPhone,
                        (value) =>
                          updateSectionField("privacy", "showPhone", value),
                      )}
                    </div>

                    <div className="settings-field settings-field-full">
                      {renderToggle(
                        "Show Location",
                        "Display your location on the public portfolio.",
                        settings.privacy.showLocation,
                        (value) =>
                          updateSectionField("privacy", "showLocation", value),
                      )}
                    </div>

                    <div className="settings-field settings-field-full">
                      {renderToggle(
                        "Show Social Links",
                        "Display your social media links publicly.",
                        settings.privacy.showSocialLinks,
                        (value) =>
                          updateSectionField(
                            "privacy",
                            "showSocialLinks",
                            value,
                          ),
                      )}
                    </div>

                    <div className="settings-field settings-field-full">
                      {renderToggle(
                        "Allow Contact Form",
                        "Allow visitors to submit messages through the contact form.",
                        settings.privacy.allowContactForm,
                        (value) =>
                          updateSectionField(
                            "privacy",
                            "allowContactForm",
                            value,
                          ),
                      )}
                    </div>

                    <div className="settings-field settings-field-full">
                      {renderToggle(
                        "Show Availability",
                        "Display your availability status publicly.",
                        settings.privacy.showAvailability,
                        (value) =>
                          updateSectionField(
                            "privacy",
                            "showAvailability",
                            value,
                          ),
                      )}
                    </div>

                    <div className="settings-field settings-field-full">
                      {renderToggle(
                        "Cookie Notice",
                        "Enable the cookie/privacy notice on the public website.",
                        settings.privacy.cookieNoticeEnabled,
                        (value) =>
                          updateSectionField(
                            "privacy",
                            "cookieNoticeEnabled",
                            value,
                          ),
                      )}
                    </div>

                    <Field label="Privacy Policy URL" full>
                      <input
                        type="url"
                        value={settings.privacy.privacyPolicyUrl}
                        onChange={(e) =>
                          updateSectionField(
                            "privacy",
                            "privacyPolicyUrl",
                            e.target.value,
                          )
                        }
                        placeholder="https://example.com/privacy"
                      />
                    </Field>

                    <Field label="Terms & Conditions URL" full>
                      <input
                        type="url"
                        value={settings.privacy.termsUrl}
                        onChange={(e) =>
                          updateSectionField(
                            "privacy",
                            "termsUrl",
                            e.target.value,
                          )
                        }
                        placeholder="https://example.com/terms"
                      />
                    </Field>
                  </div>
                </section>
              )}

              {/* =====================================================
                  CONTENT MANAGEMENT
              ====================================================== */}

              {activeTab === "content" && (
                <section className="settings-card">
                  <CardHeader
                    icon="🗂️"
                    title="Content Management Controls"
                    description="Control which content modules can be managed, reordered and deleted from the admin panel."
                  />

                  <div className="settings-grid">
                    {Object.entries({
                      projects: "Projects",
                      skills: "Skills",
                      experience: "Experience",
                      education: "Education",
                      certificates: "Certificates",
                      achievements: "Achievements",
                      testimonials: "Testimonials",
                      blog: "Blog",
                    }).map(([key, label]) => (
                      <div
                        className="settings-field settings-field-full"
                        key={key}
                      >
                        <div className="settings-card" style={{ margin: 0 }}>
                          <div className="settings-card-header settings-card-header-row">
                            <div>
                              <h3>{label}</h3>
                              <p>
                                Configure admin permissions and safeguards for{" "}
                                {label.toLowerCase()} content.
                              </p>
                            </div>
                          </div>

                          <div className="settings-inline-toggles">
                            {renderToggle(
                              "Manage Enabled",
                              `Allow ${label.toLowerCase()} content to be managed from the admin panel.`,
                              settings.contentControls[key].manageEnabled,
                              (value) =>
                                updateNestedField(
                                  "contentControls",
                                  key,
                                  "manageEnabled",
                                  value,
                                ),
                            )}

                            {renderToggle(
                              "Reorder Enabled",
                              `Allow ${label.toLowerCase()} items to be reordered.`,
                              settings.contentControls[key].reorderEnabled,
                              (value) =>
                                updateNestedField(
                                  "contentControls",
                                  key,
                                  "reorderEnabled",
                                  value,
                                ),
                            )}

                            {renderToggle(
                              "Delete Confirmation",
                              `Require confirmation before deleting ${label.toLowerCase()} content.`,
                              settings.contentControls[key]
                                .deleteConfirmationRequired,
                              (value) =>
                                updateNestedField(
                                  "contentControls",
                                  key,
                                  "deleteConfirmationRequired",
                                  value,
                                ),
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* =====================================================
                  ADVANCED / CONTROL CENTER
              ====================================================== */}

              {activeTab === "advanced" && (
                <>
                  <section className="settings-card">
                    <CardHeader
                      icon="⚙️"
                      title="Control Center"
                      description="Configure safeguards, revision history and advanced administrative controls."
                    />

                    <div className="settings-grid">
                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Confirm Destructive Actions",
                          "Require confirmation before destructive administrative actions.",
                          settings.controlCenter.confirmDestructiveActions,
                          (value) =>
                            updateSectionField(
                              "controlCenter",
                              "confirmDestructiveActions",
                              value,
                            ),
                        )}
                      </div>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Require Save Confirmation",
                          "Ask for confirmation before saving portfolio settings.",
                          settings.controlCenter.requireSaveConfirmation,
                          (value) =>
                            updateSectionField(
                              "controlCenter",
                              "requireSaveConfirmation",
                              value,
                            ),
                        )}
                      </div>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Show Advanced Controls",
                          "Display advanced administrative controls in the control center.",
                          settings.controlCenter.showAdvancedControls,
                          (value) =>
                            updateSectionField(
                              "controlCenter",
                              "showAdvancedControls",
                              value,
                            ),
                        )}
                      </div>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Audit Log Enabled",
                          "Keep an audit trail for supported portfolio settings changes.",
                          settings.controlCenter.auditLogEnabled,
                          (value) =>
                            updateSectionField(
                              "controlCenter",
                              "auditLogEnabled",
                              value,
                            ),
                        )}
                      </div>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Backup Before Reset",
                          "Create a backup/revision before supported reset operations.",
                          settings.controlCenter.backupBeforeReset,
                          (value) =>
                            updateSectionField(
                              "controlCenter",
                              "backupBeforeReset",
                              value,
                            ),
                        )}
                      </div>

                      <Field label="Maximum Revision Entries">
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={settings.controlCenter.maxRevisionEntries}
                          onChange={(event) =>
                            updateSectionField(
                              "controlCenter",
                              "maxRevisionEntries",
                              Math.min(
                                500,
                                Math.max(1, Number(event.target.value) || 1),
                              ),
                            )
                          }
                        />
                      </Field>
                    </div>
                  </section>
                </>
              )}

              {/* =====================================================
                  FOOTER
              ====================================================== */}

              {activeTab === "footer" && (
                <>
                  <section className="settings-card">
                    <CardHeader
                      icon="📌"
                      title="Footer"
                      description="Control the public website footer and the information displayed inside it."
                    />

                    <div className="settings-grid">
                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Footer Enabled",
                          "Show the footer on the public website.",
                          settings.footer.enabled,
                          (value) =>
                            updateSectionField("footer", "enabled", value),
                        )}
                      </div>

                      <Field label="Copyright Text">
                        <input
                          type="text"
                          value={settings.footer.copyrightText}
                          onChange={(event) =>
                            updateSectionField(
                              "footer",
                              "copyrightText",
                              event.target.value,
                            )
                          }
                        />
                      </Field>

                      <Field label="Footer Tagline">
                        <input
                          type="text"
                          value={settings.footer.tagline}
                          onChange={(event) =>
                            updateSectionField(
                              "footer",
                              "tagline",
                              event.target.value,
                            )
                          }
                        />
                      </Field>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Show Social Links",
                          "Display social media links in the footer.",
                          settings.footer.showSocialLinks,
                          (value) =>
                            updateSectionField(
                              "footer",
                              "showSocialLinks",
                              value,
                            ),
                        )}
                      </div>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Show Email",
                          "Display the email address in the footer.",
                          settings.footer.showEmail,
                          (value) =>
                            updateSectionField("footer", "showEmail", value),
                        )}
                      </div>

                      <div className="settings-field settings-field-full">
                        {renderToggle(
                          "Show Admin Link",
                          "Display the admin login link in the footer.",
                          settings.footer.showAdminLink,
                          (value) =>
                            updateSectionField(
                              "footer",
                              "showAdminLink",
                              value,
                            ),
                        )}
                      </div>
                    </div>
                  </section>
                </>
              )}

              <div className="settings-bottom-actions">
                <button
                  type="submit"
                  className="settings-primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving Settings..." : "Save Portfolio Settings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      <style>{`
        .admin-shell {
          min-height: 100vh;
          display: block;
          background: #090d14;
          color: #f4f7fb;
        }

        /* Keep this page aligned with the fixed desktop admin sidebar.
           The previous flex layout caused an unnecessary horizontal gap. */
        .admin-shell > .admin-main {
          width: calc(100% - 250px);
          min-width: 0;
          margin-left: 250px;
          padding: 32px 40px 80px;
        }

        .settings-page {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .settings-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .settings-eyebrow {
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          color: #7f8da3;
        }

        .settings-header h1 {
          margin: 0;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.05;
        }

        .settings-description {
          max-width: 800px;
          margin: 12px 0 0;
          color: #8e9bae;
          line-height: 1.7;
        }

        .settings-save-top,
        .settings-primary-button,
        .settings-secondary-button,
        .settings-delete-button {
          border: 0;
          cursor: pointer;
          font: inherit;
        }

        .settings-save-top,
        .settings-primary-button {
          border-radius: 10px;
          padding: 12px 18px;
          font-weight: 700;
          background: #16b8a6;
          color: #06110f;
        }

        .settings-save-top:disabled,
        .settings-primary-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .settings-alert {
          border-radius: 10px;
          padding: 13px 16px;
          margin-bottom: 18px;
          font-size: 14px;
        }

        .settings-error {
          background: rgba(220, 70, 70, 0.12);
          border: 1px solid rgba(220, 70, 70, 0.3);
          color: #ff9d9d;
        }

        .settings-success {
          background: rgba(22, 184, 166, 0.12);
          border: 1px solid rgba(22, 184, 166, 0.3);
          color: #69e0d2;
        }
/* =========================================================
   SETTINGS NAVIGATION
========================================================= */

.settings-layout {
  display: block;
  width: 100%;
}

.settings-navigation {
  position: relative;
  width: 100%;
  margin-bottom: 22px;
}

.settings-navigation-label {
  margin-bottom: 8px;

  color: #68778c;

  font-size: 10px;
  font-weight: 800;

  letter-spacing: 0.14em;
}

.settings-dropdown {
  position: relative;
  width: 100%;
}

.settings-dropdown-trigger {
  width: 100%;
  min-height: 68px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 12px 16px;

  border: 1px solid #253346;
  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      rgba(18, 30, 43, 0.98),
      rgba(12, 20, 30, 0.98)
    );

  color: #e8eef5;

  cursor: pointer;

  font: inherit;

  text-align: left;

  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.settings-dropdown-trigger:hover,
.settings-dropdown-trigger.open {
  border-color: rgba(22, 184, 166, 0.45);

  background:
    linear-gradient(
      135deg,
      rgba(18, 35, 46, 1),
      rgba(12, 25, 34, 1)
    );

  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.18);
}

.settings-dropdown-trigger-left {
  display: flex;
  align-items: center;

  gap: 12px;

  min-width: 0;
}

.settings-dropdown-trigger-icon {
  width: 40px;
  height: 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  border: 1px solid #29394c;
  border-radius: 10px;

  background: #111d29;

  font-size: 18px;
}

.settings-dropdown-trigger-left small {
  display: block;

  margin-bottom: 3px;

  color: #68778c;

  font-size: 9px;
  font-weight: 800;

  letter-spacing: 0.1em;

  text-transform: uppercase;
}

.settings-dropdown-trigger-left strong {
  display: block;

  overflow: hidden;

  color: #edf4fa;

  font-size: 14px;
  font-weight: 750;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-dropdown-arrow {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  border: 1px solid #2a3a4e;
  border-radius: 8px;

  background: #111c28;

  color: #8da0b5;

  font-size: 18px;

  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.settings-dropdown-trigger:hover
.settings-dropdown-arrow,
.settings-dropdown-trigger.open
.settings-dropdown-arrow {
  border-color: rgba(22, 184, 166, 0.35);
  color: #69e0d2;
}

/* =========================================================
   DROPDOWN MENU
========================================================= */

.settings-dropdown-menu {
  position: absolute;

  top: calc(100% + 8px);
  left: 0;
  right: 0;

  max-height: 430px;

  overflow-y: auto;

  padding: 8px;

  border: 1px solid #29394c;
  border-radius: 13px;

  background: #0d1722;

  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.42);

  z-index: 500;

  animation: settings-dropdown-in 0.16s ease;
}

@keyframes settings-dropdown-in {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.settings-dropdown-menu-title {
  padding: 8px 10px 9px;

  color: #617289;

  font-size: 9px;
  font-weight: 900;

  letter-spacing: 0.14em;
}

.settings-dropdown-item {
  width: 100%;
  min-height: 58px;

  display: flex;
  align-items: center;

  gap: 11px;

  padding: 9px 10px;

  border: 1px solid transparent;
  border-radius: 9px;

  background: transparent;

  color: #aebdcd;

  cursor: pointer;

  font: inherit;

  text-align: left;

  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease;
}

.settings-dropdown-item:hover {
  background: #142331;
  border-color: #22384a;

  color: #e9f1f8;
}

.settings-dropdown-item.active {
  background: rgba(22, 184, 166, 0.11);
  border-color: rgba(22, 184, 166, 0.25);

  color: #69e0d2;
}

.settings-dropdown-item-icon {
  width: 34px;
  height: 34px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  border-radius: 8px;

  background: #172432;

  font-size: 15px;
}

.settings-dropdown-item-content {
  min-width: 0;
  flex: 1;
}

.settings-dropdown-item-content strong {
  display: block;

  margin-bottom: 2px;

  font-size: 12px;
  font-weight: 750;
}

.settings-dropdown-item-content small {
  display: block;

  overflow: hidden;

  color: #65778d;

  font-size: 10px;
  line-height: 1.4;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-dropdown-item.active
.settings-dropdown-item-content small {
  color: #668e8b;
}

.settings-dropdown-check {
  width: 22px;
  height: 22px;

  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;

  border-radius: 50%;

  background: rgba(22, 184, 166, 0.16);

  color: #69e0d2;

  font-size: 12px;
  font-weight: 900;
}

.settings-version-compact {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-top: 8px;
  padding: 0 4px;

  color: #68778c;

  font-size: 10px;
}

.settings-version-compact strong {
  color: #8f9eb2;
}


.settings-content {
  min-width: 0;
}



@media (max-width: 760px) {
  .settings-navigation {
    margin-bottom: 16px;
  }

  .settings-dropdown-trigger {
    min-height: 62px;

    padding: 10px 12px;

    border-radius: 11px;
  }

  .settings-dropdown-trigger-icon {
    width: 36px;
    height: 36px;

    font-size: 16px;
  }

  .settings-dropdown-trigger-left strong {
    font-size: 13px;
  }

  .settings-dropdown-arrow {
    width: 32px;
    height: 32px;
  }

  .settings-dropdown-menu {
    max-height: 60vh;

    border-radius: 11px;
  }

  .settings-dropdown-item {
    min-height: 54px;

    padding: 8px;
  }

  .settings-dropdown-item-content small {
    font-size: 9px;
  }

  .settings-version-compact {
    padding: 0 2px;
  }
}

@media (max-width: 420px) {
  .settings-dropdown-trigger-left small {
    font-size: 8px;
  }

  .settings-dropdown-trigger-left strong {
    max-width: 210px;

    font-size: 12px;
  }

  .settings-dropdown-item-content small {
    display: none;
  }

  .settings-dropdown-item {
    min-height: 48px;
  }
}

        .settings-version strong {
          color: #8f9eb2;
        }

        .settings-card {
          margin-bottom: 22px;
          padding: 26px;
          border: 1px solid #1b2533;
          border-radius: 16px;
          background: #0e141d;
          box-shadow: 0 16px 45px rgba(0, 0, 0, 0.14);
        }

        .settings-card-header {
          margin-bottom: 24px;
        }

        .settings-card-header > div {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .settings-card-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .settings-card-icon {
          display: inline-flex;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          border-radius: 10px;
          background: #151e2a;
          font-size: 18px;
        }

        .settings-card h2 {
          margin: 0 0 5px;
          font-size: 20px;
        }

        .settings-card-header p {
          margin: 0;
          color: #7f8da3;
          font-size: 13px;
          line-height: 1.5;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .settings-field {
          min-width: 0;
        }

        .settings-field-full {
          grid-column: 1 / -1;
        }

        .settings-field label {
          display: block;
          margin-bottom: 8px;
          color: #cbd5e1;
          font-size: 13px;
          font-weight: 700;
        }

        .settings-field input,
        .settings-field textarea,
        .settings-field select,
        .category-row input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #263243;
          border-radius: 9px;
          outline: none;
          background: #0a1018;
          color: #f4f7fb;
          padding: 12px 13px;
          font: inherit;
          font-size: 14px;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease;
        }

        .settings-field textarea {
          resize: vertical;
          min-height: 100px;
        }

        .settings-field input:focus,
        .settings-field textarea:focus,
        .settings-field select:focus,
        .category-row input:focus {
          border-color: #16b8a6;
          box-shadow: 0 0 0 3px rgba(22, 184, 166, 0.1);
        }

        .settings-help {
          display: block;
          margin-top: 7px;
          color: #68778c;
          font-size: 11px;
        }

        .settings-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 15px;
          border: 1px solid #202c3b;
          border-radius: 11px;
          background: #0b1119;
        }

        .settings-toggle strong {
          display: block;
          margin-bottom: 4px;
          color: #e1e8f0;
          font-size: 14px;
        }

        .settings-toggle > div > span {
          display: block;
          color: #718097;
          font-size: 12px;
          line-height: 1.5;
        }

        .settings-switch {
          position: relative;
          width: 48px;
          height: 26px;
          flex: 0 0 auto;
          padding: 0;
          border: 0;
          border-radius: 20px;
          background: #2a3545;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .settings-switch span {
          position: absolute;
          top: 4px;
          left: 4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s ease;
        }

        .settings-switch.active {
          background: #16b8a6;
        }

        .settings-switch.active span {
          transform: translateX(22px);
        }

        .settings-inline-toggles {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .settings-secondary-button {
          padding: 10px 14px;
          border-radius: 9px;
          background: #172231;
          color: #d9e3ee;
          border: 1px solid #273548;
          font-size: 13px;
          font-weight: 700;
        }

        .settings-secondary-button:hover {
          background: #1c2a3b;
        }

        .settings-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          min-height: 160px;
          border: 1px dashed #263243;
          border-radius: 12px;
          color: #68778c;
          text-align: center;
        }

        .settings-empty > span {
          font-size: 28px;
        }

        .settings-empty p {
          margin: 0;
          font-size: 13px;
        }

        .social-links-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .social-link-row {
          display: grid;
          grid-template-columns: 32px 1fr 1fr 2fr 1fr auto;
          gap: 12px;
          align-items: end;
          padding: 16px;
          border: 1px solid #202c3b;
          border-radius: 12px;
          background: #0b1119;
        }

        .social-link-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #172231;
          color: #93a1b5;
          font-size: 12px;
          font-weight: 800;
        }

        .social-link-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 9px;
        }

        .social-enabled {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #aebaca;
          font-size: 12px;
          white-space: nowrap;
        }

        .social-enabled input {
          accent-color: #16b8a6;
        }

        .settings-delete-button {
          padding: 7px 10px;
          border-radius: 7px;
          background: rgba(220, 70, 70, 0.1);
          color: #ff9d9d;
          border: 1px solid rgba(220, 70, 70, 0.2);
          font-size: 11px;
          font-weight: 700;
        }

        .navigation-items-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .navigation-item-row {
          display: grid;
          grid-template-columns: 32px 1fr 1fr 2fr 90px auto;
          gap: 12px;
          align-items: end;
          padding: 16px;
          border: 1px solid #202c3b;
          border-radius: 12px;
          background: #0b1119;
        }

        .navigation-item-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #172231;
          color: #93a1b5;
          font-size: 12px;
          font-weight: 800;
        }

        .navigation-item-actions {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 9px;
        }

        .navigation-move-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .navigation-action-button {
          width: 30px;
          height: 30px;
          padding: 0;
          border: 1px solid #273548;
          border-radius: 7px;
          background: #172231;
          color: #d9e3ee;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
        }

        .navigation-action-button:hover:not(:disabled) {
          background: #1c2a3b;
        }

        .navigation-action-button:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .visibility-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .visibility-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 14px;
          border: 1px solid #202c3b;
          border-radius: 11px;
          background: #0b1119;
        }

        .visibility-item strong {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
        }

        .visibility-item span {
          color: #68778c;
          font-size: 11px;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .feature-item .settings-toggle {
          background: #0b1119;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .category-row {
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) auto;
          align-items: center;
          gap: 12px;
        }

        .category-row > span {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #172231;
          color: #93a1b5;
          font-size: 12px;
          font-weight: 800;
        }

        .keyword-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 10px;
        }

        .keyword-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 9px;
          border: 1px solid #263548;
          border-radius: 7px;
          background: #172231;
          color: #b9c6d5;
          font-size: 11px;
        }

        .keyword-chip button {
          padding: 0;
          border: 0;
          background: transparent;
          color: #ff9d9d;
          cursor: pointer;
          font-size: 15px;
        }

        .settings-security-note {
          margin: 14px 0 0;
          padding: 12px 14px;
          border: 1px solid #263243;
          border-radius: 9px;
          background: #0a1018;
          color: #75849a;
          font-size: 12px;
          line-height: 1.6;
        }

        .settings-bottom-actions {
          display: flex;
          justify-content: flex-end;
          padding: 4px 0 30px;
        }

        .settings-loading {
          min-height: 70vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: #7f8da3;
        }

        .settings-loading-spinner {
          width: 28px;
          height: 28px;
          border: 3px solid #253143;
          border-top-color: #16b8a6;
          border-radius: 50%;
          animation: settings-spin 0.8s linear infinite;
        }

        @keyframes settings-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .admin-shell > .admin-main {
            width: calc(100% - 220px);
            margin-left: 220px;
            padding: 28px 24px 60px;
          }
        }

        @media (max-width: 700px) {
          .admin-shell > .admin-main {
            width: 100%;
            margin-left: 0;
            padding: 20px 14px 50px;
          }

          .settings-page {
            max-width: none;
          }
        }

        @media (max-width: 1100px) {

          .social-link-row {
            grid-template-columns: 32px 1fr 1fr;
          }

          .social-link-row > .social-link-actions {
            grid-column: 1 / -1;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        @media (max-width: 1100px) {
          .navigation-item-row {
            grid-template-columns: 32px 1fr 1fr;
          }

          .navigation-item-row > .settings-field:nth-child(4) {
            grid-column: 2 / -1;
          }

          .navigation-item-row > .settings-field:nth-child(5) {
            grid-column: 2;
          }

          .navigation-item-actions {
            grid-column: 3;
          }
        }

        @media (max-width: 850px) {
          .settings-layout {
            width: 100%;
          }
        }

        @media (max-width: 760px) {
          .navigation-item-row {
            grid-template-columns: 32px 1fr;
          }

          .navigation-item-row > .settings-field:nth-child(4),
          .navigation-item-row > .settings-field:nth-child(5),
          .navigation-item-actions {
            grid-column: 2;
          }

          .navigation-item-actions {
            align-items: stretch;
          }

          .navigation-move-actions {
            width: 100%;
          }

          .navigation-move-actions .settings-delete-button {
            flex: 1;
          }

          .admin-main {
            padding: 20px 14px;
          }

          .settings-header {
            flex-direction: column;
          }

          .settings-save-top {
            width: 100%;
          }

          .settings-card {
            padding: 18px;
            border-radius: 13px;
          }

          .settings-grid,
          .settings-inline-toggles,
          .visibility-grid {
            grid-template-columns: 1fr;
          }

          .settings-field-full {
            grid-column: auto;
          }

          .settings-card-header-row {
            align-items: flex-start;
            flex-direction: column;
          }

          .settings-secondary-button {
            width: 100%;
          }

          .social-link-row {
            grid-template-columns: 1fr;
          }

          .social-link-number {
            margin-bottom: -2px;
          }

          .category-row {
            grid-template-columns: 30px minmax(0, 1fr);
          }

          .category-row .settings-delete-button,
          .category-row > button {
            grid-column: 2;
            justify-self: start;
          }

          .settings-bottom-actions {
            display: block;
          }

          .settings-primary-button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

/*
|--------------------------------------------------------------------------
| SMALL REUSABLE UI COMPONENTS
|--------------------------------------------------------------------------
*/

function Field({ label, children, full = false }) {
  return (
    <div className={`settings-field ${full ? "settings-field-full" : ""}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}

function CardHeader({ icon, title, description }) {
  return (
    <div>
      <span className="settings-card-icon">{icon}</span>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default AdminPortfolioSettingsPage;
