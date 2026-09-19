import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotAdminPassword } from "../api/api.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

function AdminForgotPasswordPage() {
  useDocumentTitle("Forgot Admin Password");

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await forgotAdminPassword({
        email: email.trim(),
      });

      setSuccess(
        res.message ||
          "If an account exists for this email address, a password reset link has been sent.",
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process the password reset request. Please try again later.",
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
        aria-labelledby="forgot-password-title"
      >
        <div className="admin-login-header">
          <div className="admin-login-icon" aria-hidden="true">
            <span>↻</span>
          </div>

          <div>
            <span className="admin-login-eyebrow">ACCOUNT RECOVERY</span>

            <h1 id="forgot-password-title">Forgot Password?</h1>

            <p>
              Enter your registered admin email to receive a secure password
              reset link.
            </p>
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
                <strong>Check your email</strong>

                <p>{success}</p>

                <p>The reset link is temporary and can only be used once.</p>
              </div>
            </div>

            <Link
              to="/admin/login"
              className="admin-login-submit"
              style={{ textDecoration: "none" }}
            >
              <span>BACK TO LOGIN</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <form className="admin-login-form" onSubmit={onSubmit}>
            <div className="admin-login-field">
              <label htmlFor="forgot-admin-email">Admin Email</label>

              <div className="admin-login-input-wrap">
                <span className="admin-login-input-icon" aria-hidden="true">
                  @
                </span>

                <input
                  id="forgot-admin-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (error) {
                      setError("");
                    }
                  }}
                  autoComplete="email"
                  maxLength={200}
                  required
                />
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
              <span>{loading ? "Sending..." : "SEND RESET LINK"}</span>

              {!loading && <span aria-hidden="true">→</span>}
            </button>

            <Link to="/admin/login" className="admin-forgot-password">
              ← Back to Admin Login
            </Link>
          </form>
        )}

        <div className="admin-login-security">
          <span className="admin-security-icon" aria-hidden="true">
            ◈
          </span>

          <div>
            <strong>Secure password recovery</strong>

            <p>
              Reset links are temporary, single-use, and are sent only through
              the configured admin email system.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AdminForgotPasswordPage;
