import mongoose from "mongoose";

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    label: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    url: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    icon: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const ctaSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "",
    },
    url: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    style: {
      type: String,
      trim: true,
      enum: ["primary", "secondary", "outline", "ghost", "link"],
      default: "primary",
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const sectionVisibilitySchema = new mongoose.Schema(
  {
    hero: {
      type: Boolean,
      default: true,
    },
    codeShowcase: {
      type: Boolean,
      default: true,
    },
    featuredProjects: {
      type: Boolean,
      default: true,
    },
    about: {
      type: Boolean,
      default: true,
    },
    skills: {
      type: Boolean,
      default: true,
    },
    experience: {
      type: Boolean,
      default: true,
    },
    projects: {
      type: Boolean,
      default: true,
    },
    achievements: {
      type: Boolean,
      default: true,
    },
    education: {
      type: Boolean,
      default: true,
    },
    certificates: {
      type: Boolean,
      default: true,
    },
    testimonials: {
      type: Boolean,
      default: false,
    },
    blog: {
      type: Boolean,
      default: false,
    },
    contact: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const navigationItemSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      trim: true,
      maxlength: 100,
      required: true,
    },
    label: {
      type: String,
      trim: true,
      maxlength: 100,
      required: true,
    },
    url: {
      type: String,
      trim: true,
      maxlength: 500,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const navigationSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    items: {
      type: [navigationItemSchema],
      default: [],
    },
  },
  { _id: false },
);

const footerSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    copyrightText: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "© {year} Rohit Kumar. All rights reserved.",
    },
    tagline: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "FULL STACK + AI/ML DEVELOPER",
    },
    showSocialLinks: {
      type: Boolean,
      default: true,
    },
    showEmail: {
      type: Boolean,
      default: true,
    },
    showAdminLink: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const profileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "Rohit Kumar",
    },
    headline: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "Full Stack + AI/ML Developer",
    },
    eyebrow: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "HELLO, I'M",
    },
    shortBio: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    fullBio: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },
    profilePhoto: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    resume: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    socialLinks: {
      type: [socialLinkSchema],
      default: [],
    },
    openToWork: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const siteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "Rohit Kumar | Full Stack + AI/ML Developer",
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    favicon: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    ogImage: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    defaultTheme: {
      type: String,
      trim: true,
      enum: ["dark", "light", "system"],
      default: "dark",
    },
    logo: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    customDomain: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    analyticsId: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const brandingSchema = new mongoose.Schema(
  {
    brandName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "Rohit Kumar",
    },
    brandText: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "FULL STACK + AI/ML",
    },
    logo: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    logoMark: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    lightLogo: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    darkLogo: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    accentColor: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "#00E5FF",
    },
    favicon: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { _id: false },
);

const homepageSchema = new mongoose.Schema(
  {
    heroTitle: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "Rohit Kumar — Full Stack + AI/ML Developer",
    },
    heroSubtitle: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "Building digital experiences with code, creativity and AI.",
    },
    heroDescription: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    primaryCta: {
      type: ctaSchema,
      default: () => ({
        label: "View Projects",
        url: "/projects",
        style: "primary",
        enabled: true,
      }),
    },
    secondaryCta: {
      type: ctaSchema,
      default: () => ({
        label: "Contact Me",
        url: "/contact",
        style: "secondary",
        enabled: true,
      }),
    },
    showStats: {
      type: Boolean,
      default: true,
    },
    showAvailability: {
      type: Boolean,
      default: true,
    },
    featuredProjectCount: {
      type: Number,
      default: 2,
      min: 0,
      max: 12,
    },
    sections: {
      type: sectionVisibilitySchema,
      default: () => ({}),
    },
    sectionOrder: {
      type: [String],
      default: [
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
      ],
    },
  },
  { _id: false },
);

const contactSchema = new mongoose.Schema(
  {
    enabled: {
      type: Boolean,
      default: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    successMessage: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "Thanks! Your message has been sent successfully.",
    },
    formCategories: {
      type: [String],
      default: ["General", "Project", "Collaboration", "Job Opportunity"],
    },
    notificationEmail: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 200,
      default: "",
    },
    enableEmailNotification: {
      type: Boolean,
      default: true,
    },
    enableHoneypot: {
      type: Boolean,
      default: true,
    },
    enableCaptcha: {
      type: Boolean,
      default: false,
    },
    rateLimitEnabled: {
      type: Boolean,
      default: true,
    },
    rateLimitWindowMinutes: {
      type: Number,
      default: 15,
      min: 1,
      max: 1440,
    },
    rateLimitMaxRequests: {
      type: Number,
      default: 5,
      min: 1,
      max: 1000,
    },
  },
  { _id: false },
);

const seoSchema = new mongoose.Schema(
  {
    canonicalUrl: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    robotsIndex: {
      type: Boolean,
      default: true,
    },
    robotsFollow: {
      type: Boolean,
      default: true,
    },
    keywords: {
      type: [String],
      default: [],
    },
    author: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "Rohit Kumar",
    },
    ogTitle: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    ogDescription: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },
    twitterCard: {
      type: String,
      trim: true,
      enum: ["summary", "summary_large_image", "app", "player"],
      default: "summary_large_image",
    },
  },
  { _id: false },
);

