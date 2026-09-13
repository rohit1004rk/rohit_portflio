import { useState } from "react";
import PageHero from "../components/ui/PageHero.jsx";
import { sendMessage } from "../api/api.js";
import { profile } from "../data/portfolioData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

const contactLinks = [
  { emoji: "📧", label: "Email me", href: `mailto:${profile.contact.email}` },
  {
    emoji: "💼",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/rohit1004rk",
    external: true,
  },
  {
    emoji: "🐙",
    label: "GitHub",
    href: "https://github.com/rohit1004rk",
    external: true,
  },
  { emoji: "📄", label: "View Resume", href: "/resume" },
];

function ContactPage() {
  useDocumentTitle("Contact");
  const ref = useReveal();
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "idle", text: "" });
  const [sending, setSending] = useState(false);

  // Client-side validation mirrors the server rules so users get instant
  // feedback; the server still validates every request independently.
  const validate = (values) => {
    const next = {};
    if (values.name.trim().length < 2) next.name = "Please enter your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
      next.email = "Please enter a valid email address.";
    if (values.subject.trim().length < 3)
      next.subject = "Please add a short subject.";
    if (values.message.trim().length < 10)
      next.message = "Please write at least 10 characters.";
    return next;
  };

  const onChange = (e) => {
    const next = { ...form, [e.target.name]: e.target.value };
    setForm(next);
    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const onBlur = (e) => {
    const fieldErrors = validate(form);
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: fieldErrors[e.target.name],
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      setStatus({ type: "err", text: "Please fix the highlighted fields." });
      return;
    }
    setSending(true);
    setStatus({ type: "idle", text: "" });
    try {
      const res = await sendMessage(form);
      setStatus({
        type: "ok",
        text: res.message || "Message sent successfully!",
      });
      setForm({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      setStatus({
        type: "err",
        text:
          err.response?.data?.message ||
          "Could not send the message. Please check your connection and try again.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's build something together"
        lead="Have a project, an internship opportunity, or a freelance role in mind? I'd love to hear from you."
      />
      <section className="section" ref={ref}>
        <div className="container contact-grid">
          <div className="contact-left reveal">
            <p
              style={{
                color: "var(--text-2)",
                fontSize: "var(--text-lg)",
                lineHeight: "1.75",
                marginBottom: "var(--space-8)",
              }}
            >
              Reach out directly, or drop a message through the form and I'll
              get back to you.
            </p>
            <div className="contact-links">
              {contactLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  {...(l.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  <span className="em">{l.emoji}</span>
                  {l.label}
                  <span className="ar">→</span>
                </a>
              ))}
            </div>
          </div>
          <form className="form reveal" onSubmit={onSubmit}>
            <div className="row2">
              <div>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={Boolean(errors.name)}
                  required
                />
                {errors.name && (
                  <span className="field-error">{errors.name}</span>
                )}
              </div>
              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                  onBlur={onBlur}
                  aria-invalid={Boolean(errors.email)}
                  required
                />
                {errors.email && (
                  <span className="field-error">{errors.email}</span>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="subject">Subject</label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="What's this about?"
                value={form.subject}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={Boolean(errors.subject)}
                required
              />
              {errors.subject && (
                <span className="field-error">{errors.subject}</span>
              )}
            </div>
            <div>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell me about your project or opportunity..."
                value={form.message}
                onChange={onChange}
                onBlur={onBlur}
                aria-invalid={Boolean(errors.message)}
                required
              />
              {errors.message && (
                <span className="field-error">{errors.message}</span>
              )}
            </div>
            <button
              className="btn btn-primary"
              type="submit"
              disabled={sending}
            >
              {sending ? "Sending…" : "Send Message"}
            </button>
            {status.type !== "idle" && (
              <p className={`form-note ${status.type === "ok" ? "ok" : "err"}`}>
                {status.text}
              </p>
            )}
          </form>
        </div>
      </section>
    </>
  );
}

export default ContactPage;
