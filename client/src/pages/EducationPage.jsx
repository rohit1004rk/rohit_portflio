import PageHero from '../components/ui/PageHero.jsx';
import { education } from '../data/portfolioData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useReveal } from '../hooks/useReveal.js';

function EducationPage() {
  useDocumentTitle('Education');
  const ref = useReveal();

  return (
    <>
      <PageHero
        eyebrow="Education"
        title="Academic background"
        lead="My formal education and the self-driven learning that complements it."
      />
      <section className="section" ref={ref}>
        <div className="container">
          <div className="projects-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
            {education.map((e) => (
              <div className="timeline-card reveal" key={e.title}>
                <span className="yr">{e.years}</span>
                <div>
                  <h3>{e.title}</h3>
                  <div className="where">{e.place}</div>
                  <p>{e.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default EducationPage;
