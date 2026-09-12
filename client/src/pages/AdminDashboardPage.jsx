import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchAdminStats,
  fetchMessages,
  fetchChatLogs,
  markMessageRead,
  deleteMessage,
  deleteChatLog,
  fetchCertificates,
  uploadCertificate,
  deleteCertificate,
} from "../api/api.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

function AdminDashboardPage() {
  useDocumentTitle("Admin Dashboard");

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");

  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [certificates, setCertificates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [error, setError] = useState("");
  const [certificateError, setCertificateError] = useState("");
  const [certificateSuccess, setCertificateSuccess] = useState("");

  const [certificateForm, setCertificateForm] = useState({
    title: "",
    issuer: "",
    certificateId: "",
    category: "Certification",
    completionDate: "",
    description: "",
    file: null,
  });

  useEffect(() => {
    if (!token) {
      navigate("/admin/login");
      return;
    }

    const load = async () => {
      try {
        const [statsRes, messagesRes, chatsRes, certificatesRes] =
          await Promise.all([
            fetchAdminStats(token),
            fetchMessages(token),
            fetchChatLogs(token),
            fetchCertificates(),
          ]);

        setStats(statsRes);
        setMessages(messagesRes);
        setChats(chatsRes);
        setCertificates(Array.isArray(certificatesRes) ? certificatesRes : []);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
        } else {
          setError(
            err.response?.data?.message || "Could not load dashboard data.",
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, navigate]);

  const handleRead = async (id) => {
    await markMessageRead(id, token);

    setMessages((m) => m.map((x) => (x._id === id ? { ...x, read: true } : x)));
  };

  const handleDeleteMessage = async (id) => {
    await deleteMessage(id, token);

    setMessages((m) => m.filter((x) => x._id !== id));
  };

  const handleDeleteChat = async (id) => {
    await deleteChatLog(id, token);

    setChats((c) => c.filter((x) => x._id !== id));
  };

  const handleCertificateChange = (event) => {
    const { name, value, files } = event.target;

    setCertificateForm((current) => ({
      ...current,
      [name]: name === "file" ? files?.[0] || null : value,
    }));
  };

  const handleCertificateUpload = async (event) => {
    event.preventDefault();

    setCertificateError("");
    setCertificateSuccess("");

    if (!certificateForm.title.trim()) {
      setCertificateError("Certificate title is required.");
      return;
    }

    if (!certificateForm.issuer.trim()) {
      setCertificateError("Issuer is required.");
      return;
    }

    if (!certificateForm.file) {
      setCertificateError("Please select a certificate file.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(certificateForm.file.type)) {
      setCertificateError(
        "Only PDF, JPG, JPEG, PNG and WEBP files are allowed.",
      );
      return;
    }

    if (certificateForm.file.size > 10 * 1024 * 1024) {
      setCertificateError("Certificate file must be 10 MB or smaller.");
      return;
    }

    try {
      setCertificateLoading(true);

      const formData = new FormData();

      formData.append("title", certificateForm.title.trim());
      formData.append("issuer", certificateForm.issuer.trim());
      formData.append("certificateId", certificateForm.certificateId.trim());
      formData.append("category", certificateForm.category.trim());
      formData.append("completionDate", certificateForm.completionDate.trim());
      formData.append("description", certificateForm.description.trim());
      formData.append("certificate", certificateForm.file);

      const response = await uploadCertificate(formData, token);

      if (response?.certificate) {
        setCertificates((current) => [response.certificate, ...current]);
      }

      setCertificateForm({
        title: "",
        issuer: "",
        certificateId: "",
        category: "Certification",
        completionDate: "",
        description: "",
        file: null,
      });

      const fileInput = document.getElementById("certificate-file");

      if (fileInput) {
        fileInput.value = "";
      }

      setCertificateSuccess("Certificate uploaded successfully.");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setCertificateError(
        err.response?.data?.message || "Failed to upload certificate.",
      );
    } finally {
      setCertificateLoading(false);
    }
  };

  const handleDeleteCertificate = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this certificate?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setCertificateError("");
      setCertificateSuccess("");

      await deleteCertificate(id, token);

      setCertificates((current) =>
        current.filter((certificate) => certificate._id !== id),
      );

      setCertificateSuccess("Certificate deleted successfully.");
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
        return;
      }

      setCertificateError(
        err.response?.data?.message || "Failed to delete certificate.",
      );
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
        <div className="loading">
          <div className="spinner" />
          <p>Loading dashboard…</p>
        </div>
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
      <div className="container">
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

        {error && <p className="form-note err">{error}</p>}

        {stats && (
          <div className="admin-stats">
            <div className="admin-stat">
              <div className="val">{stats.totalMessages}</div>
              <div className="lab">Total Messages</div>
            </div>

            <div className="admin-stat">
              <div className="val" style={{ color: "var(--accent)" }}>
                {stats.unreadMessages}
              </div>
              <div className="lab">Unread</div>
            </div>

            <div className="admin-stat">
              <div className="val" style={{ color: "var(--teal)" }}>
                {stats.totalChats}
              </div>
              <div className="lab">Chat Queries</div>
            </div>
          </div>
        )}

        {/* ── Certificates CMS ─────────────────────────── */}
        <div className="admin-panel">
          <h2>📜 Certificates</h2>

          <p className="admin-empty">
            Upload and manage certificates displayed under Achievements →
            Certifications.
          </p>

          <form
            onSubmit={handleCertificateUpload}
            className="certificate-admin-form"
          >
            <div className="certificate-admin-grid">
              <div className="form-field">
                <label htmlFor="certificate-title">Certificate Title</label>

                <input
                  id="certificate-title"
                  name="title"
                  type="text"
                  value={certificateForm.title}
                  onChange={handleCertificateChange}
                  placeholder="e.g. Internship Completion Certificate"
                  maxLength={200}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="certificate-issuer">Issuer</label>

                <input
                  id="certificate-issuer"
                  name="issuer"
                  type="text"
                  value={certificateForm.issuer}
                  onChange={handleCertificateChange}
                  placeholder="e.g. InternPe"
                  maxLength={150}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="certificate-id">Certificate ID</label>

                <input
                  id="certificate-id"
                  name="certificateId"
                  type="text"
                  value={certificateForm.certificateId}
                  onChange={handleCertificateChange}
                  placeholder="e.g. IPI#75119"
                  maxLength={100}
                />
              </div>

              <div className="form-field">
                <label htmlFor="certificate-category">Category</label>

                <input
                  id="certificate-category"
                  name="category"
                  type="text"
                  value={certificateForm.category}
                  onChange={handleCertificateChange}
                  placeholder="Certification"
                  maxLength={100}
                />
              </div>

              <div className="form-field">
                <label htmlFor="certificate-date">Completion Date</label>

                <input
                  id="certificate-date"
                  name="completionDate"
                  type="text"
                  value={certificateForm.completionDate}
                  onChange={handleCertificateChange}
                  placeholder="e.g. 07 June 2026"
                  maxLength={50}
                />
              </div>

              <div className="form-field">
                <label htmlFor="certificate-file">Certificate File</label>

                <input
                  id="certificate-file"
                  name="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  onChange={handleCertificateChange}
                  required
                />

                <small>PDF, JPG, JPEG, PNG or WEBP — maximum 10 MB.</small>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="certificate-description">Description</label>

              <textarea
                id="certificate-description"
                name="description"
                value={certificateForm.description}
                onChange={handleCertificateChange}
                placeholder="Short description of the certificate or program."
                maxLength={1000}
                rows={4}
              />
            </div>

            {certificateError && (
              <p className="form-note err">{certificateError}</p>
            )}

            {certificateSuccess && (
              <p className="form-note success">{certificateSuccess}</p>
            )}

            <button
              type="submit"
              className="btn btn-teal"
              disabled={certificateLoading}
            >
              {certificateLoading ? "Uploading…" : "Upload Certificate →"}
            </button>
          </form>

          <div className="certificate-admin-list">
            <h3>Uploaded Certificates</h3>

            {certificates.length === 0 ? (
              <p className="admin-empty">No certificates uploaded yet.</p>
            ) : (
              <div className="admin-table">
                <table>
                  <thead>
                    <tr>
                      <th>Certificate</th>
                      <th>Issuer</th>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {certificates.map((certificate) => (
                      <tr key={certificate._id}>
                        <td className="row-title">{certificate.title}</td>

                        <td>{certificate.issuer}</td>

                        <td>{certificate.certificateId || "—"}</td>

                        <td>{certificate.completionDate || "—"}</td>

                        <td>
                          <div className="admin-actions">
                            <a
                              href={`/api/certificates/${certificate._id}/file`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>

                            <button
                              className="danger"
                              onClick={() =>
                                handleDeleteCertificate(certificate._id)
                              }
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

        {/* ── Contact Messages ─────────────────────────── */}
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
                  {messages.map((m) => (
                    <tr key={m._id}>
                      <td className={m.read ? "read" : "unread"}>
                        {m.read ? "Read" : "Unread"}
                      </td>

                      <td className="row-title">{m.name}</td>

                      <td>{m.email}</td>

                      <td>{m.subject}</td>

                      <td style={{ maxWidth: "240px" }}>{m.message}</td>

                      <td>{fmt(m.createdAt)}</td>

                      <td>
                        <div className="admin-actions">
                          {!m.read && (
                            <button onClick={() => handleRead(m._id)}>
                              Mark read
                            </button>
                          )}

                          <button
                            className="danger"
                            onClick={() => handleDeleteMessage(m._id)}
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

        {/* ── Chat Queries ─────────────────────────────── */}
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
                  {chats.map((c) => (
                    <tr key={c._id}>
                      <td className="row-title" style={{ maxWidth: "200px" }}>
                        {c.userMessage}
                      </td>

                      <td style={{ maxWidth: "260px" }}>{c.botReply}</td>

                      <td>{fmt(c.createdAt)}</td>

                      <td>
                        <div className="admin-actions">
                          <button
                            className="danger"
                            onClick={() => handleDeleteChat(c._id)}
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
    </div>
  );
}

export default AdminDashboardPage;
