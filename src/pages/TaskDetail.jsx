import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

const badgeClass = (status) => {
  if (status === "Completed") return "badge completed";
  if (status === "In Progress") return "badge progress";
  if (status === "Blocked") return "badge blocked";
  return "badge todo";
};

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) : "—";

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);

  const load = () => api.get("/tasks").then((r) => setTask(r.data.find((t) => t._id === id)));
  useEffect(() => { load(); }, [id]);

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
      <h2>{task.name}</h2>
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
          <option>To Do</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>Blocked</option>
        </select>
        {task.status !== "Completed" && <button onClick={() => updateStatus("Completed")}>Mark as Complete</button>}
        <button className="btn-danger" onClick={remove}>Delete</button>
      </div>
    </div>
  );
};

export default TaskDetail;