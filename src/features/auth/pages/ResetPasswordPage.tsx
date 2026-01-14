import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../slice";
import { useAppDispatch } from "../../../app/hooks";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { state } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const email = state?.email;
  const code = state?.code;

  useEffect(() => {
    if (!email || !code) navigate("/login");
  }, [email, code, navigate]);

  const submit = async () => {
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await dispatch(
        resetPassword({ email, code, new_password: newPassword })
      ).unwrap();
      navigate("/login");
    } catch (err: any) {
      setError(err || "Failed to reset password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-gray-800">Set new password</h2>
          <p className="text-sm text-gray-500">
            Choose a strong password for your account.
          </p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">New password</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError(null);
              }}
              className={`w-full rounded-lg border px-3 py-2 pr-10 focus:outline-none focus:ring-2 ${
                error
                  ? "border-red-400 focus:ring-red-200"
                  : "border-gray-300 focus:ring-purple-300"
              }`}
              placeholder="At least 8 characters"
            />

            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute inset-y-0 right-2 flex items-center text-xs text-gray-500 hover:text-gray-700"
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Button */}
        <button
          onClick={submit}
          disabled={submitting}
          className="w-full flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg py-2.5 text-sm font-medium transition"
        >
          {submitting && (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          )}
          {submitting ? "Saving..." : "Reset Password"}
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
