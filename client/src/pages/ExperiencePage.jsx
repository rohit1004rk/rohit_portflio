import { useEffect, useState } from "react";
import PageHero from "../components/ui/PageHero.jsx";
import { fetchVisibleExperiences } from "../api/api.js";
import { experience as fallbackExperience } from "../data/portfolioData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

function ExperiencePage() {
  useDocumentTitle("Experience");

  const [experiences, setExperiences] = useState(fallbackExperience);
  const [loading, setLoading] = useState(true);

  const ref = useReveal(experiences);

  useEffect(() => {
    let mounted = true;

    const loadExperiences = async () => {
      try {
        setLoading(true);

        const data = await fetchVisibleExperiences();

        if (mounted && Array.isArray(data)) {
          const normalizedData = data.map((item) => ({
            ...item,

            // Backend field → existing frontend field compatibility
            id: item._id || item.id,
            role: item.title || item.role || "",
            years: item.current
              ? `${item.startDate || ""} – Present`
              : item.endDate
                ? `${item.startDate || ""} – ${item.endDate}`
                : item.startDate || item.years || "",

            // Preserve existing fields if backend does not contain them
            icon: item.icon || "💼",
            domain: item.domain || "",
            description: item.description || "",
            learnings: Array.isArray(item.learnings) ? item.learnings : [],
            duration: item.duration || "",
            certificateId: item.certificateId || "",
            grade: item.grade || "",
          }));

          setExperiences(normalizedData);
        }
      } catch (error) {
        console.error("Failed to load experiences:", error);

        // Keep existing static experience data if API is unavailable.
        if (mounted) {
          setExperiences(fallbackExperience);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadExperiences();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Experience"
        title="Professional Experience"
        lead="Internships and practical learning experiences that have contributed to my growth as a Full Stack and AI/ML Developer."
      />

      <section className="section experience-section" ref={ref}>
        <div className="container">
          {loading && experiences.length === 0 ? (
            <div className="experience-timeline">
              <p>Loading experience...</p>
            </div>
          ) : (
            <div className="experience-timeline">
              {experiences.map((item, index) => (
                <article
                  className="experience-item reveal"
                  key={item.id || item._id || index}
                >
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

                      {item.domain && (
                        <span className="experience-domain">{item.domain}</span>
                      )}
                    </div>

                    <div className="experience-divider" />

                    {item.description && (
                      <p className="experience-description">
                        {item.description}
                      </p>
                    )}

                    {Array.isArray(item.learnings) &&
                      item.learnings.length > 0 && (
                        <div className="experience-learning">
                          <h3>What I Gained</h3>

                          <ul>
                            {item.learnings.map((learning, learningIndex) => (
                              <li
                                key={`${item.id || item._id || index}-learning-${learningIndex}`}
                              >
                                <span>✓</span>
                                <span>{learning}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    <div className="experience-meta">
                      {item.duration && (
                        <span>
                          <strong>Duration:</strong> {item.duration}
                        </span>
                      )}

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
          )}
        </div>
      </section>
    </>
  );
}

export default ExperiencePage;
