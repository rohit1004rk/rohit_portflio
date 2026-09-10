import { Link } from "react-router-dom";
import { profile } from "../../data/portfolioData.js";

const socialLinks = [
  { label: "GitHub", href: "https://github.com/rohit1004rk" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/rohit1004rk" },
];

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p>
          © {new Date().getFullYear()} Rohit Kumar · Full Stack + AI/ML
          Developer
        </p>
        <div className="footer-social">
          {socialLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mono"
            >
              {l.label}
            </a>
          ))}
          <a href={`mailto:${profile.contact.email}`} className="mono">
            Email
          </a>
        </div>
        <Link to="/contact" className="mono">
          Get in touch →
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
