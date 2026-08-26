import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">Workasana</Link>
      {user ? (
        <div className="nav-links">
          <Link to="/">Tasks</Link>
          <Link to="/create-task">New Task</Link>
          <Link to="/teams">Teams</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/tags">Tags</Link>
          <Link to="/reports">Reports</Link>
          <span>Hi, {user.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;