const RAW_API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const API = RAW_API_URL.replace(/\/+$/, "");