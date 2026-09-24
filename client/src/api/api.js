import axios from "axios";
import { fallbackSkills } from "../data/portfolioData.js";

/*
 * =========================================================
 * API BASE URL
 * =========================================================
 */

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : import.meta.env.VITE_API_URL || "";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

/*
 * =========================================================
 * AUTHORIZATION
 * =========================================================
 */

const auth = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

/*
 * =========================================================
 * PROJECTS
 * =========================================================
 */

export const fetchProjects = async () => {
  const { data } = await api.get("/api/projects");

  return data;
};

export const fetchProjectBySlug = async (slug) => {
  const { data } = await api.get(`/api/projects/slug/${slug}`);

  return data;
};

/*
 * =========================================================
 * SKILLS
 * =========================================================
 */

export const fetchSkills = async () => {
  try {
    const { data } = await api.get("/api/skills");

    return data;
  } catch (error) {
    return fallbackSkills;
  }
};

export const fetchVisibleSkills = async () => {
  try {
    const { data } = await api.get("/api/skills/visible");

    return data;
  } catch (error) {
    return fallbackSkills;
  }
};

/*
 * =========================================================
 * CONTACT
 * =========================================================
 */

export const sendMessage = async (payload) => {
  const { data } = await api.post("/api/messages", payload);

  return data;
};

/*
 * =========================================================
 * CONTACT LINKS MANAGEMENT
 * =========================================================
 */

export const fetchContactLinks = async () => {
  const { data } = await api.get("/api/contact-links");

  return data;
};

export const fetchAdminContactLinks = async (token) => {
  const { data } = await api.get("/api/contact-links/admin", auth(token));

  return data;
};

export const createContactLink = async (payload, token) => {
  const { data } = await api.post("/api/contact-links", payload, auth(token));

  return data;
};

export const updateContactLink = async (id, payload, token) => {
  const { data } = await api.put(
    `/api/contact-links/${id}`,
    payload,
    auth(token),
  );

  return data;
};

export const deleteContactLink = async (id, token) => {
  const { data } = await api.delete(`/api/contact-links/${id}`, auth(token));

  return data;
};

export const permanentlyDeleteContactLink = async (id, token) => {
  const { data } = await api.delete(
    `/api/contact-links/${id}/permanent`,
    auth(token),
  );

  return data;
};
/*
 * Admin:
 * Reorder contact/social links.
 *
 * orderedIds must contain the MongoDB IDs
 * in the exact desired display order.
 */
export const reorderContactLinks = async (orderedIds, token) => {
  const { data } = await api.put(
    "/api/contact-links/reorder",
    {
      orderedIds,
    },
    auth(token),
  );

  return data;
};
/*
 * =========================================================
 * CHATBOT
 * =========================================================
 */

export const sendChatMessage = async (payload) => {
  const { data } = await api.post("/api/chat", payload);

  return data;
};

/*
 * =========================================================
 * AUTH
 * =========================================================
 */

export const loginAdmin = async (payload) => {
  const { data } = await api.post("/api/auth/login", payload);

  return data;
};

export const forgotAdminPassword = async (payload) => {
  const { data } = await api.post("/api/auth/forgot-password", payload);

  return data;
};

export const resetAdminPassword = async (payload) => {
  const { data } = await api.post("/api/auth/reset-password", payload);

  return data;
};

export const fetchAdminStats = async (token) => {
  const { data } = await api.get("/api/admin/stats", auth(token));

  return data;
};

/*
 * =========================================================
 * PORTFOLIO SETTINGS
 * =========================================================
 */

export const fetchPortfolioSettings = async (token) => {
  const { data } = await api.get("/api/settings", auth(token));

  return data;
};

export const fetchPublicPortfolioSettings = async () => {
  const { data } = await api.get("/api/settings/public");

  return data;
};

export const updatePortfolioSettings = async (payload, token) => {
  const { data } = await api.put("/api/settings", payload, auth(token));

  return data;
};

/*
 * =========================================================
 * PORTFOLIO SETTINGS CONTROL CENTER
 * =========================================================
 */

export const fetchPortfolioSettingsComparison = async (token) => {
  const { data } = await api.get("/api/settings/comparison", auth(token));

  return data;
};

export const fetchPortfolioSettingsRevisions = async (token, limit = 20) => {
  const { data } = await api.get(
    `/api/settings/revisions?limit=${encodeURIComponent(limit)}`,
    auth(token),
  );

  return data;
};

