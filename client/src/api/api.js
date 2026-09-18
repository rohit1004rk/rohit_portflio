import axios from "axios";
import { fallbackSkills } from "../data/portfolioData.js";

// In development VITE_API_URL is empty and Vite proxies /api to the Express
// server. In production it points at the deployed API origin.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

/** Authorization header for admin-only endpoints. */
const auth = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// ── Projects ─────────────────────────────────────────────
export const fetchProjects = async () => {
  const { data } = await api.get("/api/projects");
  return data;
};

export const fetchProjectBySlug = async (slug) => {
  const { data } = await api.get(`/api/projects/slug/${slug}`);
  return data;
};

// ── Skills ───────────────────────────────────────────────
export const fetchSkills = async () => {
  try {
    const { data } = await api.get("/api/skills");
    return data;
  } catch (error) {
    return fallbackSkills;
  }
};

// Get only visible skill categories for the public portfolio
export const fetchVisibleSkills = async () => {
  try {
    const { data } = await api.get("/api/skills/visible");
    return data;
  } catch (error) {
    return fallbackSkills;
  }
};

// ── Contact ──────────────────────────────────────────────
export const sendMessage = async (payload) => {
  const { data } = await api.post("/api/messages", payload);
  return data;
};

// ── Chatbot ──────────────────────────────────────────────
export const sendChatMessage = async (payload) => {
  const { data } = await api.post("/api/chat", payload);
  return data;
};

// ── Auth (admin) ─────────────────────────────────────────
export const loginAdmin = async (payload) => {
  const { data } = await api.post("/api/auth/login", payload);
  return data;
};

export const fetchAdminStats = async (token) => {
  const { data } = await api.get("/api/admin/stats", auth(token));
  return data;
};

// ── Portfolio Settings ──────────────────────────────────
export const fetchPortfolioSettings = async (token) => {
  const { data } = await api.get("/api/settings", auth(token));
  return data;
};

export const updatePortfolioSettings = async (payload, token) => {
  const { data } = await api.put("/api/settings", payload, auth(token));
  return data;
};

// ── Messages ─────────────────────────────────────────────
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

// ── Chat Logs ─────────────────────────────────────────────
export const fetchChatLogs = async (token) => {
  const { data } = await api.get("/api/chat", auth(token));
  return data;
};

export const deleteChatLog = async (id, token) => {
  const { data } = await api.delete(`/api/chat/${id}`, auth(token));
  return data;
};

// ── Certificates ─────────────────────────────────────────

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

// Update an existing certificate
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

// Reorder certificate records
export const reorderCertificates = async (certificateIds, token) => {
  const { data } = await api.put(
    "/api/certificates/reorder",
    { certificateIds },
    auth(token),
  );

  return data;
};

// ── Experience ───────────────────────────────────────────

// Get only visible experiences for the public portfolio
export const fetchVisibleExperiences = async () => {
  const { data } = await api.get("/api/experiences/visible");
  return data;
};

// ── Education ────────────────────────────────────────────

// Get all education records for the admin panel
export const fetchEducations = async (token) => {
  const { data } = await api.get("/api/education", auth(token));
  return data;
};

// Get only visible education records for the public portfolio
export const fetchVisibleEducations = async () => {
  const { data } = await api.get("/api/education/visible");
  return data;
};

// Create a new education record
export const createEducation = async (payload, token) => {
  const { data } = await api.post("/api/education", payload, auth(token));
  return data;
};

// Update an existing education record
export const updateEducation = async (id, payload, token) => {
  const { data } = await api.put(`/api/education/${id}`, payload, auth(token));
  return data;
};

// Reorder education records
export const reorderEducations = async (educationIds, token) => {
  const { data } = await api.put(
    "/api/education/reorder",
    { educationIds },
    auth(token),
  );
  return data;
};

// Delete an education record
export const deleteEducation = async (id, token) => {
  const { data } = await api.delete(`/api/education/${id}`, auth(token));
  return data;
};
