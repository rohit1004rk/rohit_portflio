import PageHero from "../components/ui/PageHero.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

const RESUME_FILE = "/rohit-kumar-resume.pdf";

function ResumePage() {
  useDocumentTitle("Resume");
  const ref = useReveal();

  return (
    <div className="resume-page">
      <PageHero
        eyebrow="Resume"
        title="Rohit Kumar"
        lead="Full Stack + AI/ML Developer"
      />
      <section className="section" ref={ref}>
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div className="resume-box reveal">
            <a
              className="btn btn-primary"
              href={RESUME_FILE}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Resume
            </a>
            <a className="btn btn-ghost" href={RESUME_FILE} download>
              Download Resume
            </a>
          </div>
          <div className="resume-divider" />
        </div>
      </section>
    </div>
  );
}

export default ResumePage;
