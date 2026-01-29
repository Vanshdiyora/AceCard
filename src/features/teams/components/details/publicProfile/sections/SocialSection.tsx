import { useEffect, useState } from "react";
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
} from "lucide-react";

/* ================= DEFAULTS ================= */

const DEFAULT_SOCIAL = [
  { id: "instagram", label: "Instagram", url: "", enabled: true },
  { id: "linkedin", label: "LinkedIn", url: "", enabled: true },
  { id: "twitter", label: "Twitter", url: "", enabled: true },
  { id: "youtube", label: "YouTube", url: "", enabled: true },
  { id: "facebook", label: "Facebook", url: "", enabled: true },
];

const ICONS: any = {
  instagram: <Instagram size={18} />,
  linkedin: <Linkedin size={18} />,
  twitter: <Twitter size={18} />,
  youtube: <Youtube size={18} />,
  facebook: <Facebook size={18} />,
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

  /* 🔁 init once from API or defaults */
  useEffect(() => {
    if (items && items.length > 0) {
      setLocal(items);
    } else {
      setLocal(DEFAULT_SOCIAL);
      onChange(DEFAULT_SOCIAL); // inject defaults into config
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (i: number, key: string, val: any) => {
    const copy = [...local];
    copy[i] = { ...copy[i], [key]: val };
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
          {/* ICON */}
          <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center text-orange-400">
            {ICONS[s.id]}
          </div>

          {/* URL */}
          <input
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
            placeholder={`Enter ${s.label} link`}
            value={s.url}
            onChange={(e) => update(i, "url", e.target.value)}
          />

          {/* ENABLE */}
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
