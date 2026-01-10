interface ErrorAlertProps {
  message?: string | null;
  className?: string;
}

export default function ErrorAlert({ message, className = "" }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      className={`my-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm ${className}`}
      role="alert"
    >
      {message}
    </div>
  );
}
