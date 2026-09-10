import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  fetchAdminStats,
  fetchMessages,
  fetchChatLogs,
  markMessageRead,
  deleteMessage,
  deleteChatLog,
} from '../api/api.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

function AdminDashboardPage() {
  useDocumentTitle('Admin Dashboard');
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    const load = async () => {
      try {
        const [statsRes, messagesRes, chatsRes] = await Promise.all([
          fetchAdminStats(token),
          fetchMessages(token),
          fetchChatLogs(token),
        ]);
        setStats(statsRes);
        setMessages(messagesRes);
        setChats(chatsRes);
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('adminToken');
          navigate('/admin/login');
        } else {
          setError(err.response?.data?.message || 'Could not load dashboard data.');
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

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
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
    iso ? new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  return (
    <div className="admin-shell">
      <div className="container">
        <div className="admin-topbar">
          <div>
            <span className="eyebrow">Admin Panel</span>
            <h1>Dashboard</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/" className="btn btn-ghost btn-sm">← View Site</Link>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
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
              <div className="val" style={{ color: 'var(--accent)' }}>{stats.unreadMessages}</div>
              <div className="lab">Unread</div>
            </div>
            <div className="admin-stat">
              <div className="val" style={{ color: 'var(--teal)' }}>{stats.totalChats}</div>
              <div className="lab">Chat Queries</div>
            </div>
          </div>
        )}

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
                      <td className={m.read ? 'read' : 'unread'}>{m.read ? 'Read' : 'Unread'}</td>
                      <td className="row-title">{m.name}</td>
                      <td>{m.email}</td>
                      <td>{m.subject}</td>
                      <td style={{ maxWidth: '240px' }}>{m.message}</td>
                      <td>{fmt(m.createdAt)}</td>
                      <td>
                        <div className="admin-actions">
                          {!m.read && (
                            <button onClick={() => handleRead(m._id)}>Mark read</button>
                          )}
                          <button className="danger" onClick={() => handleDeleteMessage(m._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

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
                      <td className="row-title" style={{ maxWidth: '200px' }}>{c.userMessage}</td>
                      <td style={{ maxWidth: '260px' }}>{c.botReply}</td>
                      <td>{fmt(c.createdAt)}</td>
                      <td>
                        <div className="admin-actions">
                          <button className="danger" onClick={() => handleDeleteChat(c._id)}>Delete</button>
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
