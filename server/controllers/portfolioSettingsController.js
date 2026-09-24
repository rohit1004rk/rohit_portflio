import PortfolioSettings from "../models/PortfolioSettings.js";
import PortfolioSettingsRevision from "../models/PortfolioSettingsRevision.js";

// ============================================================
// CONSTANTS
// ============================================================

const SETTINGS_SECTIONS = [
  "profile",
  "site",
  "branding",
  "homepage",
  "navigation",
  "footer",
  "contact",
  "seo",
  "features",
  "integrations",
  "privacy",
  "contentControls",
  "controlCenter",
];

const RESETTABLE_SECTIONS = [...SETTINGS_SECTIONS];

const HOMEPAGE_SECTION_KEYS = [
  "hero",
  "codeShowcase",
  "featuredProjects",
  "about",
  "skills",
  "experience",
  "projects",
  "achievements",
  "education",
  "certificates",
  "testimonials",
  "blog",
  "contact",
];

const DEFAULT_NAVIGATION_ITEMS = [
  {
    id: "home",
    label: "Home",
    url: "/",
    enabled: true,
    order: 0,
  },
  {
    id: "about",
    label: "About",
    url: "/about",
    enabled: true,
    order: 1,
  },
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
];

const DEFAULT_HOMEPAGE_SECTIONS = {
  hero: true,
  codeShowcase: true,
  featuredProjects: true,
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
};

const DEFAULT_HOMEPAGE_SECTION_ORDER = [...HOMEPAGE_SECTION_KEYS];

// ============================================================
// DEFAULT SETTINGS
// ============================================================

const getDefaultSettings = () => ({
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
    favicon: "",
    ogImage: "",
    defaultTheme: "dark",
    logo: "",
    customDomain: "",
    analyticsId: "",
    maintenanceMode: false,
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
      ...DEFAULT_HOMEPAGE_SECTIONS,
    },

    sectionOrder: [...DEFAULT_HOMEPAGE_SECTION_ORDER],
  },

  navigation: {
    enabled: true,
    items: cloneValue(DEFAULT_NAVIGATION_ITEMS),
  },

  footer: {
    enabled: true,
    copyrightText: "© {year} Rohit Kumar. All rights reserved.",
    tagline: "FULL STACK + AI/ML DEVELOPER",
    showSocialLinks: true,
    showEmail: true,
    showAdminLink: true,
  },

  contact: {
    enabled: true,
    contactEmail: "",
    phone: "",
    location: "",

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

  settingsVersion: 2,
  revision: 0,
  lastModifiedBy: null,
});

// ============================================================
// HELPERS
// ============================================================

const cloneValue = (value) => {
  if (value === undefined || value === null) {
    return value;
  }

  return JSON.parse(JSON.stringify(value));
};

const mergeSection = (currentSection, incomingSection) => {
  if (
    !incomingSection ||
    typeof incomingSection !== "object" ||
    Array.isArray(incomingSection)
  ) {
    return incomingSection;
  }

  return {
    ...(currentSection?.toObject?.() || currentSection || {}),
    ...incomingSection,
  };
};

const normalizeHomepageSectionOrder = (homepage = {}) => {
  const incomingOrder = Array.isArray(homepage.sectionOrder)
    ? homepage.sectionOrder
    : [];

  const validIncoming = incomingOrder.filter((key) =>
    HOMEPAGE_SECTION_KEYS.includes(key),
  );

  const missingKeys = HOMEPAGE_SECTION_KEYS.filter(
    (key) => !validIncoming.includes(key),
  );

  return [...validIncoming, ...missingKeys];
};

const normalizeHomepageSections = (homepage = {}) => {
  const currentSections =
    homepage.sections && typeof homepage.sections === "object"
      ? homepage.sections
      : {};

  return HOMEPAGE_SECTION_KEYS.reduce((result, key) => {
    result[key] =
      typeof currentSections[key] === "boolean"
        ? currentSections[key]
        : DEFAULT_HOMEPAGE_SECTIONS[key];

    return result;
  }, {});
};

