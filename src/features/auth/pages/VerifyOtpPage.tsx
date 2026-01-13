import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosClient from "../../../services/axiosClient";

export default function VerifyOtpPage() {
  const [otp, setOtp] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();

  const email = state?.email;

  if (!email) navigate("/login");

  const submit = async () => {
    if (otp.length !== 4) return alert("Enter 4 digit OTP");

    try {
      await axiosClient.post("/auth/verify-otp", { email, otp });
      navigate("/reset-password", { state: { email, otp } });
    } catch {
      alert("Invalid OTP");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-[400px] p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold text-center">Verify OTP</h2>

        <input
          type="text"
          maxLength={4}
          inputMode="numeric"
          className="w-full text-center text-xl tracking-widest border rounded-lg p-2"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
        />

        <button
          onClick={submit}
          className="w-full bg-purple-600 text-white py-2 rounded-lg"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
}
