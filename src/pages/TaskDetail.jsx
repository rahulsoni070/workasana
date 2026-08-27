import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const toInputDate = (d) => (d ? new Date(d).toISOString().split("T")[0] : "");

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState(null);

  const load = () => api.get(`/tasks/${id}`).then((r) => setTask(r.data));

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    api.get("/projects").then((r) => setProjects(r.data));
    api.get("/teams").then((r) => setTeams(r.data));
    api.get("/auth/users").then((r) => setUsers(r.data));
    api.get("/tags").then((r) => setAllTags(r.data));
  }, []);

  const tagNames = useMemo(() => {
    const set = new Set(allTags.map((t) => t.name));
    (task?.tags || []).forEach((t) => set.add(t));
    return Array.from(set).sort();
  }, [allTags, task]);

  const openEdit = () => {
    setForm({
      name: task.name,
      project: task.project?._id || "",
      team: task.team?._id || "",
      owners: (task.owners || []).map((o) => o._id),
      tags: task.tags || [],
      dueDate: toInputDate(task.dueDate),
      estimatedTime: task.estimatedTime || 1,
      status: task.status,
    });
    setShowEdit(true);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/tasks/${id}`, { ...form, estimatedTime: Number(form.estimatedTime) });
      setShowEdit(false);
      load();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update task");
    }
  };

  const updateStatus = async (status) => {
    await api.post(`/tasks/${id}`, { status });
    load();
  };

  const remove = async () => {
    await api.delete(`/tasks/${id}`);
    navigate("/");
  };

  if (!task) return <p className="muted">Loading task...</p>;

  return (
    <div>
      <Link to="/" className="back-link">← Back to Dashboard</Link>
      <div className="section-head">
        <h2>{task.name}</h2>
        <button onClick={openEdit}>Edit Task</button>
      </div>
      <div className="detail-card">
        <p><strong>Project:</strong> {task.project?.name || "—"}</p>
        <p><strong>Team:</strong> {task.team?.name || "—"}</p>
        <p><strong>Owners:</strong> {task.owners?.map((o) => o.name).join(", ") || "—"}</p>
        <p><strong>Tags:</strong> {task.tags?.join(", ") || "—"}</p>
        <p><strong>Due Date:</strong> {formatDate(task.dueDate)}</p>
        <p><strong>Estimated Time:</strong> {task.estimatedTime ? `${task.estimatedTime} days` : "—"}</p>
        <p><strong>Status:</strong> <span className={badgeClass(task.status)}>{task.status}</span></p>
      </div>
      <div className="detail-actions">
        <label>Update status:</label>
        <select value={task.status} onChange={(e) => updateStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {task.status !== "Completed" && <button onClick={() => updateStatus("Completed")}>Mark as Complete</button>}
        <button className="btn-danger" onClick={remove}>Delete</button>
      </div>

      {showEdit && form && (
        <Modal title="Edit Task" onClose={() => setShowEdit(false)}>
          <form onSubmit={saveEdit} className="modal-form">
            <label>Task Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />

            <label>Project</label>
            <select value={form.project} onChange={(e) => setForm({ ...form, project: e.target.value })} required>
              <option value="">Select project</option>
              {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>

            <label>Team</label>
            <select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} required>
              <option value="">Select team</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>

            <label>Owners</label>
            <OwnerSelect
              value={form.owners}
              onChange={(owners) => setForm({ ...form, owners })}
              users={users}
            />

            <label>Tags</label>
            <TagInput
              value={form.tags}
              onChange={(tags) => setForm({ ...form, tags })}
              suggestions={tagNames}
            />

            <label>Due date</label>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />

            <label>Estimated Time (days)</label>
            <input type="number" min="1" value={form.estimatedTime} onChange={(e) => setForm({ ...form, estimatedTime: e.target.value })} />

            <label>Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
              <button type="submit">Save Changes</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TaskDetail;