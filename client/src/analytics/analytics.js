import { sendAnalyticsEvent } from "../api/api.js";

const VISITOR_STORAGE_KEY = "portfolio_analytics_visitor_id";
const SESSION_STORAGE_KEY = "portfolio_analytics_session_id";

const createId = (prefix) => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

const getVisitorId = () => {
  try {
    let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);

    if (!visitorId) {
      visitorId = createId("visitor");
      localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    }

    return visitorId;
  } catch {
    return createId("visitor");
  }
};

const getSessionId = () => {
  try {
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);

    if (!sessionId) {
      sessionId = createId("session");
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }

    return sessionId;
  } catch {
    return createId("session");
  }
};

const getDeviceType = () => {
  if (typeof window === "undefined") {
    return "unknown";
  }

  const width = window.innerWidth;

  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";

  return "desktop";
};

const getDeviceData = () => {
  if (typeof window === "undefined") {
    return {
      type: "unknown",
      browser: "unknown",
      os: "unknown",
      screenWidth: null,
      screenHeight: null,
    };
  }

  return {
    type: getDeviceType(),
    browser: navigator.userAgent || "unknown",
    os: navigator.platform || "unknown",
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
  };
};

const getSourceData = () => {
  if (typeof window === "undefined") {
    return {
      type: "direct",
      medium: null,
      campaign: null,
      content: null,
      term: null,
      referrer: null,
    };
  }

  const url = new URL(window.location.href);
  const params = url.searchParams;

  const referrer = document.referrer || "";

  let sourceType = "direct";

  if (referrer) {
    try {
      const referrerUrl = new URL(referrer);

      sourceType =
        referrerUrl.hostname === window.location.hostname
          ? "internal"
          : "referral";
    } catch {
      sourceType = "referral";
    }
  }

  return {
    type: params.get("utm_source") || sourceType,
    medium: params.get("utm_medium"),
    campaign: params.get("utm_campaign"),
    content: params.get("utm_content"),
    term: params.get("utm_term"),
    referrer: referrer || null,
  };
};

const getPage = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return `${window.location.pathname}${window.location.search}`;
};

/**
 * Send one anonymous analytics event.
 *
 * Analytics failures are intentionally swallowed so analytics
 * can never break the public portfolio.
 */
export const trackEvent = async (
  event,
  { page = getPage(), entity, metadata } = {},
) => {
  try {
    const payload = {
      event,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      page,
      entity,
      source: getSourceData(),
      device: getDeviceData(),
      metadata,
      occurredAt: new Date().toISOString(),
    };

    return await sendAnalyticsEvent(payload);
  } catch {
    return null;
  }
};

/**
 * Track the beginning of a visitor session.
 */
export const trackSessionStart = () => {
  return trackEvent("session_start");
};

/**
 * Track a public page view.
 */
export const trackPageView = (page = getPage()) => {
  return trackEvent("page_view", {
    page,
  });
};

/**
 * Track a project visit.
 */
export const trackProjectView = ({ id, slug, page } = {}) => {
  return trackEvent("project_view", {
    page,
    entity: {
      type: "project",
      id,
      slug,
    },
  });
};

/**
 * Track an external/social click.
 */
export const trackExternalClick = ({ event, page, metadata } = {}) => {
  return trackEvent(event || "external_link_click", {
    page,
    metadata,
  });
};
