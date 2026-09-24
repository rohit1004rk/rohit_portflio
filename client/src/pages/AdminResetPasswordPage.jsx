import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetAdminPassword } from "../api/api.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

function AdminResetPasswordPage() {
  useDocumentTitle("Reset Admin Password");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onChange = (e) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));

    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (loading || success) return;

    setError("");

    if (!token) {
      setError("Invalid or expired password reset link.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await resetAdminPassword({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setSuccess(
        res.message ||
          "Your password has been reset successfully. Please log in with your new password.",
      );

      setForm({
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-glow admin-login-glow-one" />
      <div className="admin-login-glow admin-login-glow-two" />

      <section
        className="admin-login-card"
        aria-labelledby="reset-password-title"
      >
        <div className="admin-login-header">
          <div className="admin-login-icon" aria-hidden="true">
            <span>↻</span>
          </div>

          <div>
            <span className="admin-login-eyebrow">ACCOUNT RECOVERY</span>

            <h1 id="reset-password-title">Reset Password</h1>

            <p>Create a new secure password for your administrator account.</p>
          </div>
        </div>

        <div className="admin-login-divider" />

        {success ? (
          <div className="admin-login-form">
            <div
              className="admin-login-success"
              role="status"
              aria-live="polite"
            >
              <span aria-hidden="true">✓</span>

              <div>
                <strong>Password reset successful</strong>

                <p>{success}</p>
              </div>
            </div>

            <button
              type="button"
              className="admin-login-submit"
              onClick={() => navigate("/admin/login")}
            >
              <span>GO TO ADMIN LOGIN</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <form className="admin-login-form" onSubmit={onSubmit}>
            <div className="admin-login-field">
              <label htmlFor="reset-password">New Password</label>

              <div className="admin-login-input-wrap">
                <span className="admin-login-input-icon" aria-hidden="true">
                  *
                </span>

                <input
                  id="reset-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={form.password}
                  onChange={onChange}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
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

            <div className="admin-login-field">
              <label htmlFor="reset-confirm-password">
                Confirm New Password
              </label>

              <div className="admin-login-input-wrap">
                <span className="admin-login-input-icon" aria-hidden="true">
                  *
                </span>

                <input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={form.confirmPassword}
                  onChange={onChange}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={128}
                  required
                />

                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? "Hide" : "Show"}
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
              <span>{loading ? "RESETTING..." : "RESET PASSWORD"}</span>

              {!loading && <span aria-hidden="true">→</span>}
            </button>

            <button
              type="button"
              className="admin-forgot-password"
              onClick={() => navigate("/admin/login")}
            >
              ← Back to Admin Login
            </button>
          </form>
        )}

        <div className="admin-login-security">
          <span className="admin-security-icon" aria-hidden="true">
            ◈
          </span>

          <div>
            <strong>Secure password recovery</strong>

            <p>
              This reset link is temporary, single-use, and expires after 15
              minutes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminResetPasswordPage;
