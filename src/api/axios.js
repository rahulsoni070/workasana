import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://workasana-backend-phi.vercel.app",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// An expired or invalid token makes every request fail with 401 and leaves the
// app showing empty pages, so clear the session and send the user back to login.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.startsWith("/auth/login") || err.config?.url?.startsWith("/auth/signup");
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

export default api;
