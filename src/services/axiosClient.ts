import axios from "axios";

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8080";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// -----------------------------
// REQUEST INTERCEPTOR
// -----------------------------
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (after login)
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// -----------------------------
// RESPONSE INTERCEPTOR
// -----------------------------
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove token
      localStorage.removeItem("token");

      // Redirect user to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
