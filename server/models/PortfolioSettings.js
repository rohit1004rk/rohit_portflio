import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| SOCIAL LINK SCHEMA
|--------------------------------------------------------------------------
*/

const socialLinkSchema = new mongoose.Schema(
  {
    platform: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    label: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    url: {
      type: String,
      trim: true,
      maxlength: 500,
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
    },
  },
  {
    _id: true,
  },
);

/*
|--------------------------------------------------------------------------
| CTA SCHEMA
|--------------------------------------------------------------------------
*/

const ctaSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    url: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    style: {
      type: String,
      enum: ["primary", "secondary", "ghost", "outline"],
      default: "primary",
    },

    enabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| SECTION VISIBILITY SCHEMA
|--------------------------------------------------------------------------
*/

const sectionVisibilitySchema = new mongoose.Schema(
  {
    hero: {
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
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| PORTFOLIO SETTINGS SCHEMA
|--------------------------------------------------------------------------
*/

const portfolioSettingsSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | PROFILE / IDENTITY
    |--------------------------------------------------------------------------
    */

    profile: {
      name: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "Rohit Kumar",
      },

      headline: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "Full Stack + AI/ML Developer",
      },

      eyebrow: {
        type: String,
        trim: true,
        maxlength: 150,
        default: "FULL STACK + AI/ML DEVELOPER",
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
        maxlength: 10000,
        default: "",
      },

      profilePhoto: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      resume: {
        type: String,
        trim: true,
        maxlength: 1000,
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
        maxlength: 30,
        default: "",
      },

      location: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },

      socialLinks: {
        type: [socialLinkSchema],
        default: [],
      },

      openToWork: {
        type: Boolean,
        default: false,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | SITE
    |--------------------------------------------------------------------------
    | General website configuration.
    | Branding-specific fields stay inside "branding".
    | SEO-specific fields stay inside "seo".
    |--------------------------------------------------------------------------
    */

    site: {
      title: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "Rohit Kumar | Full Stack + AI/ML Developer",
      },

      metaDescription: {
        type: String,
        trim: true,
        maxlength: 320,
        default: "",
      },

      ogImage: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      defaultTheme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "dark",
      },

      customDomain: {
        type: String,
        trim: true,
        maxlength: 255,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | BRANDING
    |--------------------------------------------------------------------------
    */

    branding: {
      brandName: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "Rohit Kumar",
      },

      brandText: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "FULL STACK + AI/ML",
      },

      logo: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      logoMark: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      lightLogo: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      darkLogo: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },

      accentColor: {
        type: String,
        trim: true,
        maxlength: 30,
        default: "",
      },

      favicon: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | HOMEPAGE
    |--------------------------------------------------------------------------
    */

    homepage: {
      heroTitle: {
        type: String,
        trim: true,
        maxlength: 300,
        default: "",
      },

      heroSubtitle: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
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
        min: 0,
        max: 20,
        default: 3,
      },

      sections: {
        type: sectionVisibilitySchema,
        default: () => ({}),
      },
    },

    /*
    |--------------------------------------------------------------------------
    | CONTACT
    |--------------------------------------------------------------------------
    */

    contact: {
      enabled: {
        type: Boolean,
        default: true,
      },

      successMessage: {
        type: String,
        trim: true,
        maxlength: 500,
        default:
          "Your message has been sent successfully. I will get back to you soon.",
      },

      formCategories: {
        type: [String],
        default: ["General", "Project", "Job Opportunity", "Collaboration"],
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
        min: 1,
        max: 1440,
        default: 15,
      },

      rateLimitMaxRequests: {
        type: Number,
        min: 1,
        max: 500,
        default: 20,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | SEO
    |--------------------------------------------------------------------------
    */

    seo: {
      canonicalUrl: {
        type: String,
        trim: true,
        maxlength: 500,
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
        maxlength: 100,
        default: "Rohit Kumar",
      },

      ogTitle: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },

      ogDescription: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      twitterCard: {
        type: String,
        enum: ["summary", "summary_large_image"],
        default: "summary_large_image",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | FEATURES / FEATURE FLAGS
    |--------------------------------------------------------------------------
    */

    features: {
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
        default: false,
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

    /*
    |--------------------------------------------------------------------------
    | INTEGRATIONS
    |--------------------------------------------------------------------------
    */

    integrations: {
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

    /*
    |--------------------------------------------------------------------------
    | SETTINGS METADATA
    |--------------------------------------------------------------------------
    */

    settingsVersion: {
      type: Number,
      min: 1,
      default: 1,
    },
  },

  {
    timestamps: true,
  },
);

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const PortfolioSettings = mongoose.model(
  "PortfolioSettings",
  portfolioSettingsSchema,
);

export default PortfolioSettings;
