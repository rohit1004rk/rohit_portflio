import PageHero from "../components/ui/PageHero.jsx";
import { education } from "../data/portfolioData.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

function EducationPage() {
  useDocumentTitle("Education");

  const ref = useReveal();

  return (
    <>
      <PageHero
        eyebrow="Education"
        title="Academic background"
        lead="My academic journey from school education to B.Tech in Computer Science (Artificial Intelligence)."
      />

      <section className="section education-section" ref={ref}>
        <div className="container">
          <div className="education-list">
            {education.map((e) => (
              <article
                className="education-card reveal"
                key={`${e.years}-${e.title}`}
              >
                {/* LEFT SIDE */}
                <div className="education-meta">
                  {/* Institution Emoji */}
                  <div className="education-icon" aria-hidden="true">
                    {e.icon}
                  </div>

                  {/* Year */}
                  <span className="education-year">{e.years}</span>
                </div>

                {/* RIGHT SIDE */}
                <div className="education-content">
                  {/* Degree / Class */}
                  <h3>{e.title}</h3>

                  {/* College / School */}
                  <div className="education-institution">{e.place}</div>

                  {/* Location */}
                  {e.location && (
                    <div className="education-location">{e.location}</div>
                  )}

                  {/* Course / Class */}
                  {e.detail && <p className="education-detail">{e.detail}</p>}

                  {/* CGPA / Percentage */}
                  {e.cgpa && (
                    <div className="education-score education-cgpa">
                      <span className="score-label">CGPA</span>

                      <span className="score-value">{e.cgpa}</span>
                    </div>
                  )}

                  {e.percentage && (
                    <div className="education-score education-percentage">
                      <span className="score-label">Percentage</span>

                      <span className="score-value">{e.percentage}</span>
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

export default EducationPage;
