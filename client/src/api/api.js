import axios from 'axios';
import { fallbackSkills } from '../data/portfolioData.js';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
});

// ── Projects ─────────────────────────────────────────────
export const fetchProjects = async () => {
  const { data } = await api.get('/api/projects');
  return data;
};

export const fetchProjectBySlug = async (slug) => {
  const { data } = await api.get(`/api/projects/slug/${slug}`);
  return data;
};

// ── Skills ───────────────────────────────────────────────
export const fetchSkills = async () => {
  try {
    const { data } = await api.get('/api/skills');
    return data;
  } catch (error) {
    return fallbackSkills;
  }
};

// ── Contact ──────────────────────────────────────────────
export const sendMessage = async (payload) => {
  const { data } = await api.post('/api/messages', payload);
  return data;
};

// ── Chatbot ──────────────────────────────────────────────
export const sendChatMessage = async (payload) => {
  const { data } = await api.post('/api/chat', payload);
  return data;
};

// ── Auth (admin) ─────────────────────────────────────────
export const loginAdmin = async (payload) => {
  const { data } = await api.post('/api/auth/login', payload);
  return data;
};

export const fetchAdminStats = async (token) => {
  const { data } = await api.get('/api/admin/stats', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const fetchMessages = async (token) => {
  const { data } = await api.get('/api/messages', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const markMessageRead = async (id, token) => {
  const { data } = await api.patch(`/api/messages/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteMessage = async (id, token) => {
  const { data } = await api.delete(`/api/messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const fetchChatLogs = async (token) => {
  const { data } = await api.get('/api/chat', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

export const deleteChatLog = async (id, token) => {
  const { data } = await api.delete(`/api/chat/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};
