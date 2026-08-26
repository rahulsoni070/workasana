import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card">
        <div className="brand center">workasana</div>
        <h2 className="auth-title">Log in to your account</h2>
        <p className="auth-sub">Please enter your details.</p>
        {error && <p className="error">{error}</p>}
        <label>Email</label>
        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign in</button>
        <p className="auth-foot">No account? <Link to="/signup">Sign up</Link></p>
      </form>
    </div>
  );
};

export default Login;