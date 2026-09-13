import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/api.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

function AdminLoginPage() {
  useDocumentTitle("Admin Login");

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const onChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));

    if (error) {
      setError("");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

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
        JSON.stringify({
          name: res.name,
          email: res.email,
        }),
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
    <main className="admin-login-page">
      <div className="admin-login-glow admin-login-glow-one" />
      <div className="admin-login-glow admin-login-glow-two" />

      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-header">
          <div className="admin-login-icon" aria-hidden="true">
            <span>⌘</span>
          </div>

          <div>
            <span className="admin-login-eyebrow">ADMIN PANEL</span>

            <h1 id="admin-login-title">Admin Login</h1>

            <p>Sign in to access your private dashboard.</p>
          </div>
        </div>

        <div className="admin-login-divider" />

        <form className="admin-login-form" onSubmit={onSubmit}>
          <div className="admin-login-field">
            <label htmlFor="admin-email">Email</label>

            <div className="admin-login-input-wrap">
              <span className="admin-login-input-icon" aria-hidden="true">
                @
              </span>

              <input
                id="admin-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={onChange}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>

            <div className="admin-login-input-wrap">
              <span className="admin-login-input-icon" aria-hidden="true">
                •
              </span>

              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={form.password}
                onChange={onChange}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword((current) => !current)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="admin-login-error" role="alert">
              <span aria-hidden="true">!</span>
              <p>{error}</p>
            </div>
          )}

          <button
            className="admin-login-submit"
            type="submit"
            disabled={loading}
          >
            <span>{loading ? "Signing in..." : "SIGN IN"}</span>

            {!loading && <span aria-hidden="true">→</span>}
          </button>
        </form>

        <div className="admin-login-security">
          <span className="admin-security-icon" aria-hidden="true">
            ◈
          </span>

          <div>
            <strong>Restricted access</strong>
            <p>This area is available only to the portfolio administrator.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminLoginPage;
