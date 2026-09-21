import { useEffect, useState } from "react";
import Hero from "../components/home/Hero.jsx";
import CodeShowcase from "../components/home/CodeShowcase.jsx";
import FeaturedProjects from "../components/home/FeaturedProjects.jsx";
import Blog from "../components/home/Blog.jsx";
import { fetchPublicPortfolioSettings } from "../api/api.js";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

const DEFAULT_SECTIONS = {
  hero: true,
  codeShowcase: true,
  featuredProjects: true,
  blog: true,
};

function HomePage() {
  useDocumentTitle("");

  const [sections, setSections] = useState(DEFAULT_SECTIONS);

  useEffect(() => {
    let mounted = true;

    const loadHomepageSettings = async () => {
      try {
        const data = await fetchPublicPortfolioSettings();

        if (!mounted) {
          return;
        }

        const homepage = data?.homepage || {};
        const homepageSections = homepage.sections || {};

        setSections({
          hero: homepageSections.hero !== false,
          codeShowcase: homepageSections.codeShowcase !== false,
          featuredProjects: homepageSections.featuredProjects !== false,
          blog: homepageSections.blog !== false,
        });
      } catch (error) {
        console.error("Failed to load homepage visibility settings:", error);

        if (mounted) {
          setSections(DEFAULT_SECTIONS);
        }
      }
    };

    loadHomepageSettings();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {sections.hero && <Hero />}

      {sections.codeShowcase && <CodeShowcase />}

      {sections.featuredProjects && <FeaturedProjects />}

      {sections.blog && <Blog />}
    </>
  );
}

export default HomePage;
