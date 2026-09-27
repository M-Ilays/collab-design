import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
  validateStatus: (status) => status < 500, // Treat 4xx errors as valid responses
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("collabToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
