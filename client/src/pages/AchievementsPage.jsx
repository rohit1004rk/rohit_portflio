import { useEffect, useState } from "react";
import PageHero from "../components/ui/PageHero.jsx";
import { achievements } from "../data/portfolioData.js";
import { fetchCertificates } from "../api/api.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

function AchievementsPage() {
  useDocumentTitle("Achievements");

  const ref = useReveal();
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    const loadCertificates = async () => {
      try {
        const data = await fetchCertificates();
        setCertificates(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load certificates:", error);
      }
    };

    loadCertificates();
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Achievements"
        title="Highlights & recognition"
        lead="Academic and co-curricular milestones from my time at Supaul College of Engineering."
      />

      {/* ── Achievements ───────────────────────────────── */}
      <section className="section" ref={ref}>
        <div className="container">
          <ul className="ach-list">
            {achievements.map((a) => (
              <li className="reveal" key={a}>
                <span className="ck">✓</span>
                {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Certifications ─────────────────────────────── */}
      <section className="section certifications-section">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Certifications</span>
            <h2>Certificates & credentials</h2>
            <p>
              Certifications and program credentials earned through internships,
              learning programs, and professional development.
            </p>
          </div>

          {certificates.length > 0 ? (
            <div className="certifications-grid">
              {certificates.map((certificate) => (
                <article className="certificate-card" key={certificate._id}>
                  <div className="certificate-icon" aria-hidden="true">
                    📜
                  </div>

                  <div className="certificate-content">
                    <span className="certificate-category">
                      {certificate.category || "Certification"}
                    </span>

                    <h3>{certificate.title}</h3>

                    <p className="certificate-issuer">{certificate.issuer}</p>

                    {certificate.completionDate && (
                      <p className="certificate-date">
                        <strong>Completed:</strong> {certificate.completionDate}
                      </p>
                    )}

                    {certificate.certificateId && (
                      <p className="certificate-id">
                        <strong>Certificate ID:</strong>{" "}
                        {certificate.certificateId}
                      </p>
                    )}

                    {certificate.description && (
                      <p className="certificate-description">
                        {certificate.description}
                      </p>
                    )}

                    <a
                      className="btn btn-teal certificate-view-btn"
                      href={`/api/certificates/${certificate._id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Certificate →
                    </a>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="certificate-empty">
              <p>No certificates have been added yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default AchievementsPage;
