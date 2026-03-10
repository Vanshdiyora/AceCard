import { ChevronDown, Trash2 } from "lucide-react";
import { getSocialInputType } from "../VicePublicSetting";

import {
  SiInstagram,
  SiLinkedin,
  SiYoutube,
  SiX,
  SiFacebook,
  SiWhatsapp,
  SiSnapchat,
  SiTiktok,
  SiThreads,
  SiTelegram,
  SiCalendly,
  SiAppstore,
  SiGoogleplay,
} from "react-icons/si";

import { FiPhone, FiGlobe, FiMail, FiMapPin, FiMessageSquare } from "react-icons/fi";

import CommonItemsReorder from "./CommonItemsReorder";

/* ---------------- ICON MAP ---------------- */

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

  email: FiMail,
  address: FiMapPin,
  threads: SiThreads,
  telegram: SiTelegram,
  sms: FiMessageSquare,
  calendly: SiCalendly,
  appstore: SiAppstore,
  playstore: SiGoogleplay,
};

/* ---------------- SOCIALS ---------------- */

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

  { id: "email", label: "Email" },
  { id: "address", label: "Address" },
  { id: "threads", label: "Threads" },
  { id: "telegram", label: "Telegram" },
  { id: "sms", label: "SMS" },
  { id: "calendly", label: "Calendly" },
  { id: "appstore", label: "App Store" },
  { id: "playstore", label: "Play Store" },
];

/* ---------------- COUNTRY CODES ---------------- */
export const COUNTRY_CODES = [
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+1", country: "USA / Canada", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
];

/* ---------------- HELPERS ---------------- */

export const isPhoneType = (platform: string) =>
  ["phone", "whatsapp", "sms"].includes(platform);

/* ---------------- COMPONENT ---------------- */

export default function SocialSection({
  items = [],
  onChange,
  onAddClick,
  disabled = false,
}: any) {

  const normalizeRank = (list: any[]) =>
    list.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const update = (id: string, val: string) => {
    if (disabled) return;

    const updated = items.map((i: any) =>
      i.id === id || i.platform === id ? { ...i, url: val } : i
    );

    onChange(normalizeRank(updated));
  };

  const updateCountryCode = (id: string, code: string) => {
    if (disabled) return;

    const updated = items.map((i: any) =>
      i.id === id ? { ...i, country_code: code } : i
    );

    onChange(normalizeRank(updated));
  };

  const remove = (id: string) => {
    if (disabled) return;

    const updated = items.filter(
      (i: any) => i.id !== id && i.platform !== id
    );

    onChange(normalizeRank(updated));
  };

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
            const platform = s.platform || s.id;

            const Icon = ICONS[platform] || FiGlobe;

            const meta = ALL_SOCIALS.find((a) => a.id === platform);

            const label = meta?.label || platform;

            return (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl border bg-white shadow-sm"
              >
                {/* ICON */}
                <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow">
                  <Icon size={18} />
                </div>

                {/* PHONE INPUT WITH COUNTRY CODE */}
                {isPhoneType(platform) ? (
                  <div className="flex flex-1 border rounded-lg overflow-hidden">

                    <CountryCodeDropdown
                      value={s.country_code || "+91"}
                      disabled={disabled}
                      onChange={(code) => updateCountryCode(s.id, code)}
                    />

                    <input
                      disabled={disabled}
                      type="tel"
                      inputMode="tel"
                      placeholder="2345678900"
                      className="flex-1 px-3 py-2 text-sm outline-none"
                      value={s.url}
                      onChange={(e) =>
                        update(s.id, e.target.value)
                      }
                    />
                  </div>
                ) : (
                  /* NORMAL INPUT */
                  <input
                    disabled={disabled}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm ${disabled
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : ""
                      }`}
                    placeholder={
                      getSocialInputType(platform) === "email"
                        ? "e.g. hello@example.com"
                        : getSocialInputType(platform) === "text"
                          ? "Enter address"
                          : `Enter ${label} link`
                    }
                    type={
                      getSocialInputType(platform) === "email"
                        ? "email"
                        : "text"
                    }
                    value={s.url}
                    onChange={(e) =>
                      update(s.id, e.target.value)
                    }
                  />
                )}

                {/* DELETE */}
                <button
                  disabled={disabled}
                  onClick={() => remove(s.id)}
                  className={`${disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-red-500 hover:text-red-700"
                    }`}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          }}
        />
      </div>

      {/* ADD BUTTON */}

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
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
export function CountryCodeDropdown({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<any>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current =
    COUNTRY_CODES.find((c) => c.code === value) || COUNTRY_CODES[0];

  const openDropdown = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();

    setCoords({
      top: rect.bottom + 4,
      left: rect.left,
      width: 120,
    });

    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        buttonRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && openDropdown()}
        className="flex items-center gap-1 px-3 bg-gray-100 text-sm min-w-20"
      >
        {current.code}

        <ChevronDown size={14} />
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 9999,
            }}
            className="bg-white border rounded-xl shadow-xl max-h-60 overflow-auto"
          >
            {COUNTRY_CODES.map((c) => (
              <button
                key={c.code}
                onClick={() => {
                  onChange(c.code);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${value === c.code ? "bg-purple-100 font-semibold" : ""
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span>{c.country}</span>
                </div>
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}