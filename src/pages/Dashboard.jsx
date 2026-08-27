import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";
import TagInput from "../components/TagInput.jsx";
import OwnerSelect from "../components/OwnerSelect.jsx";

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

const emptyTask = {
  name: "",
  project: "",
  team: "",
  tags: [],
  owners: [],
  dueDate: "",
  estimatedTime: 1,
  status: "To Do",
};

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: "", description: "" });
  const [taskForm, setTaskForm] = useState(emptyTask);

  const loadProjects = () => api.get("/projects").then((r) => setProjects(r.data));
  const loadTeams = () => api.get("/teams").then((r) => setTeams(r.data));
  const loadUsers = () => api.get("/auth/users").then((r) => setUsers(r.data));
  const loadTags = () => api.get("/tags").then((r) => setAllTags(r.data));
  const loadTasks = () => {
    const qs = searchParams.toString();
    api.get(`/tasks${qs ? `?${qs}` : ""}`).then((r) => setTasks(r.data));
  };

  useEffect(() => { loadProjects(); loadTeams(); loadUsers(); loadTags(); }, []);
  useEffect(() => { loadTasks(); }, [searchParams]);

  const tagNames = useMemo(() => {
    const set = new Set(allTags.map((t) => t.name));
    tasks.forEach((t) => (t.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [allTags, tasks]);

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
    const payload = { ...taskForm, estimatedTime: Number(taskForm.estimatedTime) };
    try {
      await api.post("/tasks", payload);
      setTaskForm(emptyTask);
      setShowTaskModal(false);
      loadTasks();
      loadTags();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create task");
    }
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
        <select value={searchParams.get("owner") || ""} onChange={(e) => updateFilter("owner", e.target.value)}>
          <option value="">All owners</option>
          {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <select value={searchParams.get("tags") || ""} onChange={(e) => updateFilter("tags", e.target.value)}>
          <option value="">All tags</option>
          {tagNames.map((t) => <option key={t} value={t}>{t}</option>)}
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

            <label>Owners</label>
            <OwnerSelect
              value={taskForm.owners}
              onChange={(owners) => setTaskForm({ ...taskForm, owners })}
              users={users}
            />

            <label>Tags</label>
            <TagInput
              value={taskForm.tags}
              onChange={(tags) => setTaskForm({ ...taskForm, tags })}
              suggestions={tagNames}
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