const normalizeNavigationItems = (navigation = {}) => {
  const incomingItems = Array.isArray(navigation.items) ? navigation.items : [];

  const fallbackItems = cloneValue(DEFAULT_NAVIGATION_ITEMS);

  if (incomingItems.length === 0) {
    return fallbackItems;
  }

  const normalized = incomingItems
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({
      id:
        typeof item.id === "string" && item.id.trim()
          ? item.id.trim()
          : `nav-${index + 1}`,
      label:
        typeof item.label === "string" && item.label.trim()
          ? item.label.trim()
          : `Item ${index + 1}`,
      url:
        typeof item.url === "string" && item.url.trim() ? item.url.trim() : "/",
      enabled: item.enabled !== false,
      order:
        Number.isFinite(Number(item.order)) && Number(item.order) >= 0
          ? Number(item.order)
          : index,
    }));

  return normalized.sort((a, b) => a.order - b.order);
};

const normalizeSettingsForSave = (settings) => {
  if (settings.homepage) {
    settings.homepage.sections = normalizeHomepageSections(settings.homepage);

    settings.homepage.sectionOrder = normalizeHomepageSectionOrder(
      settings.homepage,
    );
  }

  if (settings.navigation) {
    settings.navigation.items = normalizeNavigationItems(settings.navigation);
  }

  return settings;
};

const createSettingsSnapshot = (settings) => {
  const snapshot =
    settings?.toObject?.({
      depopulate: true,
      flattenMaps: true,
    }) || {};

  delete snapshot._id;
  delete snapshot.__v;
  delete snapshot.createdAt;
  delete snapshot.updatedAt;

  return snapshot;
};

const getDefaultSection = (section) => {
  const defaults = getDefaultSettings();

  if (!RESETTABLE_SECTIONS.includes(section)) {
    return undefined;
  }

  return cloneValue(defaults[section]);
};

const getChangedSections = (body) =>
  SETTINGS_SECTIONS.filter(
    (section) =>
      Object.prototype.hasOwnProperty.call(body || {}, section) &&
      body[section] !== undefined,
  );

const createRevision = async ({
  settings,
  req,
  action,
  changedSections = [],
  resetTarget = "",
  description = "",
  metadata = {},
}) => {
  try {
    return await PortfolioSettingsRevision.create({
      revision: settings.revision || 0,
      action,
      changedBy: req.user?._id || null,
      changedByEmail: req.user?.email || "",
      changedSections,
      resetTarget,
      description,
      snapshot: createSettingsSnapshot(settings),
      metadata,
    });
  } catch (error) {
    console.error("Portfolio settings revision creation error:", error);

    return null;
  }
};

const ensureSettings = async (req) => {
  let settings = await PortfolioSettings.findOne();

  if (settings) {
    let changed = false;

    if (!settings.homepage?.sections) {
      settings.homepage.sections = cloneValue(DEFAULT_HOMEPAGE_SECTIONS);
      changed = true;
    } else {
      const normalizedSections = normalizeHomepageSections(settings.homepage);

      if (
        JSON.stringify(settings.homepage.sections) !==
        JSON.stringify(normalizedSections)
      ) {
        settings.homepage.sections = normalizedSections;
        changed = true;
      }
    }

    if (!Array.isArray(settings.homepage?.sectionOrder)) {
      settings.homepage.sectionOrder = [...DEFAULT_HOMEPAGE_SECTION_ORDER];
      changed = true;
    } else {
      const normalizedOrder = normalizeHomepageSectionOrder(settings.homepage);

      if (
        JSON.stringify(settings.homepage.sectionOrder) !==
        JSON.stringify(normalizedOrder)
      ) {
        settings.homepage.sectionOrder = normalizedOrder;
        changed = true;
      }
    }

    if (!settings.navigation) {
      settings.navigation = {
        enabled: true,
        items: cloneValue(DEFAULT_NAVIGATION_ITEMS),
      };
      changed = true;
    } else if (!Array.isArray(settings.navigation.items)) {
      settings.navigation.items = cloneValue(DEFAULT_NAVIGATION_ITEMS);
      changed = true;
    }

    if (!settings.footer) {
      settings.footer = {
        enabled: true,
        copyrightText: "© {year} Rohit Kumar. All rights reserved.",
        tagline: "FULL STACK + AI/ML DEVELOPER",
        showSocialLinks: true,
        showEmail: true,
        showAdminLink: true,
      };
      changed = true;
    }

    if (changed) {
      normalizeSettingsForSave(settings);
      await settings.save();
    }

    return settings;
  }

  settings = await PortfolioSettings.create(getDefaultSettings());

  await createRevision({
    settings,
    req,
    action: "create",
    changedSections: SETTINGS_SECTIONS,
    description: "Initial portfolio settings created.",
    metadata: {
      source: "ensureSettings",
    },
  });

  return settings;
};

