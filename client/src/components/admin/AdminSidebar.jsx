import { NavLink } from "react-router-dom";

const adminLinks = [
  { label: "Dashboard", to: "/admin", icon: "▦" },
  { label: "Projects", to: "/admin/projects", icon: "▣" },
  { label: "Skills", to: "/admin/skills", icon: "◆" },
  { label: "Experience", to: "/admin/experience", icon: "◉" },
  { label: "Education", to: "/admin/education", icon: "◇" },
  { label: "Certificates", to: "/admin/certificates", icon: "▤" },
  { label: "Messages", to: "/admin/messages", icon: "✉" },
  { label: "Portfolio Settings", to: "/admin/settings", icon: "⚙" },
];

function AdminSidebar({ onLogout }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-brand">ADMIN PANEL</div>
        <div className="admin-sidebar-user">Rohit Kumar</div>
      </div>

      <nav className="admin-sidebar-nav" aria-label="Admin navigation">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/admin"}
            className={({ isActive }) =>
              `admin-sidebar-link${isActive ? " active" : ""}`
            }
          >
            <span className="admin-sidebar-icon" aria-hidden="true">
              {link.icon}
            </span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button
          type="button"
          className="admin-sidebar-logout"
          onClick={onLogout}
        >
          <span className="admin-sidebar-icon" aria-hidden="true">
            ↪
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
