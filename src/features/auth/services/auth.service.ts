import axiosClient from "../../../services/axiosClient";

/* -------------------------------
   Types
-------------------------------- */

export interface LoginPayload {
  email: string;
  password: string;
}

/* -------------------------------
   Requests
-------------------------------- */

export const loginRequest = async (payload: LoginPayload) => {
  const res = await axiosClient.post("/auth/login", payload);
  return res.data; // { token }
};

export const forgotPasswordRequest = (email: string) =>
  axiosClient.post("/auth/forgot-password", { email });

export const verifyCodeRequest = (email: string, code: string) =>
  axiosClient.post("/auth/verify-code", { email, code });

export const resetPasswordRequest = (reset_token: string, new_password: string) =>
  axiosClient.post("/auth/reset-password", { reset_token, new_password });
