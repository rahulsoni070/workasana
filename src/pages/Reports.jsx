import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend,
} from "chart.js";
import api from "../api/axios.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Reports = () => {
  const [lastWeek, setLastWeek] = useState([]);
  const [pending, setPending] = useState(null);
  const [closed, setClosed] = useState([]);

  useEffect(() => {
    api.get("/report/last-week").then((r) => setLastWeek(r.data));
    api.get("/report/pending").then((r) => setPending(r.data));
    api.get("/report/closed-tasks").then((r) => setClosed(r.data));
  }, []);

  const lastWeekData = {
    labels: lastWeek.map((t) => t.name),
    datasets: [{ label: "Days", data: lastWeek.map((t) => t.estimatedTime), backgroundColor: "#4f46e5" }],
  };

  const byTeam = {};
  closed.forEach((t) => {
    const name = t.team?.name || "Unassigned";
    byTeam[name] = (byTeam[name] || 0) + 1;
  });
  const closedData = {
    labels: Object.keys(byTeam),
    datasets: [{ label: "Closed tasks", data: Object.values(byTeam), backgroundColor: ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#10b981"] }],
  };

  const pendingData = {
    labels: ["Total days pending"],
    datasets: [{ label: "Days", data: [pending?.totalDaysPending || 0], backgroundColor: "#f59e0b" }],
  };

  return (
    <div>
      <h2>Reports</h2>
      <div className="report-grid">
        <div className="report-card">
          <h3>Total Work Done Last Week</h3>
          {lastWeek.length ? <Bar data={lastWeekData} /> : <p className="muted">No completed tasks last week.</p>}
        </div>
        <div className="report-card">
          <h3>Total Days of Work Pending</h3>
          <Bar data={pendingData} />
          {pending && <p className="muted">{pending.pendingTasks} pending tasks · {pending.totalDaysPending} days</p>}
        </div>
        <div className="report-card">
          <h3>Tasks Closed by Team</h3>
          {closed.length ? <Pie data={closedData} /> : <p className="muted">No completed tasks yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default Reports;