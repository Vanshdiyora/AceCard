import { useEffect } from "react";
import BrandLoader from "./BrandLoader";

export default function BlockingLoader({ show }: { show: boolean }) {
  useEffect(() => {
    if (show) {
      document.documentElement.style.overflow = "hidden"; // html
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center">
      <BrandLoader />
    </div>
  );
}
