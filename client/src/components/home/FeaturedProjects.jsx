import { Link } from "react-router-dom";
import { fallbackProjects } from "../../data/projectsData.js";
import SectionHeading from "../ui/SectionHeading.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import TechTags from "../ui/TechTags.jsx";
import { useReveal } from "../../hooks/useReveal.js";

function FeaturedProjects() {
  const ref = useReveal();

  /*
    Home Page par sirf existing local project data use hoga.

    API / MongoDB par depend nahi karega.
    Isliye refresh ya backend error ki wajah se
    Home ke projects disappear nahi honge.
  */

  const allProjects = fallbackProjects;

  // Pehle featured projects
  const featured = allProjects.filter((p) => p.featured);

  // Baaki projects
  const nonFeatured = allProjects.filter((p) => !p.featured);

  // Home Page par EXACTLY 2 projects
  const shown = [...featured, ...nonFeatured].slice(0, 2);

  return (
    <section className="section" ref={ref}>
      <div className="container">
        {/* Section Heading */}
        <div className="reveal">
          <SectionHeading
            eyebrow="Selected Work"
            title="Featured builds"
            lead="A look at the projects I'm most proud of — each one solving a concrete problem with full-stack and AI/ML engineering."
          />
        </div>

        {/* Projects */}
        <div className="projects-grid">
          {shown.map((p) => (
            <article className="card reveal" key={p._id || p.slug}>
              {/* Card Top */}
              <div className="card-top">
                <span className="card-icon">{p.icon || "💻"}</span>

                <StatusBadge status={p.status} />
              </div>

              {/* Thumbnail */}
              {p.thumbnail && (
                <img
                  className="card-thumb"
                  src={p.thumbnail}
                  alt={`${p.title} project thumbnail`}
                  loading="lazy"
                />
              )}

              {/* Category */}
              <div className="card-cat">{p.category}</div>

              {/* Title */}
              <h3>{p.title}</h3>

              {/* Overview */}
              <p>{p.overview}</p>

              {/* Technologies */}
              <div
                className="tech-tags"
                style={{
                  marginTop: "var(--space-4)",
                }}
              >
                <TechTags items={(p.tech || []).slice(0, 5)} />
              </div>

              {/* Project Actions */}
              <div className="card-actions project-card-actions">
                {/* View Details */}
                <Link
                  to={`/projects/${p.slug}`}
                  className="btn btn-primary btn-sm project-action-btn view-details-btn"
                >
                  View Details →
                </Link>

                {/* GitHub + Live Demo */}
                <div className="card-actions-right">
                  <a
                    href={p.githubUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm project-action-btn"
                    onClick={(e) => {
                      if (!p.githubUrl) {
                        e.preventDefault();
                      }
                    }}
                  >
                    GitHub
                  </a>

                  <a
                    href={p.liveDemoUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm project-action-btn"
                    onClick={(e) => {
                      if (!p.liveDemoUrl) {
                        e.preventDefault();
                      }
                    }}
                  >
                    Live Demo
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* View All Projects */}
        <div
          style={{
            marginTop: "var(--space-10)",
            textAlign: "center",
          }}
          className="reveal"
        >
          <Link to="/projects" className="btn btn-primary">
            View All Projects
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FeaturedProjects;