// ============================================================
// GET CURRENT SETTINGS
// ============================================================

const getSettings = async (req, res) => {
  try {
    const settings = await ensureSettings(req);

    return res.status(200).json(settings);
  } catch (error) {
    console.error("Get portfolio settings error:", error);

    return res.status(500).json({
      message: "Failed to load portfolio settings",
    });
  }
};

// ============================================================
// UPDATE SETTINGS
// ============================================================

const updateSettings = async (req, res) => {
  try {
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).json({
        message: "Invalid portfolio settings payload.",
      });
    }

    const changedSections = getChangedSections(req.body);

    if (changedSections.length === 0) {
      return res.status(400).json({
        message: "No valid portfolio settings sections were provided.",
      });
    }

    const settings = await ensureSettings(req);
    const previousRevision = settings.revision || 0;

    for (const section of changedSections) {
      settings[section] = mergeSection(settings[section], req.body[section]);
    }

    normalizeSettingsForSave(settings);

    settings.settingsVersion = Math.max(
      Number(settings.settingsVersion) || 1,
      2,
    );

    settings.revision = previousRevision + 1;

    if (req.user?._id) {
      settings.lastModifiedBy = req.user._id;
    }

    await settings.save();

    await createRevision({
      settings,
      req,
      action: "update",
      changedSections,
      description: `Portfolio settings updated: ${changedSections.join(", ")}.`,
      metadata: {
        previousRevision,
        settingsVersion: settings.settingsVersion,
        source: "updateSettings",
      },
    });

    return res.status(200).json({
      message: "Portfolio settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update portfolio settings error:", error);

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid portfolio settings",
        errors: Object.values(error.errors).map(
          (validationError) => validationError.message,
        ),
      });
    }

    return res.status(500).json({
      message: "Failed to update portfolio settings",
    });
  }
};

// ============================================================
// CURRENT VS DEFAULT
// ============================================================

const getSettingsComparison = async (req, res) => {
  try {
    const settings = await ensureSettings(req);
    const defaults = getDefaultSettings();

    const current = createSettingsSnapshot(settings);

    const comparison = {};

    for (const section of SETTINGS_SECTIONS) {
      const currentValue = current[section];
      const defaultValue = defaults[section];

      comparison[section] = {
        current: currentValue,
        default: defaultValue,
        customized:
          JSON.stringify(currentValue) !== JSON.stringify(defaultValue),
      };
    }

    const customizedSections = SETTINGS_SECTIONS.filter(
      (section) => comparison[section].customized,
    );

    const defaultSections = SETTINGS_SECTIONS.filter(
      (section) => !comparison[section].customized,
    );

    return res.status(200).json({
      revision: settings.revision || 0,
      settingsVersion: settings.settingsVersion || 2,
      lastModifiedBy: settings.lastModifiedBy || null,
      updatedAt: settings.updatedAt || null,

      summary: {
        totalSections: SETTINGS_SECTIONS.length,
        customizedCount: customizedSections.length,
        defaultCount: defaultSections.length,
      },

      customizedSections,
      defaultSections,
      comparison,
    });
  } catch (error) {
    console.error("Get portfolio settings comparison error:", error);

    return res.status(500).json({
      message: "Failed to compare portfolio settings",
    });
  }
};

