import { useEffect, useState } from "react";
import PageHero from "../components/ui/PageHero.jsx";
import { aboutSections as fallbackAboutSections } from "../data/portfolioData.js";
import { fetchAbout } from "../api/api.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";
import { useReveal } from "../hooks/useReveal.js";

function AboutPage() {
  useDocumentTitle("About");

  const ref = useReveal();

  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadAbout = async () => {
      try {
        const data = await fetchAbout();

        if (mounted) {
          setAbout(data);
        }
      } catch (error) {
        console.error("Failed to load About content:", error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAbout();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * Keep the existing About page content as a safe fallback.
   * This prevents the public page from becoming empty if the API
   * is temporarily unavailable.
   */
  const hero = {
    enabled: about?.hero?.enabled !== false,
    eyebrow: about?.hero?.eyebrow || "About",
    title: about?.hero?.title || "Turning problems into software",
    lead:
      about?.hero?.lead ||
      "I’m Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions.",
  };

  const introduction = {
    enabled: about?.introduction?.enabled !== false,
    paragraph1:
      about?.introduction?.paragraph1 ||
      "I’m Rohit Kumar, a Computer Science (Artificial Intelligence) student at Supaul College of Engineering, Bihar, focused on building full-stack web applications and AI/ML solutions.",
    paragraph2:
      about?.introduction?.paragraph2 ||
      "I work across modern web technologies, REST APIs, databases, NLP, and computer vision. I enjoy turning practical problems into functional software — from e-commerce platforms and campus utility applications to machine-learning systems for fake-news and spam detection.",
    paragraph3:
      about?.introduction?.paragraph3 ||
      "My goal is to continuously strengthen my development and AI/ML skills and use my projects to demonstrate practical problem-solving ability to recruiters and potential clients.",
  };

  const visibility = {
    hero: about?.visibility?.hero !== false,
    introduction: about?.visibility?.introduction !== false,
    focusCards: about?.visibility?.focusCards !== false,
  };

  const focusCards =
    Array.isArray(about?.focusCards?.items) && about.focusCards.items.length > 0
      ? about.focusCards.items
          .filter((card) => card?.enabled !== false)
          .sort((a, b) => Number(a?.order ?? 0) - Number(b?.order ?? 0))
      : fallbackAboutSections.map((section, index) => ({
          icon: section.icon,
          title: section.title,
          description: section.text,
          enabled: true,
          order: index + 1,
        }));

  const showHero = hero.enabled && visibility.hero;
  const showIntroduction = introduction.enabled && visibility.introduction;

  const showFocusCards =
    about?.focusCards?.enabled !== false && visibility.focusCards;

  return (
    <>
      {showHero ? (
        <PageHero eyebrow={hero.eyebrow} title={hero.title} lead={hero.lead} />
      ) : null}

      {showIntroduction || showFocusCards ? (
        <section className="section" ref={ref}>
          <div className="container">
            <div className="about-grid">
              {showIntroduction ? (
                <div className="about-text reveal">
                  {introduction.paragraph1 ? (
                    <p>{renderStrongName(introduction.paragraph1)}</p>
                  ) : null}

                  {introduction.paragraph2 ? (
                    <p>{introduction.paragraph2}</p>
                  ) : null}

                  {introduction.paragraph3 ? (
                    <p>{introduction.paragraph3}</p>
                  ) : null}
                </div>
              ) : null}

              {showFocusCards ? (
                <div className="focus-cards reveal">
                  {focusCards.map((card, index) => (
                    <div
                      className="focus-card"
                      key={card._id || card.title || index}
                    >
                      <h4>
                        {card.icon ? `${card.icon} ` : ""}
                        {card.title}
                      </h4>

                      <p>{card.description || card.text || ""}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {loading ? null : null}
    </>
  );
}

/*
 * Preserve the existing visual emphasis on "Rohit Kumar"
 * when the default/seed paragraph is being displayed.
 *
 * For admin-edited paragraphs, the text is rendered normally
 * so the CMS content remains exactly what was entered.
 */
function renderStrongName(text) {
  const name = "Rohit Kumar";

  if (!text.includes(name)) {
    return text;
  }

  const parts = text.split(name);

  return (
    <>
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>
          {part}

          {index < parts.length - 1 ? <strong>{name}</strong> : null}
        </span>
      ))}
    </>
  );
}

export default AboutPage;
