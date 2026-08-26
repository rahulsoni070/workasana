import { useEffect, useState } from "react";
import api from "../api/axios.js";

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [name, setName] = useState("");

  const fetchTags = async () => {
    const res = await api.get("/tags");
    setTags(res.data);
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await api.post("/tags", { name });
    setName("");
    fetchTags();
  };

  return (
    <div>
      <h2>Tags</h2>
      <form onSubmit={handleSubmit} className="form">
        <input placeholder="Tag name" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit">Add Tag</button>
      </form>
      <ul>
        {tags.map((t) => (
          <li key={t._id}>{t.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default Tags;