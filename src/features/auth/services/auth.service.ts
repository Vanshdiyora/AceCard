import axiosClient from "../../../services/axiosClient";

export interface LoginPayload {
  email: string;
  password: string;
}

export const loginRequest = async (payload: LoginPayload) => {
  const res = await axiosClient.post("/auth/login", payload);
  return res.data; // { token: "JWT_TOKEN" }
};
