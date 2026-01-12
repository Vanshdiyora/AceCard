import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { login } from "../slice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { loading, error, role, token } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    if (!form.email || !form.password) {
      alert("Email and password required");
      return;
    }

    await dispatch(login(form));
  };

  useEffect(() => {
    if (!token || !role) return;

    if (role === "super_admin") {
      navigate("/super");
    } else if (role === "manager" || role === "vendor_admin") {
      navigate("/admin");
    } else {
      navigate("/unauthorized");
    }

  }, [role, token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-[400px] p-6 rounded-xl shadow-lg space-y-5">
        <h2 className="text-xl font-semibold text-center">Login</h2>

        {error && <p className="text-red-600 text-center text-sm">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-purple-600 text-white py-2 rounded-lg"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </div>
    </div>
  );
}
