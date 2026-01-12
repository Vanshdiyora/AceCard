import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../app/hooks";
import { logout } from "../slice";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow text-center space-y-4 w-[360px]">
        <h2 className="text-xl font-semibold text-red-600">Unauthorized</h2>

        <p className="text-sm text-gray-600">
          You do not have permission to access this page.
        </p>

        <div className="flex flex-col gap-2">
          {/* Back to login */}
          <button
            onClick={() => {
              dispatch(logout());
              navigate("/login");
            }}
            className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