const featuresSchema = new mongoose.Schema(
  {
    contactEnabled: {
      type: Boolean,
      default: true,
    },
    projectsEnabled: {
      type: Boolean,
      default: true,
    },
    skillsEnabled: {
      type: Boolean,
      default: true,
    },
    experienceEnabled: {
      type: Boolean,
      default: true,
    },
    educationEnabled: {
      type: Boolean,
      default: true,
    },
    certificatesEnabled: {
      type: Boolean,
      default: true,
    },
    achievementsEnabled: {
      type: Boolean,
      default: true,
    },
    testimonialsEnabled: {
      type: Boolean,
      default: false,
    },
    blogEnabled: {
      type: Boolean,
      default: false,
    },
    chatbotEnabled: {
      type: Boolean,
      default: true,
    },
    analyticsEnabled: {
      type: Boolean,
      default: false,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false },
);

const integrationsSchema = new mongoose.Schema(
  {
    github: {
      enabled: {
        type: Boolean,
        default: false,
      },

      username: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },
    },

    linkedin: {
      enabled: {
        type: Boolean,
        default: false,
      },

      profileUrl: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },
    },

    googleAnalytics: {
      enabled: {
        type: Boolean,
        default: false,
      },

      measurementId: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },
    },

    googleSearchConsole: {
      enabled: {
        type: Boolean,
        default: false,
      },

      verificationCode: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },
    },

    cloudinary: {
      enabled: {
        type: Boolean,
        default: false,
      },
    },
  },
  { _id: false },
);

const privacySchema = new mongoose.Schema(
  {
    showEmail: {
      type: Boolean,
      default: true,
    },
    showPhone: {
      type: Boolean,
      default: true,
    },
    showLocation: {
      type: Boolean,
      default: true,
    },
    showSocialLinks: {
      type: Boolean,
      default: true,
    },
    allowContactForm: {
      type: Boolean,
      default: true,
    },
    showAvailability: {
      type: Boolean,
      default: true,
    },
    cookieNoticeEnabled: {
      type: Boolean,
      default: false,
    },
    privacyPolicyUrl: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
    termsUrl: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },
  },
  { _id: false },
);

const contentControlSchema = new mongoose.Schema(
  {
    manageEnabled: {
      type: Boolean,
      default: true,
    },
    reorderEnabled: {
      type: Boolean,
      default: true,
    },
    deleteConfirmationRequired: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false },
);

const contentControlsSchema = new mongoose.Schema(
  {
    projects: {
      type: contentControlSchema,
      default: () => ({}),
    },
    skills: {
      type: contentControlSchema,
      default: () => ({}),
    },
    experience: {
      type: contentControlSchema,
      default: () => ({}),
    },
    education: {
      type: contentControlSchema,
      default: () => ({}),
    },
    certificates: {
      type: contentControlSchema,
      default: () => ({}),
    },
    achievements: {
      type: contentControlSchema,
      default: () => ({}),
    },
    testimonials: {
      type: contentControlSchema,
      default: () => ({}),
    },
    blog: {
      type: contentControlSchema,
      default: () => ({}),
    },
  },
  { _id: false },
);

const controlCenterSchema = new mongoose.Schema(
  {
    confirmDestructiveActions: {
      type: Boolean,
      default: true,
    },
    requireSaveConfirmation: {
      type: Boolean,
      default: false,
    },
    showAdvancedControls: {
      type: Boolean,
      default: true,
    },
    auditLogEnabled: {
      type: Boolean,
      default: true,
    },
    backupBeforeReset: {
      type: Boolean,
      default: true,
    },
    maxRevisionEntries: {
      type: Number,
      default: 50,
      min: 1,
      max: 500,
    },
  },
  { _id: false },
);

const portfolioSettingsSchema = new mongoose.Schema(
  {
    profile: {
      type: profileSchema,
      default: () => ({}),
    },

    site: {
      type: siteSchema,
      default: () => ({}),
    },

    branding: {
      type: brandingSchema,
      default: () => ({}),
    },

    homepage: {
      type: homepageSchema,
      default: () => ({}),
    },

    navigation: {
      type: navigationSchema,
      default: () => ({
        enabled: true,
        items: [
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
        ],
      }),
    },

    footer: {
      type: footerSchema,
      default: () => ({
        enabled: true,
        copyrightText: "© {year} Rohit Kumar. All rights reserved.",
        tagline: "FULL STACK + AI/ML DEVELOPER",
        showSocialLinks: true,
        showEmail: true,
        showAdminLink: true,
      }),
    },

    contact: {
      type: contactSchema,
      default: () => ({}),
    },

    seo: {
      type: seoSchema,
      default: () => ({}),
    },

    features: {
      type: featuresSchema,
      default: () => ({}),
    },

    integrations: {
      type: integrationsSchema,
      default: () => ({}),
    },

    privacy: {
      type: privacySchema,
      default: () => ({}),
    },

    contentControls: {
      type: contentControlsSchema,
      default: () => ({}),
    },

    controlCenter: {
      type: controlCenterSchema,
      default: () => ({}),
    },

    settingsVersion: {
      type: Number,
      default: 2,
      min: 1,
    },

    revision: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  },
);

const PortfolioSettings = mongoose.model(
  "PortfolioSettings",
  portfolioSettingsSchema,
);

export default PortfolioSettings;
