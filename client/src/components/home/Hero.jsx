import { Link } from "react-router-dom";
import { profile } from "../../data/portfolioData.js";
import TechIllustration from "./TechIllustration.jsx";

function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{profile.eyebrow}</span>

            <h1>
              Rohit Kumar
              <br />
              <span className="accent">Full Stack + AI/ML</span> Developer
            </h1>

            <p className="desc">{profile.shortBio}</p>

            <div className="hero-ctas">
              <Link to="/projects" className="btn btn-ghost">
                View Projects
              </Link>

              <Link to="/contact" className="btn btn-teal">
                Contact Me
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-tech-illustration">
              <TechIllustration />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
