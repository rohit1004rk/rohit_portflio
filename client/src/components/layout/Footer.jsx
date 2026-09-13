import { Link } from "react-router-dom";
import { profile } from "../../data/portfolioData.js";

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com/rohit1004rk",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/rohit1004rk",
  },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-copyright">
            © 2026 Rohit Kumar. All rights reserved.
          </p>

          <p className="footer-role">FULL STACK + AI/ML DEVELOPER</p>
        </div>

        <div className="footer-links">
          <Link to="/contact" className="footer-link footer-contact-link">
            GET IN TOUCH
            <span>→</span>
          </Link>

          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              {link.label}
            </a>
          ))}

          <a href={`mailto:${profile.contact.email}`} className="footer-link">
            EMAIL
          </a>

          <Link to="/admin/login" className="footer-link footer-admin-link">
            ADMIN
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