export const fetchPortfolioSettingsRevision = async (revision, token) => {
  const { data } = await api.get(
    `/api/settings/revisions/${encodeURIComponent(revision)}`,
    auth(token),
  );

  return data;
};

export const resetPortfolioSettingsSection = async (section, token) => {
  const { data } = await api.post(
    "/api/settings/reset-section",
    {
      section,
      confirmation: true,
    },
    auth(token),
  );

  return data;
};

export const restorePortfolioSettingsRevision = async (revision, token) => {
  const { data } = await api.post(
    `/api/settings/restore-revision/${encodeURIComponent(revision)}`,
    {
      confirmation: true,
    },
    auth(token),
  );

  return data;
};

export const restorePortfolioSettingsDefaults = async (token) => {
  const { data } = await api.post(
    "/api/settings/restore-defaults",
    {
      confirmation: true,
    },
    auth(token),
  );

  return data;
};

/*
 * =========================================================
 * MESSAGES
 * =========================================================
 */

export const fetchMessages = async (token) => {
  const { data } = await api.get("/api/messages", auth(token));

  return data;
};

export const fetchMessageById = async (id, token) => {
  const { data } = await api.get(`/api/messages/${id}`, auth(token));

  return data;
};

export const markMessageRead = async (id, token) => {
  const { data } = await api.patch(`/api/messages/${id}/read`, {}, auth(token));

  return data;
};

export const markMessageUnread = async (id, token) => {
  const { data } = await api.patch(
    `/api/messages/${id}/unread`,
    {},
    auth(token),
  );

  return data;
};

export const markMessageImportant = async (id, token) => {
  const { data } = await api.patch(
    `/api/messages/${id}/important`,
    {},
    auth(token),
  );

  return data;
};

export const markMessageNotImportant = async (id, token) => {
  const { data } = await api.patch(
    `/api/messages/${id}/not-important`,
    {},
    auth(token),
  );

  return data;
};

export const archiveMessage = async (id, token) => {
  const { data } = await api.patch(
    `/api/messages/${id}/archive`,
    {},
    auth(token),
  );

  return data;
};

export const unarchiveMessage = async (id, token) => {
  const { data } = await api.patch(
    `/api/messages/${id}/unarchive`,
    {},
    auth(token),
  );

  return data;
};

export const markMessageReplied = async (id, token) => {
  const { data } = await api.patch(
    `/api/messages/${id}/replied`,
    {},
    auth(token),
  );

  return data;
};

export const markMessageNotReplied = async (id, token) => {
  const { data } = await api.patch(
    `/api/messages/${id}/not-replied`,
    {},
    auth(token),
  );

  return data;
};

export const deleteMessage = async (id, token) => {
  const { data } = await api.delete(`/api/messages/${id}`, auth(token));

  return data;
};

/*
 * =========================================================
 * CHAT LOGS
 * =========================================================
 */

export const fetchChatLogs = async (token) => {
  const { data } = await api.get("/api/chat", auth(token));

  return data;
};

export const deleteChatLog = async (id, token) => {
  const { data } = await api.delete(`/api/chat/${id}`, auth(token));

  return data;
};

/*
 * =========================================================
 * CERTIFICATES
 * =========================================================
 */

export const fetchCertificates = async () => {
  const { data } = await api.get("/api/certificates");

  return data;
};

