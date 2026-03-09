import { Trash2 } from "lucide-react";
import { getSocialInputType } from "../VicePublicSetting";
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

import CommonItemsReorder from "./CommonItemsReorder";
export default function SocialSection({
  items = [],
  onChange,
  onAddClick,
  disabled = false,
}: any) {

  const update = (id: string, val: string) => {
    if (disabled) return;
    const updated = items.map((i: any) =>
      (i.id === id || i.platform === id) ? { ...i, url: val } : i  // 👈
    );
    onChange(normalizeRank(updated));
  };

  const remove = (id: string) => {
    if (disabled) return;
    const updated = items.filter((i: any) => i.id !== id && i.platform !== id);  // 👈
    onChange(normalizeRank(updated));
  };

  const normalizeRank = (list: any[]) =>
    list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  return (
    <>
      <div
        className={`space-y-3 ${disabled ? "opacity-60 pointer-events-none" : ""
          }`}
      >
        <CommonItemsReorder
          items={items
            .filter((s: any) => s.enabled === true)
            .sort((a: any, b: any) => a.rank - b.rank)}
          disabled={disabled}
          onChange={(reordered: any[]) => {
            onChange(normalizeRank(reordered));
          }}
          renderItem={(s: any) => {
            const platform = s.platform || s.id;           // 👈 support both
            const Icon = ICONS[platform] || FiGlobe;
            const meta = ALL_SOCIALS.find((a) => a.id === platform);  // 👈 lookup label
            const label = meta?.label || platform;

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
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : ""}`}
                  placeholder={
                    getSocialInputType(platform) === "phone" ? "e.g. 2345678900" :
                      getSocialInputType(platform) === "email" ? "e.g. hello@example.com" :
                        getSocialInputType(platform) === "text" ? "Enter address" :
                          `Enter ${label} link`
                  }
                  type={
                    getSocialInputType(platform) === "phone" ? "tel" :
                      getSocialInputType(platform) === "email" ? "email" :
                        "text"
                  }
                  inputMode={
                    getSocialInputType(platform) === "phone" ? "tel" :
                      getSocialInputType(platform) === "email" ? "email" :
                        "url"
                  }
                  value={s.url}
                  onChange={(e) => update(s.id, e.target.value)}
                />

                <button
                  disabled={disabled}
                  onClick={() => remove(s.id)}
                  className={`${disabled ? "text-gray-300 cursor-not-allowed" : "text-red-500 hover:text-red-700"
                    }`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          }}
        />
      </div>

      {/* Add button */}
      <div className="flex justify-left mt-5">
        <button
          disabled={disabled}
          onClick={() => !disabled && onAddClick?.()}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${disabled
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