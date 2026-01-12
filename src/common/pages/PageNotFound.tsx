import { useNavigate } from "react-router-dom";

export default function PageNotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-6">
      <h1 className="text-5xl font-bold text-purple-700 mb-4">404</h1>
      <p className="text-lg text-gray-600 mb-6">
        Oops! The page you’re looking for doesn’t exist.
      </p>
      <button
        onClick={() => navigate(-1)}
        className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
      >
        Go Back
      </button>
    </div>
  );
}