// ============================================================
// REVISION HISTORY
// ============================================================

const getRevisionHistory = async (req, res) => {
  try {
    const settings = await ensureSettings(req);

    let limit = Number.parseInt(req.query.limit, 10);

    if (!Number.isFinite(limit)) {
      limit = 20;
    }

    limit = Math.min(Math.max(limit, 1), 100);

    const revisions = await PortfolioSettingsRevision.find()
      .sort({ revision: -1, createdAt: -1 })
      .limit(limit)
      .populate("changedBy", "name email role")
      .lean();

    return res.status(200).json({
      currentRevision: settings.revision || 0,
      limit,
      count: revisions.length,
      revisions,
    });
  } catch (error) {
    console.error("Get portfolio settings revision history error:", error);

    return res.status(500).json({
      message: "Failed to load portfolio settings history",
    });
  }
};

// ============================================================
// GET ONE REVISION
// ============================================================

const getRevision = async (req, res) => {
  try {
    const revisionNumber = Number.parseInt(req.params.revision, 10);

    if (!Number.isInteger(revisionNumber) || revisionNumber < 0) {
      return res.status(400).json({
        message: "Invalid revision number.",
      });
    }

    const revision = await PortfolioSettingsRevision.findOne({
      revision: revisionNumber,
    })
      .populate("changedBy", "name email role")
      .lean();

    if (!revision) {
      return res.status(404).json({
        message: "Revision not found.",
      });
    }

    return res.status(200).json(revision);
  } catch (error) {
    console.error("Get portfolio settings revision error:", error);

    return res.status(500).json({
      message: "Failed to load portfolio settings revision",
    });
  }
};

// ============================================================
// RESET ONE SECTION
// ============================================================

const resetSection = async (req, res) => {
  try {
    const { section, confirmation } = req.body || {};

    if (!section || typeof section !== "string") {
      return res.status(400).json({
        message: "A settings section is required.",
      });
    }

    if (!RESETTABLE_SECTIONS.includes(section)) {
      return res.status(400).json({
        message: `Invalid reset section: ${section}`,
      });
    }

    if (confirmation !== true) {
      return res.status(400).json({
        message:
          "Explicit confirmation is required before resetting a settings section.",
      });
    }

    const settings = await ensureSettings(req);
    const previousRevision = settings.revision || 0;

    const defaultSection = getDefaultSection(section);

    settings[section] = defaultSection;

    normalizeSettingsForSave(settings);

    settings.settingsVersion = Math.max(
      Number(settings.settingsVersion) || 1,
      2,
    );

    settings.revision = previousRevision + 1;

    if (req.user?._id) {
      settings.lastModifiedBy = req.user._id;
    }

    await settings.save();

    await createRevision({
      settings,
      req,
      action: "reset_section",
      changedSections: [section],
      resetTarget: section,
      description: `Settings section "${section}" was restored to its default configuration.`,
      metadata: {
        previousRevision,
        source: "resetSection",
      },
    });

    return res.status(200).json({
      message: `Settings section "${section}" reset successfully.`,
      settings,
      resetSection: section,
    });
  } catch (error) {
    console.error("Reset portfolio settings section error:", error);

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid default settings configuration.",
        errors: Object.values(error.errors).map(
          (validationError) => validationError.message,
        ),
      });
    }

    return res.status(500).json({
      message: "Failed to reset settings section",
    });
  }
};

// ============================================================
// RESTORE PREVIOUS REVISION
// ============================================================

