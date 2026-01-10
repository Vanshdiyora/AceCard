type BrandLoaderProps = {
  size?: number;
  message?: string;
  fullScreen?: boolean;
};

export default function BrandLoader({
  size = 36,
  message,
  fullScreen = false,
}: BrandLoaderProps) {
  const border = Math.max(3, size / 10);

  return (
    <div
      className={`${
        fullScreen
          ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/60"
          : "flex flex-col items-center justify-center"
      }`}
    >
      <div
        className="animate-spin rounded-full border-gray-200"
        style={{
          width: size,
          height: size,
          borderWidth: border,
          borderStyle: "solid",
          borderTopColor: "#2D1A53",
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          borderLeftColor: "transparent",
        }}
      />
      {message && (
        <p className="mt-2 text-sm font-medium" style={{ color: "#2D1A53" }}>
          {message}
        </p>
      )}
    </div>
  );
}
