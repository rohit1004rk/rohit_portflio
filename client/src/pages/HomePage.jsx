import Hero from '../components/home/Hero.jsx';
import FeaturedProjects from '../components/home/FeaturedProjects.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

function HomePage() {
  useDocumentTitle('');
  return (
    <>
      <Hero />
      <FeaturedProjects />
    </>
  );
}

export default HomePage;
