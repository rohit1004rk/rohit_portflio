import PortfolioSettings from "../models/PortfolioSettings.js";

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
    sections: {},
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

  settingsVersion: 1,
});

const mergeSection = (currentSection, incomingSection) => {
  if (!incomingSection || typeof incomingSection !== "object") {
    return currentSection;
  }

  return {
    ...(currentSection?.toObject?.() || currentSection || {}),
    ...incomingSection,
  };
};

// =========================================================
// GET ADMIN SETTINGS
// =========================================================
const getSettings = async (req, res) => {
  try {
    let settings = await PortfolioSettings.findOne();

    if (!settings) {
      settings = await PortfolioSettings.create(getDefaultSettings());
    }

    return res.status(200).json(settings);
  } catch (error) {
    console.error("Get portfolio settings error:", error);

    return res.status(500).json({
      message: "Failed to load portfolio settings",
    });
  }
};

// =========================================================
// UPDATE ADMIN SETTINGS
// =========================================================
const updateSettings = async (req, res) => {
  try {
    const allowedSections = [
      "profile",
      "site",
      "branding",
      "homepage",
      "contact",
      "seo",
      "features",
      "integrations",
    ];

    let settings = await PortfolioSettings.findOne();

    if (!settings) {
      settings = new PortfolioSettings(getDefaultSettings());
    }

    for (const section of allowedSections) {
      if (req.body[section] !== undefined) {
        settings[section] = mergeSection(settings[section], req.body[section]);
      }
    }

    settings.settingsVersion = (settings.settingsVersion || 1) + 1;

    await settings.save();

    return res.status(200).json({
      message: "Portfolio settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update portfolio settings error:", error);

    if (error.name === "ValidationError") {
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

export { getSettings, updateSettings };
