import { useEffect, useState } from 'react';
import PageHero from '../components/ui/PageHero.jsx';
import { fetchSkills } from '../api/api.js';
import { fallbackSkills } from '../data/portfolioData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useReveal } from '../hooks/useReveal.js';

function SkillsPage() {
  useDocumentTitle('Skills');
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const ref = useReveal();

  useEffect(() => {
    fetchSkills()
      .then(setSkills)
      .catch(() => setSkills(fallbackSkills))
      .finally(() => setLoading(false));
  }, []);

  const groups = skills.length ? skills : fallbackSkills;

  return (
    <>
      <PageHero
        eyebrow="Skills"
        title="My toolkit"
        lead="The languages, frameworks, and tools I use to build full-stack applications and AI/ML systems."
      />
      <section className="section" ref={ref}>
        <div className="container">
          {loading ? (
            <div className="loading">
              <div className="spinner" />
              <p>Loading skills…</p>
            </div>
          ) : (
            <div className="skills-grid">
              {groups.map((g) => (
                <div className="skill-card reveal" key={g.category}>
                  <h3>
                    <span className="ic">{g.icon || '🛠️'}</span>
                    {g.category}
                  </h3>
                  <div className="skill-chips">
                    {g.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default SkillsPage;
