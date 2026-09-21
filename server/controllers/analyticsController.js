import AnalyticsEvent from "../models/AnalyticsEvent.js";

const ALLOWED_EVENTS = new Set([
  "page_view",
  "session_start",
  "project_view",
  "project_github_click",
  "project_demo_click",
  "resume_view",
  "resume_download",
  "contact_page_view",
  "contact_form_start",
  "contact_form_submit",
  "github_click",
  "linkedin_click",
  "youtube_click",
  "instagram_click",
  "email_click",
  "skill_view",
  "experience_view",
  "certificate_view",
  "achievement_view",
  "cta_click",
  "external_link_click",
  "search",
  "scroll_depth",
]);

const ALLOWED_DEVICE_TYPES = new Set([
  "mobile",
  "tablet",
  "desktop",
  "unknown",
]);

const cleanString = (value, maxLength = 500) => {
  if (typeof value !== "string") return null;

  const cleaned = value.trim();

  if (!cleaned) return null;

  return cleaned.slice(0, maxLength);
};

const sanitizeEntity = (entity) => {
  if (!entity || typeof entity !== "object") {
    return undefined;
  }

  return {
    type: cleanString(entity.type, 50),
    id: cleanString(entity.id, 128),
    slug: cleanString(entity.slug, 200),
  };
};

const sanitizeSource = (source) => {
  if (!source || typeof source !== "object") {
    return undefined;
  }

  return {
    type: cleanString(source.type, 100) || "direct",
    medium: cleanString(source.medium, 100),
    campaign: cleanString(source.campaign, 200),
    content: cleanString(source.content, 200),
    term: cleanString(source.term, 200),
    referrer: cleanString(source.referrer, 1000),
  };
};

const sanitizeDevice = (device) => {
  if (!device || typeof device !== "object") {
    return undefined;
  }

  const type = ALLOWED_DEVICE_TYPES.has(device.type) ? device.type : "unknown";

  const screenWidth =
    Number.isFinite(Number(device.screenWidth)) &&
    Number(device.screenWidth) >= 0 &&
    Number(device.screenWidth) <= 10000
      ? Number(device.screenWidth)
      : null;

  const screenHeight =
    Number.isFinite(Number(device.screenHeight)) &&
    Number(device.screenHeight) >= 0 &&
    Number(device.screenHeight) <= 10000
      ? Number(device.screenHeight)
      : null;

  return {
    type,
    browser: cleanString(device.browser, 100) || "unknown",
    os: cleanString(device.os, 100) || "unknown",
    screenWidth,
    screenHeight,
  };
};

const sanitizeLocation = (location) => {
  if (!location || typeof location !== "object") {
    return undefined;
  }

  return {
    country: cleanString(location.country, 100),
    region: cleanString(location.region, 150),
    city: cleanString(location.city, 150),
  };
};

// @desc    Record one anonymous portfolio analytics event
// @route   POST /api/analytics/events
// @access  Public
export const createAnalyticsEvent = async (req, res) => {
  try {
    const {
      event,
      visitorId,
      sessionId,
      page,
      entity,
      source,
      device,
      location,
      metadata,
      occurredAt,
    } = req.body || {};

    // Event validation
    if (!event || !ALLOWED_EVENTS.has(event)) {
      return res.status(400).json({
        message: "Invalid analytics event.",
      });
    }

    // Anonymous visitor/session identifiers are required.
    const safeVisitorId = cleanString(visitorId, 128);
    const safeSessionId = cleanString(sessionId, 128);

    if (!safeVisitorId || !safeSessionId) {
      return res.status(400).json({
        message: "visitorId and sessionId are required.",
      });
    }

    // Never allow arbitrary objects to be stored as uncontrolled metadata.
    let safeMetadata = {};

    if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
      const allowedMetadata = {};

      for (const [key, value] of Object.entries(metadata)) {
        if (!/^[a-zA-Z0-9_-]{1,50}$/.test(key)) {
          continue;
        }

        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          allowedMetadata[key] =
            typeof value === "string" ? value.slice(0, 500) : value;
        }
      }

      safeMetadata = allowedMetadata;
    }

    const eventData = {
      event,
      visitorId: safeVisitorId,
      sessionId: safeSessionId,
      page: cleanString(page, 500) || "",
      entity: sanitizeEntity(entity),
      source: sanitizeSource(source),
      device: sanitizeDevice(device),
      location: sanitizeLocation(location),
      metadata: safeMetadata,
    };

    // Only accept a client timestamp when it is a valid date.
    // Otherwise the Mongoose default timestamp is used.
    if (occurredAt) {
      const parsedDate = new Date(occurredAt);

      if (!Number.isNaN(parsedDate.getTime())) {
        eventData.occurredAt = parsedDate;
      }
    }

    const analyticsEvent = await AnalyticsEvent.create(eventData);

    return res.status(201).json({
      success: true,
      id: analyticsEvent._id,
    });
  } catch (error) {
    console.error("Analytics event error:", error);

    return res.status(500).json({
      message: "Failed to record analytics event.",
    });
  }
};