const restoreRevision = async (req, res) => {
  try {
    const revisionNumber = Number.parseInt(req.params.revision, 10);

    const { confirmation } = req.body || {};

    if (!Number.isInteger(revisionNumber) || revisionNumber < 0) {
      return res.status(400).json({
        message: "Invalid revision number.",
      });
    }

    if (confirmation !== true) {
      return res.status(400).json({
        message:
          "Explicit confirmation is required before restoring a revision.",
      });
    }

    const historicalRevision = await PortfolioSettingsRevision.findOne({
      revision: revisionNumber,
    }).lean();

    if (!historicalRevision) {
      return res.status(404).json({
        message: "Revision not found.",
      });
    }

    if (
      !historicalRevision.snapshot ||
      typeof historicalRevision.snapshot !== "object"
    ) {
      return res.status(400).json({
        message: "The selected revision does not contain a valid snapshot.",
      });
    }

    const settings = await ensureSettings(req);
    const previousRevision = settings.revision || 0;
    const snapshot = historicalRevision.snapshot;

    for (const section of SETTINGS_SECTIONS) {
      if (Object.prototype.hasOwnProperty.call(snapshot, section)) {
        settings[section] = cloneValue(snapshot[section]);
      }
    }

    normalizeSettingsForSave(settings);

    settings.settingsVersion = Math.max(
      Number(snapshot.settingsVersion) || 1,
      2,
    );

    settings.revision = previousRevision + 1;

    if (req.user?._id) {
      settings.lastModifiedBy = req.user._id;
    }

    await settings.save();

    const restoredSections = SETTINGS_SECTIONS.filter((section) =>
      Object.prototype.hasOwnProperty.call(snapshot, section),
    );

    await createRevision({
      settings,
      req,
      action: "restore_revision",
      changedSections: restoredSections,
      resetTarget: `revision:${revisionNumber}`,
      description: `Portfolio settings restored from revision ${revisionNumber}.`,
      metadata: {
        previousRevision,
        restoredRevision: revisionNumber,
        source: "restoreRevision",
      },
    });

    return res.status(200).json({
      message: `Portfolio settings restored from revision ${revisionNumber}.`,
      settings,
      restoredRevision: revisionNumber,
    });
  } catch (error) {
    console.error("Restore portfolio settings revision error:", error);

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "The selected revision contains invalid settings.",
        errors: Object.values(error.errors).map(
          (validationError) => validationError.message,
        ),
      });
    }

    return res.status(500).json({
      message: "Failed to restore portfolio settings revision",
    });
  }
};

// ============================================================
// RESTORE ALL SETTINGS TO DEFAULTS
// ============================================================

const restoreDefaults = async (req, res) => {
  try {
    const { confirmation } = req.body || {};

    if (confirmation !== true) {
      return res.status(400).json({
        message:
          "Explicit confirmation is required before restoring all settings to defaults.",
      });
    }

    const settings = await ensureSettings(req);
    const previousRevision = settings.revision || 0;

    const defaults = getDefaultSettings();

    for (const section of SETTINGS_SECTIONS) {
      settings[section] = cloneValue(defaults[section]);
    }

    settings.settingsVersion = 2;
    settings.revision = previousRevision + 1;

    if (req.user?._id) {
      settings.lastModifiedBy = req.user._id;
    }

    await settings.save();

    await createRevision({
      settings,
      req,
      action: "restore_defaults",
      changedSections: SETTINGS_SECTIONS,
      resetTarget: "all-settings",
      description:
        "All portfolio settings were restored to the application defaults.",
      metadata: {
        previousRevision,
        source: "restoreDefaults",
      },
    });

    return res.status(200).json({
      message: "All portfolio settings restored to defaults.",
      settings,
    });
  } catch (error) {
    console.error("Restore portfolio settings defaults error:", error);

    if (error?.name === "ValidationError") {
      return res.status(400).json({
        message: "Invalid default settings configuration.",
        errors: Object.values(error.errors).map(
          (validationError) => validationError.message,
        ),
      });
    }

    return res.status(500).json({
      message: "Failed to restore portfolio settings defaults",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

export {
  getSettings,
  updateSettings,
  getSettingsComparison,
  getRevisionHistory,
  getRevision,
  resetSection,
  restoreRevision,
  restoreDefaults,
};
