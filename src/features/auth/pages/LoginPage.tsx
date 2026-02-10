import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { login } from "../slice";
import BlockerLoader from "../../../common/ui/BlockingLoader";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const getRedirectUrl = (subdomain: string | null, route = "") => {
    const { protocol, hostname, port } = window.location;

    // ▲ VERCEL PREVIEW / PROD DOMAINS
    if (hostname.endsWith(".vercel.app")) {
      return `${protocol}//${hostname}/${route}`;
    }

    // 🌍 CUSTOM DOMAIN (e.g. zomato.com)
    const parts = hostname.split(".");
    const baseDomain =
      parts.length > 2 ? parts.slice(1).join(".") : hostname;

    return `${protocol}//${subdomain}.${baseDomain}${port ? `:${port}` : ""}/${route}`;
  };


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
    if (!token || !role) return; // ⛔ wait until auth is ready

    let redirectUrl = "";

    if (role === "manager" || role === "vendor_admin") {
      redirectUrl = getRedirectUrl(subdomain, "admin");
    } else if (role === "super_admin") {
      redirectUrl = "super";
    } else if (role === "sales_rep") {
      redirectUrl = getRedirectUrl(subdomain, "profile-settings");
    } else {
      navigate("/unauthorized");
      return;
    }

    // 🔥 full page redirect (required for subdomains)
    window.location.href = redirectUrl;
  }, [token, role, navigate]);

  return (
    <>
      <BlockerLoader show={loading} />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100 px-4 sm:px-6">
        <div className="w-full max-w-md sm:max-w-lg bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-5">

          {/* HEADER */}
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Welcome back
            </h2>
            <p className="text-xs sm:text-sm text-gray-500">
              Sign in to your account
            </p>
          </div>

          {(error || localError) && (
            <p className="text-red-500 text-xs sm:text-sm text-center">
              {localError || error}
            </p>
          )}

          {/* ✅ FORM (FIX) */}
          <form
            onSubmit={(e) => {
              e.preventDefault(); // 🚫 stops refresh
              submit();
            }}
            className="space-y-3 sm:space-y-4"
          >
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="you@example.com"
                className="w-full rounded-lg border px-3 py-3 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
            </div>

            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-lg border px-3 py-3 sm:py-2 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute inset-y-0 right-3 flex items-center text-xs sm:text-sm text-gray-500"
                >
                  {show ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* FORGOT */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs sm:text-sm text-purple-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-11 flex justify-center items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm sm:text-base font-medium transition"
            >
              {loading && (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
