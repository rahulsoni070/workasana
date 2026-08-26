import { useEffect, useState } from "react";
import api from "../api/axios.js";
import Modal from "../components/Modal.jsx";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });

  const load = () => api.get("/teams").then((r) => setTeams(r.data));
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    await api.post("/teams", form);
    setForm({ name: "", description: "" });
    setShow(false);
    load();
  };

  return (
    <div>
      <div className="section-head">
        <h2>Teams</h2>
        <button onClick={() => setShow(true)}>+ New Team</button>
      </div>
      <div className="card-grid">
        {teams.map((t) => (
          <div key={t._id} className="card">
            <div className="card-title">{t.name}</div>
            <p className="card-desc">{t.description || "No description"}</p>
          </div>
        ))}
        {teams.length === 0 && <p className="muted">No teams yet.</p>}
      </div>
      {show && (
        <Modal title="Create New Team" onClose={() => setShow(false)}>
          <form onSubmit={create} className="modal-form">
            <label>Team Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <label>Description</label>
            <textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setShow(false)}>Cancel</button>
              <button type="submit">Create</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Teams;