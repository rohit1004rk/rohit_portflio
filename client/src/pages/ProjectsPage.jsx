import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHero from '../components/ui/PageHero.jsx';
import StatusBadge from '../components/ui/StatusBadge.jsx';
import TechTags from '../components/ui/TechTags.jsx';
import { fetchProjects } from '../api/api.js';
import { fallbackProjects } from '../data/projectsData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useReveal } from '../hooks/useReveal.js';

function ProjectsPage() {
  useDocumentTitle('Projects');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
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
                      <span className="card-icon">{p.icon || '💻'}</span>
                      <StatusBadge status={p.status} />
                    </div>
                    <div className="card-cat">{p.category}</div>
                    <h3>{p.title}</h3>
                    <p>{p.overview}</p>
                    {(p.metrics && p.metrics.length > 0) && (
                      <p style={{ marginTop: 'var(--space-3)', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)' }}>
                        {p.metrics.slice(0, 3).map((m) => `${m.label}: ${m.value}`).join(' · ')}
                      </p>
                    )}
                    <div className="tech-tags" style={{ marginTop: 'var(--space-4)' }}>
                      <TechTags items={(p.tech || []).slice(0, 6)} />
                    </div>
                    <Link
                      to={`/projects/${p.slug}`}
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: 'var(--space-5)' }}
                    >
                      View Details →
                    </Link>
                  </article>
                ))}
              </div>
              {apiError && (
                <p style={{ marginTop: 'var(--space-6)', color: 'var(--text-3)', fontSize: 'var(--text-sm)' }}>
                  Showing local data — start the Express API to load projects from MongoDB.
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