export const uploadCertificate = async (formData, token) => {
  const { data } = await api.post("/api/certificates", formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const updateCertificate = async (id, formData, token) => {
  const { data } = await api.put(`/api/certificates/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

export const deleteCertificate = async (id, token) => {
  const { data } = await api.delete(`/api/certificates/${id}`, auth(token));

  return data;
};

export const reorderCertificates = async (certificateIds, token) => {
  const { data } = await api.put(
    "/api/certificates/reorder",
    {
      certificateIds,
    },
    auth(token),
  );

  return data;
};

/*
 * =========================================================
 * EXPERIENCE
 * =========================================================
 */

export const fetchVisibleExperiences = async () => {
  const { data } = await api.get("/api/experiences/visible");

  return data;
};

/*
 * =========================================================
 * EDUCATION
 * =========================================================
 */

export const fetchEducations = async (token) => {
  const { data } = await api.get("/api/education", auth(token));

  return data;
};

export const fetchVisibleEducations = async () => {
  const { data } = await api.get("/api/education/visible");

  return data;
};

export const createEducation = async (payload, token) => {
  const { data } = await api.post("/api/education", payload, auth(token));

  return data;
};

export const updateEducation = async (id, payload, token) => {
  const { data } = await api.put(`/api/education/${id}`, payload, auth(token));

  return data;
};

export const reorderEducations = async (educationIds, token) => {
  const { data } = await api.put(
    "/api/education/reorder",
    {
      educationIds,
    },
    auth(token),
  );

  return data;
};

export const deleteEducation = async (id, token) => {
  const { data } = await api.delete(`/api/education/${id}`, auth(token));

  return data;
};

/*
 * =========================================================
 * HOME
 * =========================================================
 */

export const fetchHomeAdmin = async (token) => {
  const { data } = await api.get("/api/home/admin", auth(token));

  return data;
};

export const updateHome = async (homeData, token) => {
  const { data } = await api.put("/api/home", homeData, auth(token));

  return data;
};

export const fetchHome = async () => {
  const { data } = await api.get("/api/home");

  return data;
};

/*
 * =========================================================
 * ABOUT
 * =========================================================
 */

export const fetchAboutAdmin = async (token) => {
  const { data } = await api.get("/api/about/admin", auth(token));

  return data;
};

export const updateAbout = async (aboutData, token) => {
  const { data } = await api.put("/api/about", aboutData, auth(token));

  return data;
};

export const fetchAbout = async () => {
  const { data } = await api.get("/api/about");

  return data;
};

/*
 * =========================================================
 * ANALYTICS
 * =========================================================
 */

export const sendAnalyticsEvent = async (payload) => {
  const { data } = await api.post("/api/analytics/events", payload);

  return data;
};

/*
 * =========================================================
 * RESUME MANAGEMENT
 * =========================================================
 */

/*
 * PUBLIC
 * Get currently active resume.
 */
export const fetchCurrentResume = async () => {
  const { data } = await api.get("/api/resume/current");

  return data;
};

/*
 * ADMIN
 * Get complete resume history.
 */
export const fetchResumeHistory = async (token) => {
  const { data } = await api.get("/api/resume", auth(token));

  return data;
};

/*
 * ADMIN
 * Upload new PDF resume.
 */
export const uploadResume = async ({
  file,
  title,
  setCurrent = true,
  token,
}) => {
  const formData = new FormData();

  formData.append("resume", file);

  if (title) {
    formData.append("title", title);
  }

  formData.append("setCurrent", String(setCurrent));

  const { data } = await api.post("/api/resume", formData, {
    ...auth(token),

    headers: {
      ...auth(token).headers,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};

/*
 * ADMIN
 * Edit resume metadata/title.
 */
export const updateResume = async (id, payload, token) => {
  const { data } = await api.put(`/api/resume/${id}`, payload, auth(token));

  return data;
};

/*
 * ADMIN
 * Enable resume.
 */
export const enableResume = async (id, token) => {
  const { data } = await api.put(`/api/resume/${id}/enable`, {}, auth(token));

  return data;
};

/*
 * ADMIN
 * Disable resume.
 */
export const disableResume = async (id, token) => {
  const { data } = await api.put(`/api/resume/${id}/disable`, {}, auth(token));

  return data;
};

/*
 * ADMIN
 * Set resume as current.
 */
export const setCurrentResume = async (id, token) => {
  const { data } = await api.put(`/api/resume/${id}/current`, {}, auth(token));

  return data;
};

/*
 * ADMIN
 * Soft delete.
 *
 * MongoDB record + PDF remain preserved.
 */
export const deleteResume = async (id, token) => {
  const { data } = await api.delete(`/api/resume/${id}`, auth(token));

  return data;
};

/*
 * ADMIN
 * Permanent delete.
 *
 * This permanently removes the
 * MongoDB document and stored PDF data.
 */
export const permanentlyDeleteResume = async (id, token) => {
  const { data } = await api.delete(`/api/resume/${id}/permanent`, auth(token));

  return data;
};

/*
 * PUBLIC
 * Track resume view.
 */
export const trackResumeView = async (id) => {
  const { data } = await api.post(`/api/resume/${id}/view`);

  return data;
};

/*
 * PUBLIC
 * Track resume download.
 */
export const trackResumeDownload = async (id) => {
  const { data } = await api.post(`/api/resume/${id}/download`);

  return data;
};

/*
 * PUBLIC
 * Build resume PDF URL.
 */
export const getResumeFileUrl = (id) => {
  return `/api/resume/${id}/file`;
};
