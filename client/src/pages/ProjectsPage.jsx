import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/ui/PageHero.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import TechTags from "../components/ui/TechTags.jsx";
import { fetchProjects } from "../api/api.js";
import { fallbackProjects } from "../data/projectsData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

function ProjectsPage() {
  useDocumentTitle("Projects");
<<<<<<< HEAD
  const [projects, setProjects] = useState(fallbackProjects);
  const [loading, setLoading] = useState(false);
=======
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
>>>>>>> a25a1cba4104bfe9a2fe971ee30681bf754a9c62
  const [apiError, setApiError] = useState(false);
  const ref = useReveal();

  useEffect(() => {
    fetchProjects()
      .then((data) => {
        setProjects(data);
        setApiError(false);
      })
      .catch(() => {
        setProjects(fallbackProjects);
        setApiError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const shown = projects.length ? projects : fallbackProjects;

  return (
    <>
      <PageHero
        eyebrow="Projects"
        title="Things I've built"
        lead="A mix of full-stack web applications and AI/ML systems — each one solving a concrete problem. Select any project for the full technical breakdown."
      />
      <section className="section" ref={ref}>
        <div className="container">
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <p>Loading projects…</p>
            </div>
          ) : (
            <>
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
                        alt={`${p.title} thumbnail`}
                        loading="lazy"
                      />
                    )}
                    <div className="card-cat">{p.category}</div>
                    <h3>{p.title}</h3>
                    {p.description && p.description.length > 0 ? (
                      <div className="card-desc">
                        {p.description.map((line) => (
                          <p key={line}>{line}</p>
                        ))}
                      </div>
                    ) : (
                      <p>{p.overview}</p>
                    )}
                    {p.workflow && p.workflow.length > 0 && (
                      <>
                        <div className="card-label">Key Features</div>
                        <ul className="card-features">
                          {p.workflow.map((f) => (
                            <li key={f}>{f}</li>
                          ))}
                        </ul>
                      </>
                    )}
                    {p.metrics && p.metrics.length > 0 && (
                      <p
                        style={{
                          marginTop: "var(--space-3)",
                          color: "var(--accent)",
                          fontFamily: "var(--font-mono)",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        {p.metrics
                          .slice(0, 3)
                          .map((m) => `${m.label}: ${m.value}`)
                          .join(" · ")}
                      </p>
                    )}
                    <div className="card-label">Tech Used</div>
                    <div className="tech-tags">
                      <TechTags items={p.tech || []} />
                    </div>
                    <div className="card-actions">
                      <Link
                        to={`/projects/${p.slug}`}
                        className="btn btn-ghost btn-sm"
                      >
                        View Details →
                      </Link>
                      {p.repoUrl && (
                        <a
                          href={p.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          GitHub
                        </a>
                      )}
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-sm"
                        >
                          Live Demo
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
              {apiError && (
                <p
                  style={{
                    marginTop: "var(--space-6)",
                    color: "var(--text-3)",
                    fontSize: "var(--text-sm)",
                  }}
                >
                  Showing local data — start the Express API to load projects
                  from MongoDB.
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

export default ProjectsPage;
