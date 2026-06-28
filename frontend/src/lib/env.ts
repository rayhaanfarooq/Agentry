const fallbackApiUrl = "http://localhost:8000";

export const API_URL = (import.meta.env.VITE_API_URL || fallbackApiUrl).replace(/\/$/, "");
