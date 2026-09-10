import PageHero from '../components/ui/PageHero.jsx';
import { achievements } from '../data/portfolioData.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useReveal } from '../hooks/useReveal.js';

function AchievementsPage() {
  useDocumentTitle('Achievements');
  const ref = useReveal();

  return (
    <>
      <PageHero
        eyebrow="Achievements"
        title="Highlights & recognition"
        lead="Academic and co-curricular milestones from my time at Supaul College of Engineering."
      />
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
    </>
  );
}

export default AchievementsPage;
