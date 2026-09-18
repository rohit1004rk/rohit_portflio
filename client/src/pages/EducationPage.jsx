import { useEffect, useState } from "react";

import PageHero from "../components/ui/PageHero.jsx";
import { fetchVisibleEducations } from "../api/api.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

function EducationPage() {
  useDocumentTitle("Education");

  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const ref = useReveal(educations);
  useEffect(() => {
    let mounted = true;

    const loadEducation = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchVisibleEducations();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.educations)
            ? data.educations
            : [];

        const sorted = [...list].sort(
          (a, b) => (Number(a.order) || 0) - (Number(b.order) || 0),
        );

        if (mounted) {
          setEducations(sorted);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Could not load education data.",
          );
          setEducations([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEducation();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Education"
        title="Academic background"
        lead="My academic journey from school education to B.Tech in Computer Science (Artificial Intelligence)."
      />

      <section className="section education-section" ref={ref}>
        <div className="container">
          {loading ? (
            <div className="education-list">
              <div className="education-card">
                <div className="education-content">
                  <p>Loading education...</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="education-list">
              <div className="education-card">
                <div className="education-content">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          ) : educations.length === 0 ? (
            <div className="education-list">
              <div className="education-card">
                <div className="education-content">
                  <h3>No education records available</h3>
                  <p className="education-detail">
                    Education information will appear here once it is added from
                    the admin panel.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="education-list">
              {educations.map((e) => (
                <article
                  className="education-card reveal"
                  key={e._id || `${e.years}-${e.title}`}
                >
                  {/* LEFT SIDE */}
                  <div className="education-meta">
                    {/* Institution Emoji */}
                    <div className="education-icon" aria-hidden="true">
                      {e.icon || "🎓"}
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

                    {/* CGPA */}
                    {e.cgpa && (
                      <div className="education-score education-cgpa">
                        <span className="score-label">CGPA</span>

                        <span className="score-value">{e.cgpa}</span>
                      </div>
                    )}

                    {/* Percentage */}
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
          )}
        </div>
      </section>
    </>
  );
}

export default EducationPage;
