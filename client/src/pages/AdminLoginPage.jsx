import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/api.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

function AdminLoginPage() {
  useDocumentTitle("Admin Login");
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await loginAdmin(form);
      if (res.role !== "admin") {
        setError("This account does not have admin access.");
        setLoading(false);
        return;
      }
      localStorage.setItem("adminToken", res.token);
      localStorage.setItem(
        "adminUser",
        JSON.stringify({ name: res.name, email: res.email }),
      );
      navigate("/admin");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="admin-shell">
      <div className="admin-card">
        <span className="eyebrow">Admin Panel</span>
        <h1>Admin Login</h1>
        <p className="sub">Sign in to track messages and chat queries.</p>
        <form className="form" onSubmit={onSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              required
            />
          </div>
          {error && <p className="form-note err">{error}</p>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
        <div className="admin-note">
          Admin access only. Credentials are created by the seed script from the{" "}
          <code>ADMIN_EMAIL</code> / <code>ADMIN_PASSWORD</code> environment
          variables.
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
