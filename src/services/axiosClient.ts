import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080",
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
      console.warn("Unauthorized → Redirecting to login...");

      // Remove token
      localStorage.removeItem("token");

      // Redirect user to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
