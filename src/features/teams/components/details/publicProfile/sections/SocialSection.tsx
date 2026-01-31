import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  MessageCircle,
  Phone,
  Globe,
  Ghost,     // 👻 Snapchat
  Music2,    // 🎵 TikTok
} from "lucide-react";


/* ================= DEFAULTS (MATCH API) ================= */

const DEFAULT_SOCIAL = [
  { id: "instagram", label: "Instagram", url: "", enabled: true },
  { id: "linkedin", label: "LinkedIn", url: "", enabled: true },
  { id: "twitter", label: "Twitter", url: "", enabled: true },
  { id: "youtube", label: "YouTube", url: "", enabled: true },
  { id: "facebook", label: "Facebook", url: "", enabled: true },

  // 🔥 NEW
  { id: "snapchat", label: "Snapchat", url: "", enabled: false },
  { id: "tiktok", label: "Tiktok", url: "", enabled: false },

  { id: "whatsapp", label: "Whatsapp", url: "", enabled: false },
  { id: "phone", label: "Call Me", url: "", enabled: false },
  { id: "website", label: "Personal Website", url: "", enabled: false },
];

/* ================= ICON MAP ================= */

const ICONS: Record<string, ReactNode> = {
  instagram: <Instagram size={18} />,
  linkedin: <Linkedin size={18} />,
  twitter: <Twitter size={18} />,
  youtube: <Youtube size={18} />,
  facebook: <Facebook size={18} />,

  // 🔥 NEW
  snapchat: <Ghost size={18} />,
  tiktok: <Music2 size={18} />,

  whatsapp: <MessageCircle size={18} />,
  phone: <Phone size={18} />,
  website: <Globe size={18} />,
};


/* ================= HELPERS ================= */

const normalizeUrl = (value: string) => {
  if (!value) return value;
  return value;
};

/* ================= COMPONENT ================= */

export default function SocialSection({
  items,
  onChange,
}: {
  items?: any[] | null;
  onChange: (items: any[]) => void;
}) {
  const [local, setLocal] = useState<any[]>([]);

  useEffect(() => {
    if (items && items.length > 0) {
      setLocal(items);
    } else {
      setLocal(DEFAULT_SOCIAL);
      onChange(DEFAULT_SOCIAL);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (i: number, key: string, val: any) => {
    const copy = [...local];
    copy[i] = {
      ...copy[i],
      [key]: key === "url" ? normalizeUrl(val) : val,
    };
    setLocal(copy);
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      {local.map((s, i) => (
        <div
          key={s.id}
          className="flex items-center gap-3 p-3 rounded-xl border bg-white shadow-sm"
        >
          <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow">
            {ICONS[s.id]}
          </div>

          <input
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
            placeholder={
              s.id === "whatsapp"
                ? "Enter WhatsApp number"
                : s.id === "phone"
                  ? "Enter phone number"
                  : s.id === "website"
                    ? "Enter website"
                    : `Enter ${s.label} link`
            }
            value={s.url}
            onChange={(e) => update(i, "url", e.target.value)}
          />

          <input
            type="checkbox"
            checked={s.enabled}
            onChange={(e) => update(i, "enabled", e.target.checked)}
          />
        </div>
      ))}
    </div>
  );
}
