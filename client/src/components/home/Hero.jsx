import { Link } from 'react-router-dom';
import { profile } from '../../data/portfolioData.js';
import NetworkCanvas from './NetworkCanvas.jsx';
import TerminalVisual from './TerminalVisual.jsx';

function Hero() {
  return (
    <section className="hero">
      <NetworkCanvas />
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
              <Link to="/contact" className="btn btn-primary">
                Hire Me
              </Link>
              <Link to="/projects" className="btn btn-ghost">
                View Projects
              </Link>
              <Link to="/resume" className="btn btn-ghost">
                View Resume
              </Link>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                LinkedIn
              </a>
              <Link to="/contact" className="btn btn-teal">
                Contact Me
              </Link>
            </div>
            <div className="hero-stats">
              {profile.stats.map((s) => (
                <div className="stat" key={s.label}>
                  <div className="num">
                    {s.num}
                    <em>{s.suffix}</em>
                  </div>
                  <div className="lbl">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="hero-visual">
            <TerminalVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
