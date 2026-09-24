import { useEffect, useState } from "react";
import PageHero from "../components/ui/PageHero.jsx";
import { fetchContactLinks, sendMessage } from "../api/api.js";
import { profile } from "../data/portfolioData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

/*
 * Backend icon names -> existing visual emoji
 *
 * Existing database data is preserved.
 * If an icon is unknown, we use a safe default.
 */
const ICON_MAP = {
  email: "📧",
  mail: "📧",
  linkedin: "💼",
  github: "🐙",
  instagram: "📸",
  youtube: "▶️",
  facebook: "📘",
  twitter: "🐦",
  x: "𝕏",
  resume: "📄",
  portfolio: "🌐",
  website: "🌐",
  leetcode: "💻",
  kaggle: "📊",
};

const getLinkIcon = (link) => {
  const icon = String(link?.icon || "")
    .trim()
    .toLowerCase();

  if (icon && ICON_MAP[icon]) {
    return ICON_MAP[icon];
  }

  const platform = String(link?.platform || "")
    .trim()
    .toLowerCase();

  if (platform && ICON_MAP[platform]) {
    return ICON_MAP[platform];
  }

  return "🔗";
};

const isExternalLink = (url) => {
  if (!url) {
    return false;
  }

  return /^https?:\/\//i.test(url);
};

function ContactPage() {
  useDocumentTitle("Contact");

  const ref = useReveal();

  const [contactLinks, setContactLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({
    type: "idle",
    text: "",
  });

  const [sending, setSending] = useState(false);

  /*
   * ============================================================
   * LOAD CONTACT LINKS FROM BACKEND
   * ============================================================
   *
   * MongoDB
   *    ↓
   * Express API
   *    ↓
   * fetchContactLinks()
   *    ↓
   * ContactPage
   *
   * Only active links are returned by the public API.
   */
  useEffect(() => {
    let mounted = true;

    const loadContactLinks = async () => {
      try {
        setLinksLoading(true);

        const data = await fetchContactLinks();

        if (!mounted) {
          return;
        }

        const links = Array.isArray(data)
          ? data
          : Array.isArray(data?.contactLinks)
            ? data.contactLinks
            : [];

        const normalizedLinks = links
          .filter((link) => link && link.isActive !== false && link.url)
          .map((link, index) => ({
            ...link,
            _id: link._id || `contact-link-${index}`,
            label: link.label || link.platform || "Contact",
            order: Number.isFinite(Number(link.order))
              ? Number(link.order)
              : index,
          }))
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

        setContactLinks(normalizedLinks);
      } catch (error) {
        console.error("Failed to load contact links:", error);

        if (mounted) {
          setContactLinks([]);
        }
      } finally {
        if (mounted) {
          setLinksLoading(false);
        }
      }
    };

    loadContactLinks();

    return () => {
      mounted = false;
    };
  }, []);

  // ============================================================
  // FORM VALIDATION
  // ============================================================

  const validate = (values) => {
    const next = {};

    if (values.name.trim().length < 2) {
      next.name = "Please enter your name.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
      next.email = "Please enter a valid email address.";
    }

    if (values.subject.trim().length < 3) {
      next.subject = "Please add a short subject.";
    }

    if (values.message.trim().length < 10) {
      next.message = "Please write at least 10 characters.";
    }

    return next;
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const onChange = (e) => {
    const next = {
      ...form,
      [e.target.name]: e.target.value,
    };

    setForm(next);

    if (errors[e.target.name]) {
      setErrors((prev) => ({
        ...prev,
        [e.target.name]: undefined,
      }));
    }
  };

  // ============================================================
  // FORM BLUR
  // ============================================================

  const onBlur = (e) => {
    const fieldErrors = validate(form);

    setErrors((prev) => ({
      ...prev,
      [e.target.name]: fieldErrors[e.target.name],
    }));
  };

  // ============================================================
  // SEND MESSAGE
  // ============================================================

  const onSubmit = async (e) => {
    e.preventDefault();

    const fieldErrors = validate(form);

    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length > 0) {
      setStatus({
        type: "err",
        text: "Please fix the highlighted fields.",
      });

      return;
    }

    setSending(true);

    setStatus({
      type: "idle",
      text: "",
    });

    try {
      const res = await sendMessage(form);

      setStatus({
        type: "ok",
        text: res.message || "Message sent successfully!",
      });

      setForm({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

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
          {/* =========================================
              LEFT SIDE — CONTACT FORM
             ========================================= */}

          <form className="form contact-form-panel reveal" onSubmit={onSubmit}>
            <div className="contact-panel-intro">
              <span className="contact-panel-kicker">01</span>

              <div>
                <h2>Send a Message</h2>

                <p>
                  Fill out the form and I'll get back to you as soon as
                  possible.
                </p>
              </div>
            </div>

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

          {/* =========================================
              RIGHT SIDE — BACKEND CONTROLLED LINKS
             ========================================= */}

          <div className="form contact-links-panel reveal">
            <div className="contact-panel-intro">
              <span className="contact-panel-kicker">02</span>

              <div>
                <h2>Get in Touch</h2>

                <p>You can also reach me directly through these links.</p>
              </div>
            </div>

            <div className="contact-links">
              {linksLoading ? (
                <div className="contact-links-loading">
                  Loading contact links...
                </div>
              ) : contactLinks.length > 0 ? (
                contactLinks.map((link) => {
                  const external = isExternalLink(link.url);

                  return (
                    <a
                      key={link._id}
                      href={link.url}
                      {...(external
                        ? {
                            target: "_blank",
                            rel: "noopener noreferrer",
                          }
                        : {})}
                    >
                      <span className="em">{getLinkIcon(link)}</span>

                      <span>{link.label}</span>

                      <span className="ar">→</span>
                    </a>
                  );
                })
              ) : (
                <div className="contact-links-empty">
                  No active contact links available.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ContactPage;
