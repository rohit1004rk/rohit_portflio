import PageHero from "../components/ui/PageHero.jsx";
import { experience } from "../data/portfolioData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

function ExperiencePage() {
  useDocumentTitle("Experience");

  const ref = useReveal();

  return (
    <>
      <PageHero
        eyebrow="Experience"
        title="Professional Experience"
        lead="Internships and practical learning experiences that have contributed to my growth as a Full Stack and AI/ML Developer."
      />

      <section className="section experience-section" ref={ref}>
        <div className="container">
          <div className="experience-timeline">
            {experience.map((item) => (
              <article className="experience-item reveal" key={item.id}>
                <div className="experience-marker" aria-hidden="true">
                  <span>{item.icon}</span>
                </div>

                <div className="experience-card">
                  <div className="experience-card-top">
                    <div>
                      <span className="experience-date">{item.years}</span>

                      <h2>{item.role}</h2>

                      <div className="experience-company">{item.company}</div>
                    </div>

                    <span className="experience-domain">{item.domain}</span>
                  </div>

                  <div className="experience-divider" />

                  <p className="experience-description">{item.description}</p>

                  <div className="experience-learning">
                    <h3>What I Gained</h3>

                    <ul>
                      {item.learnings.map((learning) => (
                        <li key={learning}>
                          <span>✓</span>
                          <span>{learning}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="experience-meta">
                    <span>
                      <strong>Duration:</strong> {item.duration}
                    </span>

                    {item.certificateId && (
                      <span>
                        <strong>Certificate ID:</strong> {item.certificateId}
                      </span>
                    )}
                  </div>

                  {item.grade && (
                    <div className="experience-grade">
                      <strong>Grade:</strong> {item.grade}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default ExperiencePage;
