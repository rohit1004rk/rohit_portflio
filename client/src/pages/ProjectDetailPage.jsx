import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import TechTags from "../components/ui/TechTags.jsx";
import { fetchProjectBySlug } from "../api/api.js";
import { fallbackProjects } from "../data/projectsData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

function ProjectDetailPage() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useDocumentTitle(project ? project.title : "Project");

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    fetchProjectBySlug(slug)
      .then(setProject)
      .catch(() => {
        const local = fallbackProjects.find((p) => p.slug === slug);
        if (local) {
          setProject(local);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Loading project…</p>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="notfound">
        <div className="code">404</div>
        <h1>Project not found</h1>
        <p>The project you're looking for doesn't exist.</p>
        <Link to="/projects" className="btn btn-primary">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="page-hero">
        <div className="container">
          <Link
            to="/projects"
            className="eyebrow"
            style={{ textDecoration: "none" }}
          >
            ← All Projects
          </Link>
          <h1>{project.title}</h1>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--space-4)",
              marginTop: "var(--space-4)",
              flexWrap: "wrap",
            }}
          >
            <StatusBadge status={project.status} />
            <span
              className="mono"
              style={{ color: "var(--text-3)", fontSize: "var(--text-sm)" }}
            >
              {project.category}
            </span>
          </div>
        </div>
      </div>

      <section className="section">
        <div className="container detail-grid">
          <div className="detail-main">
            <h2>Overview</h2>
            <p>{project.overview}</p>

            <h2>Problem</h2>
            <p>{project.problem}</p>

            <h2>What I Built</h2>
            <p>{project.whatIBuilt}</p>

            <h2>Result</h2>
            <p>{project.result}</p>

            {project.metrics && project.metrics.length > 0 && (
              <>
                <h2>Key Metrics</h2>
                <div className="metrics-grid">
                  {project.metrics.map((m) => (
                    <div className="metric" key={m.label}>
                      <div className="val">{m.value}</div>
                      <div className="lab">{m.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {project.workflow && project.workflow.length > 0 && (
              <>
                <h2>Technical Workflow</h2>
                <ul>
                  {project.workflow.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </>
            )}

            {project.limitations && project.limitations.length > 0 && (
              <>
                <h2>Limitations</h2>
                <ul>
                  {project.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </>
            )}

            {project.future && project.future.length > 0 && (
              <>
                <h2>Future Improvements</h2>
                <ul>
                  {project.future.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <aside className="side-card">
            <h4>Project Details</h4>
            <div className="row">
              <span className="k">Status</span>
              <span className="v">
                <StatusBadge status={project.status} />
              </span>
            </div>
            <div className="row">
              <span className="k">Category</span>
              <span className="v">{project.category}</span>
            </div>
            <div className="row">
              <span className="k">Icon</span>
              <span className="v" style={{ fontSize: "var(--text-xl)" }}>
                {project.icon || "💻"}
              </span>
            </div>
            <div style={{ marginTop: "var(--space-5)" }}>
              <h4>Technologies</h4>
              <TechTags items={project.tech || []} />
            </div>
            <div
              style={{
                marginTop: "var(--space-6)",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-3)",
              }}
            >
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  View on GitHub
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost"
                >
                  Live Demo
                </a>
              )}
              <Link to="/contact" className="btn btn-primary">
                Discuss this project
              </Link>
              <Link to="/projects" className="btn btn-ghost">
                ← All Projects
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}

export default ProjectDetailPage;
