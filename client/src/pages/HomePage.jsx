import Hero from "../components/home/Hero.jsx";
import CodeShowcase from "../components/home/CodeShowcase.jsx";
import FeaturedProjects from "../components/home/FeaturedProjects.jsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.js";

function HomePage() {
  useDocumentTitle("");

  return (
    <>
      <Hero />
      <CodeShowcase />
      <FeaturedProjects />
    </>
  );
}

export default HomePage;
