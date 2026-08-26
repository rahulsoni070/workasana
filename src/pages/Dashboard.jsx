import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";

const STATUSES = ["To Do", "In Progress", "Completed", "Blocked"];

const badgeClass = (status) => {
  if (status === "Completed") return "badge completed";
  if (status === "In Progress") return "badge progress";
  if (status === "Blocked") return "badge blocked";
  return "badge todo";
};

function sortTasks(tasks, sort) {
  if (sort === "time") return [...tasks].sort((a, b) => a.estimatedTime - b.estimatedTime);
  return tasks;
}

// Reusable creatable multi-select for tags
const TagInput = ({ value, onChange, suggestions = [] }) => {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag) => {
    const clean = tag.trim();
    if (!clean) return;
    if (value.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      setInput("");
      return;
    }
    onChange([...value, clean]);
    setInput("");
  };

  const removeTag = (tag) => {
    onChange(value.filter((t) => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    (s) =>
      !value.some((t) => t.toLowerCase() === s.toLowerCase()) &&
      (input === "" || s.toLowerCase().includes(input.toLowerCase()))
  );

  return (
    <div className="tag-input">
      <div className="tag-input-chips">
        {value.map((tag) => (
          <span key={tag} className="tag-chip">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={value.length ? "" : "Type and press Enter to add a tag"}
        />
      </div>
      {showSuggestions && (filteredSuggestions.length > 0 || input) && (
        <div className="tag-suggestions">
          {filteredSuggestions.map((s) => (
            <button
              type="button"
              key={s}
              className="tag-suggestion-item"
              onMouseDown={() => addTag(s)}
            >
              {s}
            </button>
          ))}
          {input && !suggestions.some((s) => s.toLowerCase() === input.toLowerCase()) && (
            <button type="button" className="tag-suggestion-item tag-suggestion-new" onMouseDown={() => addTag(input)}>
              + Create "{input}"
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [taskForm, setTaskForm] = useState({
    name: "",
    project: "",
    team: "",
    tags: [],
    dueDate: "",
    estimatedTime: 1,
    status: "To Do",
  });

  const loadProjects = () => api.get("/projects").then((r) => setProjects(r.data));
  const loadTeams = () => api.get("/teams").then((r) => setTeams(r.data));
  const loadTasks = () => {
    const qs = searchParams.toString();
    api.get(`/tasks${qs ? `?${qs}` : ""}`).then((r) => setTasks(r.data));
  };

  useEffect(() => { loadProjects(); loadTeams(); }, []);
  useEffect(() => { loadTasks(); }, [searchParams]);

  // Build a de-duplicated list of tags already used elsewhere, for suggestions
  const existingTags = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => (t.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [tasks]);

  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    setSearchParams(next);
  };

  const createProject = async (e) => {
    e.preventDefault();
    await api.post("/projects", projectForm);
    setProjectForm({ name: "", description: "" });
    setShowProjectModal(false);
    loadProjects();
  };

  const createTask = async (e) => {
    e.preventDefault();
    const payload = {
      ...taskForm,
      estimatedTime: Number(taskForm.estimatedTime),
    };
    await api.post("/tasks", payload);
    setTaskForm({ name: "", project: "", team: "", tags: [], dueDate: "", estimatedTime: 1, status: "To Do" });
    setShowTaskModal(false);
    loadTasks();
  };

  return (
    <div>
      <div className="section-head">
        <h2>Projects</h2>
        <button onClick={() => setShowProjectModal(true)}>+ New Project</button>
      </div>
      <div className="card-grid">
        {projects.map((p) => (
          <div key={p._id} className="card clickable" onClick={() => navigate(`/projects/${p._id}`)}>
            <div className="card-title">{p.name}</div>
            <p className="card-desc">{p.description || "No description"}</p>
          </div>
        ))}
        {projects.length === 0 && <p className="muted">No projects yet.</p>}
      </div>

      <div className="section-head" style={{ marginTop: 32 }}>
        <h2>My Tasks</h2>
        <button onClick={() => setShowTaskModal(true)}>+ New Task</button>
      </div>

      <div className="filter-bar">
        <select value={searchParams.get("status") || ""} onChange={(e) => updateFilter("status", e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={searchParams.get("team") || ""} onChange={(e) => updateFilter("team", e.target.value)}>
          <option value="">All teams</option>
          {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
        <select value={searchParams.get("project") || ""} onChange={(e) => updateFilter("project", e.target.value)}>
          <option value="">All projects</option>
          {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={searchParams.get("sort") || ""} onChange={(e) => updateFilter("sort", e.target.value)}>
          <option value="">Sort: Newest</option>
          <option value="time">Sort: Time to complete</option>
        </select>
      </div>

      <div className="card-grid">
        {sortTasks(tasks, searchParams.get("sort")).map((task) => (
          <div key={task._id} className="card clickable" onClick={() => navigate(`/tasks/${task._id}`)}>
            <span className={badgeClass(task.status)}>{task.status}</span>
            <div className="card-title">{task.name}</div>
            <p className="card-meta">{task.estimatedTime} days · {task.project?.name || "—"}</p>
          </div>
        ))}
        {tasks.length === 0 && <p className="muted">No tasks match these filters.</p>}
      </div>

      {showProjectModal && (
        <Modal title="Create New Project" onClose={() => setShowProjectModal(false)}>
          <form onSubmit={createProject} className="modal-form">
            <label>Project Name</label>
            <input value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} required />
            <label>Description</label>
            <textarea rows="3" value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} />
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowProjectModal(false)}>Cancel</button>
              <button type="submit">Create</button>
            </div>
          </form>
        </Modal>
      )}

      {showTaskModal && (
        <Modal title="Create New Task" onClose={() => setShowTaskModal(false)}>
          <form onSubmit={createTask} className="modal-form">
            <label>Task Name</label>
            <input value={taskForm.name} onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })} required />

            <label>Project</label>
            <select value={taskForm.project} onChange={(e) => setTaskForm({ ...taskForm, project: e.target.value })} required>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>

            <label>Team</label>
            <select value={taskForm.team} onChange={(e) => setTaskForm({ ...taskForm, team: e.target.value })} required>
              <option value="">Select team</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            <label>Tags</label>
            <TagInput
              value={taskForm.tags}
              onChange={(tags) => setTaskForm({ ...taskForm, tags })}
              suggestions={existingTags}
            />

            <label>Select Due date</label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              required
            />

            <label>Estimated Time (days)</label>
            <input
              type="number"
              min="1"
              placeholder="Enter Time in Days"
              value={taskForm.estimatedTime}
              onChange={(e) => setTaskForm({ ...taskForm, estimatedTime: e.target.value })}
            />

            <label>Status</label>
            <select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
              <button type="submit">Create Task</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Dashboard;