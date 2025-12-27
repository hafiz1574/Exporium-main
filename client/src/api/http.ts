import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("exporium_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Normalize common network/timeout failures so UI shows an error instead of spinning forever.
    if (err?.code === "ECONNABORTED") {
      err.message = "Request timed out. Check your API URL/server.";
    } else if (!err?.response && err?.message) {
      err.message = `${err.message}. Check your API URL/server.`;
    }
    return Promise.reject(err);
  }
);
