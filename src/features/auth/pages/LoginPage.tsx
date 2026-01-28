import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { login } from "../slice";
import BlockerLoader from "../../../common/ui/BlockingLoader";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error, role, token, subdomain } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({ email: "", password: "" });
  const [show, setShow] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async () => {
    if (!form.email || !form.password) {
      setLocalError("Email and password are required");
      return;
    }

    setLocalError(null);
    await dispatch(login(form));
  };

  useEffect(() => {
    if (!token || !role) return;

    if (role === "super_admin") {
      navigate("/super");
    } else if (role === "manager" || role === "vendor_admin") {

      if (subdomain) {
        const currentHost = window.location.hostname;

        if (!currentHost.startsWith(subdomain + ".")) {

           if (currentHost.includes("theacecard.co")) {
             const protocol = window.location.protocol;
             window.location.href = `${protocol}//${subdomain}.theacecard.co/admin`;
             return; 
           }
        }
      }
      navigate("/admin");
    } else {
      navigate("/unauthorized");
    }

  }, [role, token, navigate, subdomain]);

  return (
    <>
      <BlockerLoader show={loading} />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-semibold text-gray-800">Welcome back</h2>
            <p className="text-sm text-gray-500">Sign in to your account</p>
          </div>

          {/* Errors */}
          {(error || localError) && (
            <p className="text-red-500 text-sm text-center">
              {localError || error}
            </p>
          )}

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-lg border px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute inset-y-0 right-2 flex items-center text-xs text-gray-500 hover:text-gray-700"
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          </div>

          {/* Forgot */}
          <div className="text-right">
            <button
              onClick={() => navigate("/forgot-password")}
              className="text-xs text-purple-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg py-2.5 text-sm font-medium transition"
          >
            {loading && (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </>
  );
}
