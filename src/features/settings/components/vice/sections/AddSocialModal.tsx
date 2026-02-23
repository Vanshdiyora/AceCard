import { createPortal } from "react-dom";
import { Plus, Check } from "lucide-react";

// 🔥 Official brand logos
import {
  SiInstagram,
  SiLinkedin,
  SiYoutube,
  SiX,
  SiFacebook,
  SiWhatsapp,
  SiSnapchat,
  SiTiktok,
} from "react-icons/si";

import { FiPhone, FiGlobe } from "react-icons/fi";
// 🔥 New Brand Icons
import {
  SiThreads,
  SiTelegram,
  SiCalendly,
  SiAppstore,
  SiGoogleplay,
} from "react-icons/si";

import {
  FiMail,
  FiMapPin,
  FiMessageSquare,
} from "react-icons/fi";

// ---------------- ICON MAP ----------------
const ICONS: Record<string, any> = {
  instagram: SiInstagram,
  linkedin: SiLinkedin,
  twitter: SiX,
  youtube: SiYoutube,
  facebook: SiFacebook,
  snapchat: SiSnapchat,
  tiktok: SiTiktok,
  whatsapp: SiWhatsapp,

  phone: FiPhone,
  website: FiGlobe,

  // 🔥 NEW ONES
  email: FiMail,
  address: FiMapPin,
  threads: SiThreads,
  telegram: SiTelegram,
  sms: FiMessageSquare,
  calendly: SiCalendly,
  appstore: SiAppstore,
  playstore: SiGoogleplay,
};

export default function AddSocialModal({
  open,
  all,
  selected,
  onClose,
  onToggle,
}: any) {
  if (!open) return null;

  const selectedIds = new Set(
    selected.filter((s: any) => s.enabled === true).map((s: any) => s.id)
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center px-3">
      {/* Modal Card */}
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col overflow-hidden">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 pb-2 border-b">
          <h3 className="text-base sm:text-lg font-semibold">Add Social</h3>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* CONTENT */}
        <div className="overflow-y-auto flex-1 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {all.map((s: any) => {
              const Icon = ICONS[s.id] || FiGlobe;
              const added = selectedIds.has(s.id);

              return (
                <button
                  key={s.id}
                  onClick={() => onToggle(s)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition text-sm
  ${added
                      ? "bg-purple-50 border-purple-500 text-purple-700"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                >
                  {/* LEFT SIDE */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="leading-none">
                      {s.label}
                    </span>
                  </div>

                  {/* RIGHT SIDE */}
                  <div
                    className={`h-7 w-7 flex items-center justify-center rounded-full border shrink-0 ${added
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-gray-300"
                      }`}
                  >
                    {added ? <Check size={14} /> : <Plus size={14} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
