import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fallbackProjects } from "../../data/projectsData.js";
import SectionHeading from "../ui/SectionHeading.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import TechTags from "../ui/TechTags.jsx";
import { useReveal } from "../../hooks/useReveal.js";

function FeaturedProjects() {
  const ref = useReveal();

  const [projects, setProjects] = useState(fallbackProjects);

  useEffect(() => {
    let cancelled = false;

    const loadProjects = async () => {
      try {
        const response = await fetch("/api/projects");

        if (!response.ok) {
          throw new Error("Failed to load projects.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Invalid projects response.");
        }

        if (!cancelled) {
          setProjects(data.length > 0 ? data : fallbackProjects);
        }
      } catch (error) {
        console.error("FEATURED PROJECTS LOAD ERROR:", error);

        if (!cancelled) {
          setProjects(fallbackProjects);
        }
      }
    };

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
    Home Page par featured projects MongoDB ke
    `featured` field ke according show honge.

    Agar API/backend unavailable ho, to existing
    fallbackProjects automatically use honge.
  */

  const allProjects = [...projects].sort((a, b) => {
    const orderA = Number(a.order) || 0;
    const orderB = Number(b.order) || 0;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return 0;
  });

  // Admin Dashboard mein featured = true wale projects pehle
  const featured = allProjects.filter((p) => p.featured === true);

  // Baaki projects
  const nonFeatured = allProjects.filter((p) => p.featured !== true);

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
            <article className="card reveal in" key={p._id || p.slug}>
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
                    href={p.repoUrl || p.githubUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm project-action-btn"
                    onClick={(e) => {
                      if (!p.repoUrl && !p.githubUrl) {
                        e.preventDefault();
                      }
                    }}
                  >
                    GitHub
                  </a>

                  <a
                    href={p.liveUrl || p.liveDemoUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost btn-sm project-action-btn"
                    onClick={(e) => {
                      if (!p.liveUrl && !p.liveDemoUrl) {
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
