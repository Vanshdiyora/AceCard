import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../../services/axiosClient";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const email = state?.email;
  const otp = state?.otp;

  if (!email || !otp) navigate("/login");

  const submit = async () => {
    if (password.length < 6) return alert("Password too short");

    try {
      await axiosClient.post("/auth/reset-password", {
        email,
        otp,
        password,
      });
      alert("Password updated successfully");
      navigate("/login");
    } catch {
      alert("Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-[400px] p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold text-center">Reset Password</h2>

        <input
          type="password"
          placeholder="Enter new password"
          className="w-full border rounded-lg p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full bg-purple-600 text-white py-2 rounded-lg"
        >
          Reset Password
        </button>
      </div>
    </div>
  );
}
