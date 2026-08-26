import { useEffect, useState } from "react";
import api from "../api/axios.js";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchProjects = async () => {
    const res = await api.get("/projects");
    setProjects(res.data);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/projects", { name, description });
    setName("");
    setDescription("");
    fetchProjects();
  };

  return (
    <div>
      <h2>Projects</h2>
      <form onSubmit={handleSubmit} className="form">
        <input placeholder="Project name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <button type="submit">Add Project</button>
      </form>
      <ul>
        {projects.map((p) => (
          <li key={p._id}>{p.name} — {p.description}</li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;