import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useTheme } from "../../hooks/useTheme.js";

const links = [
  { label: "Home", to: "/", icon: "home" },
  { label: "About", to: "/about", icon: "user" },
  { label: "Skills", to: "/skills", icon: "code" },
  { label: "Projects", to: "/projects", icon: "folder" },
  { label: "Experience", to: "/experience", icon: "briefcase" },
  { label: "Achievements", to: "/achievements", icon: "award" },
  { label: "Education", to: "/education", icon: "education" },
  { label: "Resume", to: "/resume", icon: "file" },
];

function MenuIcon({ name }) {
  const commonProps = {
    width: 19,
    height: 19,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
  };

  switch (name) {
    case "home":
      return (
        <svg {...commonProps}>
          <path
            d="M3 10.5 12 3l9 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 9.5V21h13V9.5M9.5 21v-6h5v6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "user":
      return (
        <svg {...commonProps}>
          <circle
            cx="12"
            cy="8"
            r="3.2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M5 21c.7-3.8 3.1-5.7 7-5.7s6.3 1.9 7 5.7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "code":
      return (
        <svg {...commonProps}>
          <path
            d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5M13.5 4l-3 16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "folder":
      return (
        <svg {...commonProps}>
          <path
            d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6a2.5 2.5 0 0 1 2.5 2.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "briefcase":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="6.5"
            width="18"
            height="13"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 6.5V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5M3 11h18M10 11v2h4v-2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "award":
      return (
        <svg {...commonProps}>
          <circle
            cx="12"
            cy="9"
            r="5"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="m8.5 13.2-1 7 4.5-2.4 4.5 2.4-1-7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "education":
      return (
        <svg {...commonProps}>
          <path
            d="m3 9 9-5 9 5-9 5-9-5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M7 11.5V16c2.8 2 7.2 2 10 0v-4.5M21 10v6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    case "file":
      return (
        <svg {...commonProps}>
          <path
            d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V3.5Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M14 3.5V8h4M9 12h6M9 15.5h6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );

    case "mail":
      return (
        <svg {...commonProps}>
          <rect
            x="3"
            y="5"
            width="18"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="m4 7 8 6 8-6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );

    default:
      return null;
  }
}

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const navRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);

    window.addEventListener("scroll", onScroll);

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);

    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <nav className={`nav ${scrolled ? "scrolled" : ""}`} ref={navRef}>
      <div className="nav-inner">
        <Link className="brand" to="/" onClick={() => setOpen(false)}>
          <span className="logo">RK</span>

          <span>
            Rohit Kumar
            <small>FULL STACK + AI/ML</small>
          </span>
        </Link>

        {/* Desktop navigation — unchanged */}
        <ul className="nav-links">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "active nav-cta nav-cta-desktop"
                : "nav-cta nav-cta-desktop"
            }
          >
            Contact Me
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive
                ? "active nav-cta nav-cta-mobile"
                : "nav-cta nav-cta-mobile"
            }
            onClick={() => setOpen(false)}
          >
            Contact Me
          </NavLink>

          <button
            type="button"
            className="theme-toggle"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            onClick={toggleTheme}
          >
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          <button
            type="button"
            className={`burger ${open ? "open" : ""}`}
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        {/* Mobile side menu */}
        <ul className={`nav-dropdown ${open ? "open" : ""}`}>
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) => (isActive ? "active" : "")}
                onClick={() => setOpen(false)}
              >
                <span className="nav-menu-icon">
                  <MenuIcon name={l.icon} />
                </span>

                <span className="nav-menu-label">{l.label}</span>
              </NavLink>
            </li>
          ))}

          <li>
            <NavLink
              to="/contact"
              className={({ isActive }) =>
                isActive ? "active nav-cta" : "nav-cta"
              }
              onClick={() => setOpen(false)}
            >
              <span className="nav-menu-icon">
                <MenuIcon name="mail" />
              </span>

              <span className="nav-menu-label">Contact Me</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
