import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { forgotPassword } from "../slice";
import { useAppDispatch } from "../../../app/hooks";

export default function VerifyOtpPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const email = state?.email;

  useEffect(() => {
    if (!email) navigate("/login");
  }, [email, navigate]);

  const submit = () => {
    if (code.length !== 4) {
      setError("Please enter the 4-digit code");
      return;
    }

    navigate("/reset-password", { state: { email, code } });
  };

  const resend = async () => {
    if (!email) return;

    setResending(true);
    setError(null);
    setResent(false);

    try {
      await dispatch(forgotPassword(email)).unwrap();
      setResent(true);
    } catch (err: any) {
      setError(err || "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-gray-800">Verify Code</h2>
          <p className="text-sm text-gray-500">
            We’ve sent a 4-digit code to{" "}
            <span className="font-medium text-gray-700">{email}</span>
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 text-center block">
            Enter 4-digit code
          </label>

          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            autoFocus
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ""));
              if (error) setError(null);
            }}
            className={`w-full text-center tracking-widest text-xl rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 ${
              error
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-purple-300"
            }`}
          />

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          {resent && !error && (
            <p className="text-xs text-green-600 text-center">
              A new code has been sent.
            </p>
          )}
        </div>

        {/* Button */}
        <button
          onClick={submit}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg py-2.5 text-sm font-medium transition"
        >
          Continue
        </button>

        {/* Footer */}
        <div className="flex justify-between text-xs">
          <button
            onClick={() => navigate(-1)}
            className="text-purple-600 hover:underline"
          >
            Back
          </button>
          <button
            onClick={resend}
            disabled={resending}
            className="text-purple-600 hover:underline disabled:text-gray-400"
          >
            {resending ? "Resending..." : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
}
