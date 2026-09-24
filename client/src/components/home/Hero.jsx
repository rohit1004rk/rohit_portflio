import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHome } from "../../api/api.js";
import { profile } from "../../data/portfolioData.js";
import TechIllustration from "./TechIllustration.jsx";

function Hero() {
  const [hero, setHero] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadHero = async () => {
      try {
        const data = await fetchHome();

        if (mounted && data?.hero) {
          setHero(data.hero);
        }
      } catch (error) {
        console.error("Failed to load Home hero:", error);
      }
    };

    loadHero();

    return () => {
      mounted = false;
    };
  }, []);

  const heroData = {
    eyebrow: hero?.eyebrow || profile.eyebrow,
    name: hero?.name || profile.name || "Rohit Kumar",
    role: hero?.role || "Full Stack + AI/ML",
    description: hero?.description || profile.shortBio,
    primaryButtonText: hero?.primaryButtonText || "View Projects",
    primaryButtonLink: hero?.primaryButtonLink || "/projects",
    secondaryButtonText: hero?.secondaryButtonText || "Contact Me",
    secondaryButtonLink: hero?.secondaryButtonLink || "/contact",
  };

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">{heroData.eyebrow}</span>

            <h1>
              {heroData.name}
              <br />
              <span className="accent">{heroData.role}</span> Developer
            </h1>

            <p className="desc">{heroData.description}</p>

            <div className="hero-ctas">
              <Link to={heroData.primaryButtonLink} className="btn btn-ghost">
                {heroData.primaryButtonText}
              </Link>

              <Link to={heroData.secondaryButtonLink} className="btn btn-teal">
                {heroData.secondaryButtonText}
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
