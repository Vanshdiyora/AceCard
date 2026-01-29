import axios from "axios";
import { eraseCookie, getCookie } from "../utils/cookieUtils";

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL;

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// -----------------------------
// REQUEST INTERCEPTOR
// -----------------------------
axiosClient.interceptors.request.use((config) => {
  const token = getCookie("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});



// -----------------------------
// RESPONSE INTERCEPTOR
// -----------------------------
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Remove token
      eraseCookie("token");

      // Redirect user to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
