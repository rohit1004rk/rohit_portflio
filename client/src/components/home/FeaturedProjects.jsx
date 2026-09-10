import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchProjects } from "../../api/api.js";
import { fallbackProjects } from "../../data/projectsData.js";
import SectionHeading from "../ui/SectionHeading.jsx";
import StatusBadge from "../ui/StatusBadge.jsx";
import TechTags from "../ui/TechTags.jsx";
import { useReveal } from "../../hooks/useReveal.js";

function FeaturedProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useReveal();

  useEffect(() => {
    fetchProjects()
      .then((data) => setProjects(data))
      .catch(() => setProjects(fallbackProjects))
      .finally(() => setLoading(false));
  }, []);

  const featured = (projects.length ? projects : fallbackProjects).filter(
    (p) => p.featured,
  );
  const shown = featured.length
    ? featured
    : (projects.length ? projects : fallbackProjects).slice(0, 3);

  return (
    <section className="section" ref={ref}>
      <div className="container">
        <div className="reveal">
          <SectionHeading
            eyebrow="Selected Work"
            title="Featured builds"
            lead="A look at the projects I'm most proud of — each one solving a concrete problem with full-stack and AI/ML engineering."
          />
        </div>
        {loading ? (
          <div className="loading">
            <div className="spinner" />
            <p>Loading projects…</p>
          </div>
        ) : (
          <div className="projects-grid">
            {shown.map((p) => (
              <article className="card reveal" key={p._id || p.slug}>
                <div className="card-top">
                  <span className="card-icon">{p.icon || "💻"}</span>
                  <StatusBadge status={p.status} />
                </div>
                {p.thumbnail && (
                  <img
                    className="card-thumb"
                    src={p.thumbnail}
                    alt={`${p.title} project thumbnail`}
                    loading="lazy"
                  />
                )}
                <div className="card-cat">{p.category}</div>
                <h3>{p.title}</h3>
                <p>{p.overview}</p>
                <div
                  className="tech-tags"
                  style={{ marginTop: "var(--space-4)" }}
                >
                  <TechTags items={(p.tech || []).slice(0, 5)} />
                </div>
                <Link
                  to={`/projects/${p.slug}`}
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: "var(--space-5)" }}
                >
                  View Details →
                </Link>
              </article>
            ))}
          </div>
        )}
        <div
          style={{ marginTop: "var(--space-10)", textAlign: "center" }}
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
