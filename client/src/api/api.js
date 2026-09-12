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

export const fetchMessages = async (token) => {
  const { data } = await api.get("/api/messages", auth(token));
  return data;
};

export const markMessageRead = async (id, token) => {
  const { data } = await api.patch(`/api/messages/${id}/read`, {}, auth(token));
  return data;
};

export const deleteMessage = async (id, token) => {
  const { data } = await api.delete(`/api/messages/${id}`, auth(token));
  return data;
};

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

export const deleteCertificate = async (id, token) => {
  const { data } = await api.delete(`/api/certificates/${id}`, auth(token));

  return data;
};
