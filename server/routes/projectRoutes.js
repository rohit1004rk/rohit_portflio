import express from "express";

import PortfolioSettings from "../models/PortfolioSettings.js";

import {
  getSettings,
  updateSettings,
  getSettingsComparison,
  getRevisionHistory,
  getRevision,
  resetSection,
  restoreRevision,
  restoreDefaults,
} from "../controllers/portfolioSettingsController.js";

import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ============================================================
   PUBLIC PORTFOLIO SETTINGS
   ============================================================

   IMPORTANT:
   This endpoint is intentionally public-safe.

   It NEVER exposes:
   - controlCenter
   - contentControls
   - revision history
   - admin metadata
   - lastModifiedBy
   - internal/private configuration

   It only returns settings that the public website needs
   to render itself.
============================================================ */

router.get("/public", async (req, res) => {
  try {
    const settings = await PortfolioSettings.findOne().lean();

    if (!settings) {
      return res.status(200).json({
        profile: {
          name: "Rohit Kumar",
          headline: "Full Stack + AI/ML Developer",
          eyebrow: "FULL STACK + AI/ML DEVELOPER",
          shortBio: "",
          fullBio: "",
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

        contact: {
          enabled: true,
          contactEmail: "",
          phone: "",
          location: "",
          successMessage:
            "Your message has been sent successfully. I will get back to you soon.",
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
      });
    }

    const publicSettings = {
      profile: {
        name: settings.profile?.name || "",
        headline: settings.profile?.headline || "",
        eyebrow: settings.profile?.eyebrow || "",
        shortBio: settings.profile?.shortBio || "",
        fullBio: settings.profile?.fullBio || "",
        profilePhoto: settings.profile?.profilePhoto || "",
        resume: settings.profile?.resume || "",
        email: settings.profile?.email || "",
        phone: settings.profile?.phone || "",
        location: settings.profile?.location || "",
        socialLinks: Array.isArray(settings.profile?.socialLinks)
          ? settings.profile.socialLinks
              .filter((item) => item && item.enabled !== false)
              .sort((a, b) => (a.order || 0) - (b.order || 0))
          : [],
        openToWork: Boolean(settings.profile?.openToWork),
      },

      site: {
        title: settings.site?.title || "",
        metaDescription: settings.site?.metaDescription || "",
        favicon: settings.site?.favicon || "",
        ogImage: settings.site?.ogImage || "",
        defaultTheme: settings.site?.defaultTheme || "dark",
        logo: settings.site?.logo || "",
      },

      branding: {
        brandName: settings.branding?.brandName || "",
        brandText: settings.branding?.brandText || "",
        logo: settings.branding?.logo || "",
        logoMark: settings.branding?.logoMark || "",
        lightLogo: settings.branding?.lightLogo || "",
        darkLogo: settings.branding?.darkLogo || "",
        accentColor: settings.branding?.accentColor || "",
        favicon: settings.branding?.favicon || "",
      },

      homepage: {
        heroTitle: settings.homepage?.heroTitle || "",
        heroSubtitle: settings.homepage?.heroSubtitle || "",
        heroDescription: settings.homepage?.heroDescription || "",

        primaryCta: {
          label: settings.homepage?.primaryCta?.label || "View Projects",
          url: settings.homepage?.primaryCta?.url || "/projects",
          style: settings.homepage?.primaryCta?.style || "primary",
          enabled: settings.homepage?.primaryCta?.enabled !== false,
        },

        secondaryCta: {
          label: settings.homepage?.secondaryCta?.label || "Contact Me",
          url: settings.homepage?.secondaryCta?.url || "/contact",
          style: settings.homepage?.secondaryCta?.style || "secondary",
          enabled: settings.homepage?.secondaryCta?.enabled !== false,
        },

        showStats: settings.homepage?.showStats !== false,
        showAvailability: settings.homepage?.showAvailability !== false,

        featuredProjectCount: Math.max(
          1,
          Math.min(Number(settings.homepage?.featuredProjectCount) || 3, 12),
        ),

        sections: {
          hero: settings.homepage?.sections?.hero !== false,
          about: settings.homepage?.sections?.about !== false,
          skills: settings.homepage?.sections?.skills !== false,
          experience: settings.homepage?.sections?.experience !== false,
          projects: settings.homepage?.sections?.projects !== false,
          achievements: settings.homepage?.sections?.achievements !== false,
          education: settings.homepage?.sections?.education !== false,
          certificates: settings.homepage?.sections?.certificates !== false,
          testimonials: settings.homepage?.sections?.testimonials === true,
          blog: settings.homepage?.sections?.blog === true,
          contact: settings.homepage?.sections?.contact !== false,
        },
      },

      contact: {
        enabled: settings.contact?.enabled !== false,
        contactEmail: settings.contact?.contactEmail || "",
        phone: settings.contact?.phone || "",
        location: settings.contact?.location || "",
        successMessage:
          settings.contact?.successMessage ||
          "Your message has been sent successfully. I will get back to you soon.",
      },

      seo: {
        canonicalUrl: settings.seo?.canonicalUrl || "",
        robotsIndex: settings.seo?.robotsIndex !== false,
        robotsFollow: settings.seo?.robotsFollow !== false,
        keywords: Array.isArray(settings.seo?.keywords)
          ? settings.seo.keywords
          : [],
        author: settings.seo?.author || "",
        ogTitle: settings.seo?.ogTitle || "",
        ogDescription: settings.seo?.ogDescription || "",
        twitterCard: settings.seo?.twitterCard || "summary_large_image",
      },

      features: {
        contactEnabled: settings.features?.contactEnabled !== false,
        projectsEnabled: settings.features?.projectsEnabled !== false,
        skillsEnabled: settings.features?.skillsEnabled !== false,
        experienceEnabled: settings.features?.experienceEnabled !== false,
        educationEnabled: settings.features?.educationEnabled !== false,
        certificatesEnabled: settings.features?.certificatesEnabled !== false,
        achievementsEnabled: settings.features?.achievementsEnabled !== false,
        testimonialsEnabled: settings.features?.testimonialsEnabled === true,
        blogEnabled: settings.features?.blogEnabled === true,
        chatbotEnabled: settings.features?.chatbotEnabled === true,
        analyticsEnabled: settings.features?.analyticsEnabled === true,
        maintenanceMode: settings.features?.maintenanceMode === true,
      },
    };

    return res.status(200).json(publicSettings);
  } catch (error) {
    console.error("Get public portfolio settings error:", error);

    return res.status(500).json({
      message: "Failed to load public portfolio settings",
    });
  }
});

/* ============================================================
   ADMIN SETTINGS
============================================================ */

// Get current settings
router.get("/", protect, admin, getSettings);

// Update settings
router.put("/", protect, admin, updateSettings);

// Current vs default comparison
router.get("/comparison", protect, admin, getSettingsComparison);

// Revision history
router.get("/revisions", protect, admin, getRevisionHistory);

// Specific revision
router.get("/revisions/:revision", protect, admin, getRevision);

// Reset one section
router.post("/reset-section", protect, admin, resetSection);

// Restore historical revision
router.post("/restore-revision/:revision", protect, admin, restoreRevision);

// Restore all settings to defaults
router.post("/restore-defaults", protect, admin, restoreDefaults);

export default router;
