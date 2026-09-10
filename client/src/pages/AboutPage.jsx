import PageHero from '../components/ui/PageHero.jsx';
import { aboutSections } from '../data/portfolioData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useReveal } from '../hooks/useReveal.js';

function AboutPage() {
  useDocumentTitle('About');
  const ref = useReveal();

  return (
    <>
      <PageHero
        eyebrow="About"
        title="Turning problems into software"
        lead="I’m Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions."
      />
      <section className="section" ref={ref}>
        <div className="container">
          <div className="about-grid">
            <div className="about-text reveal">
              <p>
                I’m <strong>Rohit Kumar</strong>, a Computer Science (Artificial Intelligence)
                student at <strong>Supaul College of Engineering, Bihar</strong>, focused on
                building full-stack web applications and AI/ML solutions.
              </p>
              <p>
                I work across modern web technologies, REST APIs, databases, NLP, and computer
                vision. I enjoy turning practical problems into functional software — from
                e-commerce platforms and campus utility applications to machine-learning systems
                for fake-news and spam detection.
              </p>
              <p>
                My goal is to continuously strengthen my development and AI/ML skills and use my
                projects to demonstrate practical problem-solving ability to recruiters and
                potential clients.
              </p>
            </div>
            <div className="focus-cards reveal">
              {aboutSections.map((s) => (
                <div className="focus-card" key={s.title}>
                  <h4>
                    {s.icon} {s.title}
                  </h4>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default AboutPage;
