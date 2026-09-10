import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import ScrollToTop from './ScrollToTop.jsx';
import ChatWidget from '../chat/ChatWidget.jsx';

function Layout() {
  return (
    <>
      <div className="tech-bg" aria-hidden="true" />
      <ScrollToTop />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

export default Layout;
