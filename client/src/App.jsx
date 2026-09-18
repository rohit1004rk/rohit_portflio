import { Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import SkillsPage from "./pages/SkillsPage.jsx";
import ProjectsPage from "./pages/ProjectsPage.jsx";
import ProjectDetailPage from "./pages/ProjectDetailPage.jsx";
import ExperiencePage from "./pages/ExperiencePage.jsx";
import AchievementsPage from "./pages/AchievementsPage.jsx";
import EducationPage from "./pages/EducationPage.jsx";
import ResumePage from "./pages/ResumePage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AdminExperiencePage from "./pages/AdminExperiencePage.jsx";
import AdminSkillsPage from "./pages/AdminSkillsPage.jsx";
import AdminProjectsPage from "./pages/AdminProjectsPage.jsx";
import AdminEducationPage from "./pages/AdminEducationPage.jsx";
import AdminCertificatesPage from "./pages/AdminCertificatesPage.jsx";
import AdminMessagesPage from "./pages/AdminMessagesPage.jsx";
import AdminPortfolioSettingsPage from "./pages/AdminPortfolioSettingsPage.jsx";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:slug" element={<ProjectDetailPage />} />
        <Route path="/experience" element={<ExperiencePage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={<AdminDashboardPage />} />
      <Route path="/admin/projects" element={<AdminProjectsPage />} />
      <Route path="/admin/skills" element={<AdminSkillsPage />} />
      <Route path="/admin/experience" element={<AdminExperiencePage />} />
      <Route path="/admin/education" element={<AdminEducationPage />} />
      <Route path="/admin/certificates" element={<AdminCertificatesPage />} />
      <Route path="/admin/messages" element={<AdminMessagesPage />} />
      <Route path="/admin/settings" element={<AdminPortfolioSettingsPage />} />
    </Routes>
  );
}

export default App;
