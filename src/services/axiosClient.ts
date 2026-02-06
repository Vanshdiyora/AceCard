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
axiosClient.interceptors.request.use(
  (config) => {
    const token = getCookie("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
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
    const status = error?.response?.status;
    const message = error?.response?.data?.error;

    const shouldLogout = (status === 403 && message === "Your Vendor account is archived");

    if (shouldLogout) {
      // 🔥 Clear auth cookie
      eraseCookie("token");

      // 🔁 Prevent redirect loop
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
