interface ErrorAlertProps {
  message?: string | null;
  className?: string;
}

export default function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  if (!message) return null;

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div
      className={`my-4 flex items-center justify-between rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm ${className}`}
      role="alert"
    >
      <span>{message}</span>

      <button
        onClick={handleRetry}
        className="ml-4 rounded-md bg-red-600 text-white px-3 py-1 text-xs hover:bg-red-700 transition"
      >
        Retry
      </button>
    </div>
  );
}