import AnalyticsOverview from "../components/admin/AnalyticsOverview.jsx";
import AdminSidebar from "../components/admin/AdminSidebar.jsx";
import ResumeManagement from "../components/admin/ResumeManagement.jsx";
import ContactLinksManagement from "../components/admin/ContactLinksManagement.jsx";
import CertificateManagement from "../components/admin/CertificateManagement.jsx";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  fetchAdminStats,
  fetchMessages,
  fetchChatLogs,
  markMessageRead,
  deleteMessage,
  deleteChatLog,
} from "../api/api.js";

import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

function AdminDashboardPage() {
  useDocumentTitle("Admin Dashboard");

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    let isMounted = true;

    const load = async (isInitialLoad = false) => {
      try {
        const [statsRes, messagesRes, chatsRes] = await Promise.all([
          fetchAdminStats(token),
          fetchMessages(token),
          fetchChatLogs(token),
        ]);

        if (!isMounted) return;

        setStats(statsRes);
        setMessages(messagesRes);
        setChats(chatsRes);

        if (isInitialLoad) {
          setLoading(false);
        }
      } catch (err) {
        if (!isMounted) return;

        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminUser");

          navigate("/admin/login");
        } else {
          setError(
            err.response?.data?.message || "Could not load dashboard data.",
          );

          if (isInitialLoad) {
            setLoading(false);
          }
        }
      }
    };

    // Initial dashboard load.
    load(true);

    // Refresh dashboard data every 30 seconds.
    const refreshInterval = setInterval(() => {
      load(false);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(refreshInterval);
    };
  }, [token, navigate]);

  const handleRead = async (id) => {
    try {
      await markMessageRead(id, token);

      setMessages((current) =>
        current.map((message) =>
          message._id === id
            ? {
                ...message,
                read: true,
              }
            : message,
        ),
      );
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/admin/login");
      }
    }
  };

  const handleDeleteMessage = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteMessage(id, token);

      setMessages((current) => current.filter((message) => message._id !== id));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/admin/login");
      } else {
        setError(err.response?.data?.message || "Failed to delete message.");
      }
    }
  };

  const handleDeleteChat = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this chat query?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteChatLog(id, token);

      setChats((current) => current.filter((chat) => chat._id !== id));
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");

        navigate("/admin/login");
      } else {
        setError(err.response?.data?.message || "Failed to delete chat query.");
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");

    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="admin-shell">
        <AdminSidebar onLogout={logout} />

        <main className="admin-main">
          <div className="container">
            <div className="loading">
              <div className="spinner" />

              <p>Loading dashboard…</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const fmt = (iso) =>
    iso
      ? new Date(iso).toLocaleString("en-US", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "";

  return (
    <div className="admin-shell">
      <AdminSidebar onLogout={logout} />

      <main className="admin-main">
        <div className="container">
          {/* ─────────────────────────────────────
              ADMIN TOPBAR
          ───────────────────────────────────── */}

          <div className="admin-topbar">
            <div>
              <span className="eyebrow">Admin Panel</span>

              <h1>Dashboard</h1>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <Link to="/" className="btn btn-ghost btn-sm">
                ← View Site
              </Link>

              <button className="btn btn-ghost btn-sm" onClick={logout}>
                Logout
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────
              GLOBAL ERROR
          ───────────────────────────────────── */}

          {error && <p className="form-note err">{error}</p>}

          {/* ─────────────────────────────────────
              STATS
          ───────────────────────────────────── */}

          {stats && (
            <div className="admin-stats">
              <div className="admin-stat">
                <div className="val">{stats.totalMessages}</div>

                <div className="lab">Total Messages</div>
              </div>

              <div className="admin-stat">
                <div
                  className="val"
                  style={{
                    color: "var(--accent)",
                  }}
                >
                  {stats.unreadMessages}
                </div>

                <div className="lab">Unread</div>
              </div>

              <div className="admin-stat">
                <div
                  className="val"
                  style={{
                    color: "var(--teal)",
                  }}
                >
                  {stats.totalChats}
                </div>

                <div className="lab">Chat Queries</div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────
              ANALYTICS
          ───────────────────────────────────── */}

          <AnalyticsOverview analytics={stats?.analytics} />

          {/* ─────────────────────────────────────
              RESUME CMS
          ───────────────────────────────────── */}

          <ResumeManagement />

          {/* ─────────────────────────────────────
              CONTACT LINKS CMS
          ───────────────────────────────────── */}

          <ContactLinksManagement />

          {/* ─────────────────────────────────────
              CERTIFICATES CMS
          ───────────────────────────────────── */}

          <CertificateManagement />

          {/* ─────────────────────────────────────
              CONTACT MESSAGES
          ───────────────────────────────────── */}

          <div className="admin-panel">
            <h2>📬 Contact Messages</h2>

            {messages.length === 0 ? (
              <p className="admin-empty">No messages yet.</p>
            ) : (
              <div className="admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>Status</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Subject</th>
                      <th>Message</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {messages.map((message) => (
                      <tr key={message._id}>
                        <td className={message.read ? "read" : "unread"}>
                          {message.read ? "Read" : "Unread"}
                        </td>

                        <td className="row-title">{message.name}</td>

                        <td>{message.email}</td>

                        <td>{message.subject}</td>

                        <td
                          style={{
                            maxWidth: "240px",
                          }}
                        >
                          {message.message}
                        </td>

                        <td>{fmt(message.createdAt)}</td>

                        <td>
                          <div className="admin-actions">
                            {!message.read && (
                              <button onClick={() => handleRead(message._id)}>
                                Mark read
                              </button>
                            )}

                            <button
                              className="danger"
                              onClick={() => handleDeleteMessage(message._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ─────────────────────────────────────
              CHAT QUERIES
          ───────────────────────────────────── */}

          <div className="admin-panel">
            <h2>🤖 Chat Queries</h2>

            {chats.length === 0 ? (
              <p className="admin-empty">No chat queries yet.</p>
            ) : (
              <div className="admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Bot Reply</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {chats.map((chat) => (
                      <tr key={chat._id}>
                        <td
                          className="row-title"
                          style={{
                            maxWidth: "200px",
                          }}
                        >
                          {chat.userMessage}
                        </td>

                        <td
                          style={{
                            maxWidth: "260px",
                          }}
                        >
                          {chat.botReply}
                        </td>

                        <td>{fmt(chat.createdAt)}</td>

                        <td>
                          <div className="admin-actions">
                            <button
                              className="danger"
                              onClick={() => handleDeleteChat(chat._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboardPage;
