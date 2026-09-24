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

// ============================================================
// PUBLIC SETTINGS
// ============================================================
// GET /api/settings/public
//
// Returns only settings that are safe for the public website.
//
// NEVER expose:
// - controlCenter
// - contentControls
// - revision history
// - lastModifiedBy
// - admin/security configuration
// ============================================================

router.get("/public", async (req, res) => {
  try {
    const settings = await PortfolioSettings.findOne().lean();

    // ----------------------------------------------------------
    // Safe fallback when settings do not exist yet.
    // ----------------------------------------------------------

    if (!settings) {
      return res.status(200).json({
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
          },

          sectionOrder: [
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

        navigation: {
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

    // ----------------------------------------------------------
    // PUBLIC PROFILE
    // ----------------------------------------------------------

    const profile = {
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
      openToWork: Boolean(settings.profile?.openToWork),

      socialLinks: Array.isArray(settings.profile?.socialLinks)
        ? settings.profile.socialLinks
            .filter((link) => link?.enabled !== false)
            .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
            .map((link) => ({
              platform: link?.platform || "",
              label: link?.label || "",
              url: link?.url || "",
              icon: link?.icon || "",
              enabled: true,
              order: Number(link?.order || 0),
            }))
        : [],
    };

    // ----------------------------------------------------------
    // PUBLIC SITE SETTINGS
    // ----------------------------------------------------------

    const site = {
      title: settings.site?.title || "",
      metaDescription: settings.site?.metaDescription || "",
      favicon: settings.site?.favicon || "",
      ogImage: settings.site?.ogImage || "",
      defaultTheme: settings.site?.defaultTheme || "dark",
      logo: settings.site?.logo || "",
    };

    // ----------------------------------------------------------
    // PUBLIC BRANDING
    // ----------------------------------------------------------

    const branding = {
      brandName: settings.branding?.brandName || "",
      brandText: settings.branding?.brandText || "",
      logo: settings.branding?.logo || "",
      logoMark: settings.branding?.logoMark || "",
      lightLogo: settings.branding?.lightLogo || "",
      darkLogo: settings.branding?.darkLogo || "",
      accentColor: settings.branding?.accentColor || "",
      favicon: settings.branding?.favicon || "",
    };

    // ----------------------------------------------------------
    // PUBLIC HOMEPAGE
    // ----------------------------------------------------------

    const homepage = {
      heroTitle: settings.homepage?.heroTitle || "",
      heroSubtitle: settings.homepage?.heroSubtitle || "",
      heroDescription: settings.homepage?.heroDescription || "",

      primaryCta: {
        label: settings.homepage?.primaryCta?.label || "",
        url: settings.homepage?.primaryCta?.url || "",
        style: settings.homepage?.primaryCta?.style || "primary",
        enabled: settings.homepage?.primaryCta?.enabled !== false,
      },

      secondaryCta: {
        label: settings.homepage?.secondaryCta?.label || "",
        url: settings.homepage?.secondaryCta?.url || "",
        style: settings.homepage?.secondaryCta?.style || "secondary",
        enabled: settings.homepage?.secondaryCta?.enabled !== false,
      },

      showStats: settings.homepage?.showStats !== false,

      showAvailability: settings.homepage?.showAvailability !== false,

      featuredProjectCount: Math.min(
        Math.max(Number(settings.homepage?.featuredProjectCount) || 3, 0),
        12,
      ),

      sections: {
        hero: settings.homepage?.sections?.hero !== false,
        codeShowcase: settings.homepage?.sections?.codeShowcase !== false,
        featuredProjects:
          settings.homepage?.sections?.featuredProjects !== false,
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

      sectionOrder: Array.isArray(settings.homepage?.sectionOrder)
        ? settings.homepage.sectionOrder
        : [
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
    };

    // ----------------------------------------------------------
    // PUBLIC NAVIGATION
    // ----------------------------------------------------------

    const navigationItems = Array.isArray(settings.navigation?.items)
      ? settings.navigation.items
          .filter((item) => item?.enabled !== false)
          .sort((a, b) => Number(a?.order || 0) - Number(b?.order || 0))
          .map((item) => ({
            id: item?.id || "",
            label: item?.label || "",
            url: item?.url || "/",
            enabled: true,
            order: Number(item?.order || 0),
          }))
      : [];

    const navigation = {
      enabled: settings.navigation?.enabled !== false,
      items: navigationItems,
    };

    // ----------------------------------------------------------
    // PUBLIC FOOTER
    // ----------------------------------------------------------

    const footer = {
      enabled: settings.footer?.enabled !== false,
      copyrightText:
        settings.footer?.copyrightText ||
        "© {year} Rohit Kumar. All rights reserved.",
      tagline: settings.footer?.tagline || "FULL STACK + AI/ML DEVELOPER",
      showSocialLinks: settings.footer?.showSocialLinks !== false,
      showEmail: settings.footer?.showEmail !== false,
      showAdminLink: settings.footer?.showAdminLink !== false,
    };

    // ----------------------------------------------------------
    // PUBLIC CONTACT
    // ----------------------------------------------------------

    const contact = {
      enabled: settings.contact?.enabled !== false,
      contactEmail: settings.contact?.contactEmail || "",
      phone: settings.contact?.phone || "",
      location: settings.contact?.location || "",
      successMessage:
        settings.contact?.successMessage ||
        "Your message has been sent successfully. I will get back to you soon.",
    };

    // ----------------------------------------------------------
    // PUBLIC SEO
    // ----------------------------------------------------------

    const seo = {
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
    };

    // ----------------------------------------------------------
    // PUBLIC FEATURES
    // ----------------------------------------------------------

    const features = {
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
    };

    // ----------------------------------------------------------
    // PRIVACY-AWARE PUBLIC PROFILE
    // ----------------------------------------------------------

    if (settings.privacy?.showEmail === false) {
      profile.email = "";
      contact.contactEmail = "";
    }

    if (settings.privacy?.showPhone === false) {
      profile.phone = "";
      contact.phone = "";
    }

    if (settings.privacy?.showLocation === false) {
      profile.location = "";
      contact.location = "";
    }

    if (settings.privacy?.showSocialLinks === false) {
      profile.socialLinks = [];
    }

    if (settings.privacy?.showAvailability === false) {
      profile.openToWork = false;
      homepage.showAvailability = false;
    }

    if (
      settings.privacy?.allowContactForm === false ||
      settings.features?.contactEnabled === false
    ) {
      contact.enabled = false;
      homepage.sections.contact = false;
    }

    // ----------------------------------------------------------
    // FINAL SAFE RESPONSE
    // ----------------------------------------------------------

    return res.status(200).json({
      profile,
      site,
      branding,
      homepage,
      navigation,
      footer,
      contact,
      seo,
      features,
    });
  } catch (error) {
    console.error("Get public portfolio settings error:", error);

    return res.status(500).json({
      message: "Failed to load public portfolio settings",
    });
  }
});

// ============================================================
// ADMIN SETTINGS ROUTES
// ============================================================

// GET current settings
router.get("/", protect, admin, getSettings);

// UPDATE settings
router.put("/", protect, admin, updateSettings);

// CURRENT VS DEFAULT
router.get("/comparison", protect, admin, getSettingsComparison);

// REVISION HISTORY
router.get("/revisions", protect, admin, getRevisionHistory);

// ONE REVISION
router.get("/revisions/:revision", protect, admin, getRevision);

// RESET ONE SECTION
router.post("/reset-section", protect, admin, resetSection);

// RESTORE ONE REVISION
router.post("/restore-revision/:revision", protect, admin, restoreRevision);

// RESTORE ALL DEFAULTS
router.post("/restore-defaults", protect, admin, restoreDefaults);

export default router;
