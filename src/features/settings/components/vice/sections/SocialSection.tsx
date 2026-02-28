import { useEffect } from "react";
import { Trash2 } from "lucide-react";

// 🔥 Latest official brand icons
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

  // existing
  phone: FiPhone,
  website: FiGlobe,

  // 🔥 NEW
  email: FiMail,
  address: FiMapPin,
  threads: SiThreads,
  telegram: SiTelegram,
  sms: FiMessageSquare,
  calendly: SiCalendly,
  appstore: SiAppstore,
  playstore: SiGoogleplay,
};
// ---------------- AVAILABLE SOCIALS ----------------
export const ALL_SOCIALS = [
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "X (Twitter)" },
  { id: "youtube", label: "YouTube" },
  { id: "facebook", label: "Facebook" },
  { id: "snapchat", label: "Snapchat" },
  { id: "tiktok", label: "TikTok" },
  { id: "whatsapp", label: "WhatsApp" },

  { id: "phone", label: "Phone" },
  { id: "website", label: "Website" },

  // 🔥 NEW ONES
  { id: "email", label: "Email" },
  { id: "address", label: "Address" },
  { id: "threads", label: "Threads" },
  { id: "telegram", label: "Telegram" },
  { id: "sms", label: "SMS" },
  { id: "calendly", label: "Calendly" },
  { id: "appstore", label: "App Store" },
  { id: "playstore", label: "Play Store" },
];
export default function SocialSection({
  items = [],
  onChange,
  onAddClick,
  disabled = false,
}: any) {
  
const update = (id: string, val: string) => {
  if (disabled) return;
  onChange(items.map((i: any) => (i.id === id ? { ...i, url: val } : i)));
};

const remove = (id: string) => {
  if (disabled) return;
  onChange(items.filter((i: any) => i.id !== id));
};
  // 🔒 lock background scroll
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
  <>
  <div
    className={`space-y-3 ${
      disabled ? "opacity-60 pointer-events-none" : ""
    }`}
  >
    {items
      .filter((s: any) => s.enabled === true)
      .map((s: any) => {
        const Icon = ICONS[s.id] || FiGlobe;

        return (
          <div
            key={s.id}
            className="flex items-center gap-3 p-3 rounded-xl border bg-white shadow-sm"
          >
            <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow">
              <Icon size={18} />
            </div>

            <input
              disabled={disabled}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm ${
                disabled
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : ""
              }`}
              placeholder={`Enter ${s.label} link`}
              value={s.url}
              onChange={(e) => update(s.id, e.target.value)}
            />

            <button
              disabled={disabled}
              onClick={() => remove(s.id)}
              className={`${
                disabled
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-red-500 hover:text-red-700"
              }`}
            >
              <Trash2 size={18} />
            </button>
          </div>
        );
      })}
  </div>

  {/* Add button */}
  <div className="flex justify-left mt-5">
    <button
      disabled={disabled}
      onClick={() => !disabled && onAddClick?.()}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-purple-600 text-white hover:opacity-90"
      }`}
    >
      + Add Social
    </button>
  </div>
</>
  );
}
