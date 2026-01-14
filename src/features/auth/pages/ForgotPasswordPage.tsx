import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../slice";
import { useAppDispatch } from "../../../app/hooks";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const submit = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await dispatch(forgotPassword(email)).unwrap();
      navigate("/verify-otp", { state: { email } });
    } catch (err: any) {
      setError(err || "Failed to send reset code");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-gray-800">Forgot your password?</h2>
          <p className="text-sm text-gray-500">
            Enter your email and we'll send you a reset code.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">Email address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
              error
                ? "border-red-400 focus:ring-red-200"
                : "border-gray-300 focus:ring-purple-300"
            }`}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Button */}
        <button
          onClick={submit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg py-2.5 text-sm font-medium transition"
        >
          {submitting && (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {submitting ? "Sending code..." : "Send Reset Code"}
        </button>

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={() => navigate("/login")}
            className="text-xs text-purple-600 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
