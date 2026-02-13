import AddSocialModal from "./AddSocialModal";
import { useState, useEffect } from "react";
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
};

// ---------------- AVAILABLE SOCIALS ----------------
const ALL_SOCIALS = [
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
];

export default function SocialSection({ items = [], onChange }: any) {
  const [open, setOpen] = useState(false);

  const toggle = (s: any) => {
    const index = items.findIndex((i: any) => i.id === s.id);

    // If already exists → just toggle enabled
    if (index !== -1) {
      onChange(
        items.map((i: any, idx: number) =>
          idx === index ? { ...i, enabled: !i.enabled } : i
        )
      );
      return;
    }

    // If not exists → add new as enabled
    onChange([...items, { ...s, url: "", enabled: true }]);
  };



  const update = (id: string, val: string) => {
    onChange(items.map((i: any) => (i.id === id ? { ...i, url: val } : i)));
  };

  const remove = (id: string) => {
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
      {/* Selected socials */}
      <div className="space-y-3">
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
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  placeholder={`Enter ${s.label} link`}
                  value={s.url}
                  onChange={(e) => update(s.id, e.target.value)}
                />

                <button
                  onClick={() => remove(s.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
      </div>

      {/* Add button at bottom */}
      <div className="flex justify-left mt-5">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold"
        >
          + Add Social
        </button>
      </div>

      <AddSocialModal
        open={open}
        all={ALL_SOCIALS}
        selected={items}
        onToggle={toggle}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
