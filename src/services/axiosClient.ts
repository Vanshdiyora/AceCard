import axios from "axios";
import { eraseCookie, getCookie } from "../utils/cookieUtils";

const BASE_URL = "https://api.theacecard.co";

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
    const role = getCookie("role");

    const shouldLogoutVendorArchived =
      status === 403 && message === "Your Vendor account is archived";

    const shouldLogoutSuperAdmin =
      status === 401 && role === "super_admin";

    const shouldLogoutInvalidToken =
      message === "invalid token";

    if (
      shouldLogoutVendorArchived ||
      shouldLogoutSuperAdmin ||
      shouldLogoutInvalidToken
    ) {
      // 🔥 Clear auth cookies
      eraseCookie("token");
      eraseCookie("subdomain");
      eraseCookie("role");

      // 🔁 Prevent redirect loop
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
