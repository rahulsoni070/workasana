import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";

const badgeClass = (status) => {
  if (status === "Completed") return "badge completed";
  if (status === "In Progress") return "badge progress";
  if (status === "Blocked") return "badge blocked";
  return "badge todo";
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.get("/projects").then((r) => setProject(r.data.find((p) => p._id === id)));
    api.get(`/tasks?project=${id}`).then((r) => setTasks(r.data));
  }, [id]);

  return (
    <div>
      <Link to="/" className="back-link">← Back to Dashboard</Link>
      <h2>{project ? project.name : "Project"}</h2>
      <p className="muted">{project?.description}</p>
      <table className="task-table">
        <thead>
          <tr><th>Task</th><th>Owner</th><th>Team</th><th>Days</th><th>Status</th></tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t._id} className="clickable" onClick={() => navigate(`/tasks/${t._id}`)}>
              <td>{t.name}</td>
              <td>{t.owners?.map((o) => o.name).join(", ") || "—"}</td>
              <td>{t.team?.name || "—"}</td>
              <td>{t.timeToComplete}</td>
              <td><span className={badgeClass(t.status)}>{t.status}</span></td>
            </tr>
          ))}
          {tasks.length === 0 && <tr><td colSpan="5" className="muted">No tasks in this project.</td></tr>}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectDetail;
