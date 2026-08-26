import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const CreateTask = () => {
  const [form, setForm] = useState({
    name: "",
    project: "",
    team: "",
    dueDate: "",
    estimatedTime: 1,
    status: "To Do",
  });
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/projects").then((res) => setProjects(res.data));
    api.get("/teams").then((res) => setTeams(res.data));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/tasks", { ...form, owners: [], tags: [] });
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <h2>Create Task</h2>
      <input name="name" placeholder="Task name" value={form.name} onChange={handleChange} required />

      <select name="project" value={form.project} onChange={handleChange} required>
        <option value="">Select project</option>
        {projects.map((p) => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>

      <select name="team" value={form.team} onChange={handleChange} required>
        <option value="">Select team</option>
        {teams.map((t) => (
          <option key={t._id} value={t._id}>{t.name}</option>
        ))}
      </select>

      <label htmlFor="dueDate">Select Due date</label>
      <input
        id="dueDate"
        name="dueDate"
        type="date"
        value={form.dueDate}
        onChange={handleChange}
        required
      />

      <label htmlFor="estimatedTime">Estimated Time</label>
      <input
        id="estimatedTime"
        name="estimatedTime"
        type="number"
        min="1"
        placeholder="Enter Time in Days"
        value={form.estimatedTime}
        onChange={handleChange}
      />

      <select name="status" value={form.status} onChange={handleChange}>
        <option value="To Do">To Do</option>
        <option value="In Progress">In Progress</option>
        <option value="Completed">Completed</option>
        <option value="Blocked">Blocked</option>
      </select>

      <button type="submit">Create</button>
    </form>
  );
};

export default CreateTask;