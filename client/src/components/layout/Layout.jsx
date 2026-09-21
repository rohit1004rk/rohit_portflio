import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import { trackPageView, trackSessionStart } from "../../analytics/analytics.js";

const ANALYTICS_SESSION_KEY = "portfolio_analytics_session_started";
const ANALYTICS_PAGE_KEY = "portfolio_analytics_last_page_view";

function Layout() {
  const location = useLocation();

  // Start exactly one analytics session for this browser tab/session.
  useEffect(() => {
    try {
      const alreadyStarted = sessionStorage.getItem(ANALYTICS_SESSION_KEY);

      if (alreadyStarted) return;

      sessionStorage.setItem(ANALYTICS_SESSION_KEY, "true");
      trackSessionStart();
    } catch {
      // Analytics must never break the public site.
    }
  }, []);

  // Record one page view per route visit while preventing
  // React Strict Mode from immediately sending the same event twice.
  useEffect(() => {
    const page = `${location.pathname}${location.search || ""}`;

    try {
      const now = Date.now();
      const lastPageView = JSON.parse(
        sessionStorage.getItem(ANALYTICS_PAGE_KEY) || "null",
      );

      const isSamePage =
        lastPageView?.page === page &&
        now - Number(lastPageView?.timestamp || 0) < 1000;

      if (isSamePage) return;

      sessionStorage.setItem(
        ANALYTICS_PAGE_KEY,
        JSON.stringify({
          page,
          timestamp: now,
        }),
      );

      trackPageView(page);
    } catch {
      // Analytics must never break the public site.
    }
  }, [location.pathname, location.search]);

  return (
    <>
      <div className="tech-bg" aria-hidden="true" />
      <ScrollToTop />
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer />
    </>
  );
}

export default Layout;
