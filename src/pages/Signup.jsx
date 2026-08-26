import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/signup", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-page">
      <form onSubmit={handleSubmit} className="auth-card">
        <div className="brand center">workasana</div>
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-sub">Please enter your details.</p>
        {error && <p className="error">{error}</p>}
        <label>Name</label>
        <input placeholder="Enter your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Email</label>
        <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign up</button>
        <p className="auth-foot">Have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  );
};

export default Signup;