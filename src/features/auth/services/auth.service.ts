import axiosClient from "../../../services/axiosClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginRequest = async (payload: LoginPayload) => {
  const res = await axiosClient.post("/auth/login", payload);
  return res.data; // { token: "JWT_TOKEN" }
};

export const forgotPasswordRequest = (email: string) =>
  axiosClient.post("/auth/forgot-password", { email });

export const resetPasswordRequest = (
  email: string,
  code: string,
  new_password: string
) =>
  axiosClient.post("/auth/reset-password", {
    email,
    code,
    new_password
  });
