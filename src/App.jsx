import { Routes, Route } from "react-router-dom";
import ProtectedLayout from "./components/ProtectedLayout.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ProjectDetail from "./pages/ProjectDetail.jsx";
import Teams from "./pages/Teams.jsx";
import Reports from "./pages/Reports.jsx";
import TaskDetail from "./pages/TaskDetail.jsx";
import Settings from "./pages/Settings.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;