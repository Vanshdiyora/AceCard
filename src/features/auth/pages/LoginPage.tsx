import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { login } from "../slice";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [form, setForm] = useState({
    email: "admin@acecard.com",
    password: "itshivam",
  });

  const submit = async () => {
    if (!form.email || !form.password) {
      alert("Email and password required");
      return;
    }

    await dispatch(login(form));

    window.location.href = "/super"; // Or wherever you want
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-[400px] p-6 rounded-xl shadow-lg space-y-5">
        <h2 className="text-xl font-semibold text-center">Login</h2>

        {error && (
          <p className="text-red-600 text-center text-sm">{error}</p>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
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
