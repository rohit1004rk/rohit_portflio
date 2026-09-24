import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { profile } from "../../data/portfolioData.js";
import { fetchPublicPortfolioSettings } from "../../api/api.js";

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

const DEFAULT_FOOTER = {
  enabled: true,
  copyrightText: "© {year} Rohit Kumar. All rights reserved.",
  tagline: "FULL STACK + AI/ML DEVELOPER",
  showSocialLinks: true,
  showEmail: true,
  showAdminLink: true,
};

function Footer() {
  const [footerSettings, setFooterSettings] = useState(DEFAULT_FOOTER);

  useEffect(() => {
    let mounted = true;

    const loadFooterSettings = async () => {
      try {
        const data = await fetchPublicPortfolioSettings();

        if (!mounted) return;

        const footer = data?.footer || {};

        setFooterSettings({
          enabled: footer.enabled !== false,
          copyrightText: footer.copyrightText || DEFAULT_FOOTER.copyrightText,
          tagline: footer.tagline || DEFAULT_FOOTER.tagline,
          showSocialLinks: footer.showSocialLinks !== false,
          showEmail: footer.showEmail !== false,
          showAdminLink: footer.showAdminLink !== false,
        });
      } catch (error) {
        console.error("Failed to load footer settings:", error);

        if (mounted) {
          setFooterSettings(DEFAULT_FOOTER);
        }
      }
    };

    loadFooterSettings();

    return () => {
      mounted = false;
    };
  }, []);

  if (!footerSettings.enabled) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  const copyrightText = footerSettings.copyrightText.replace(
    "{year}",
    currentYear,
  );

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <p className="footer-copyright">{copyrightText}</p>

          <p className="footer-role">{footerSettings.tagline}</p>
        </div>

        <div className="footer-links">
          <Link to="/contact" className="footer-link footer-contact-link">
            GET IN TOUCH
            <span>→</span>
          </Link>

          {footerSettings.showSocialLinks &&
            socialLinks.map((link) => (
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

          {footerSettings.showEmail && (
            <a href={`mailto:${profile.contact.email}`} className="footer-link">
              EMAIL
            </a>
          )}

          {footerSettings.showAdminLink && (
            <Link to="/admin/login" className="footer-link footer-admin-link">
              ADMIN
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
