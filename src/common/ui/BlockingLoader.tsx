import BrandLoader from "./BrandLoader";

export default function BlockingLoader({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center">
      <BrandLoader />
    </div>
  );
}
