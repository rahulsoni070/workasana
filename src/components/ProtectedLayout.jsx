import { Navigate, Outlet } from "react-router-dom";
import Layout from "./Layout.jsx";

const ProtectedLayout = () => {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default ProtectedLayout;