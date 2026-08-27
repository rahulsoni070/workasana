import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <Link to="/" className="brand">workasana</Link>
        <nav className="side-nav">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/teams">Teams</NavLink>
          <NavLink to="/reports">Reports</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        <div className="side-foot">
          <div className="user-chip">{user?.name}</div>
          <button className="btn-secondary" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main">
        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;