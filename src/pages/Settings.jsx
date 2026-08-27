import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const Settings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <div className="section-head">
        <h2>Settings</h2>
      </div>

      <div className="detail-card">
        <h3>Profile</h3>
        <p><strong>Name:</strong> {user?.name || "—"}</p>
        <p><strong>Email:</strong> {user?.email || "—"}</p>
      </div>

      <div className="detail-card">
        <h3>Account</h3>
        <p className="muted">Sign out of your Workasana account.</p>
        <div className="detail-actions">
          <button className="btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default Settings;