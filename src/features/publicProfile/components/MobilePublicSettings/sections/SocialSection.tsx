import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { createPortal } from "react-dom";
import AddSocialModal from "./AddSocialModal";

// Icons
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

/* ================= ICON MAP ================= */

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

/* ================= VALIDATION ================= */

export function hasEmptySocialLink(items: any[]) {
  return items.some(
    (i) => i.enabled === true && (!i.url || i.url.trim() === "")
  );
}

/* ================= MAIN ================= */

export default function SocialSection({
  items = [],
  onChange,
  locked,
  autoOpen = false, // NEW PROP
}: any) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const enabled = items.filter((i: any) => i.enabled === true);
  const isAnyOpen = pickerOpen || formOpen;

  useEffect(() => {
    if (autoOpen) {
      setPickerOpen(true);
    }
  }, [autoOpen]);

  /* ================= MUTATIONS ================= */

  const toggle = (s: any) => {
    if (locked) return;

    onChange((prev: any[]) => {
      const idx = prev.findIndex((i) => i.id === s.id);

      if (idx !== -1) {
        return prev.map((i, index) =>
          index === idx ? { ...i, enabled: !i.enabled } : i
        );
      }

      return [...prev, { ...s, url: "", enabled: true }];
    });
  };

  const update = (id: string, val: string) => {
    onChange((prev: any[]) =>
      prev.map((i) => (i.id === id ? { ...i, url: val } : i))
    );
  };

  const remove = (id: string) => {
    onChange((prev: any[]) => prev.filter((i) => i.id !== id));
  };

  /* ================= LOCK SCROLL ================= */

  useEffect(() => {
    if (!isAnyOpen) {
      document.body.style.cssText = "";
      return;
    }

    const y = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.cssText = "";
      window.scrollTo(0, y);
    };
  }, [isAnyOpen]);

  return (
    <>
      {/* ADD BUTTON */}
      <button
        disabled={locked}
        onClick={() => {
          if (locked) return;
          setFormOpen(false);
          setPickerOpen(true);
        }}
        className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold ${
          locked
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-purple-600 text-white"
        }`}
      >
        + Add Social
      </button>

      {/* STEP 1 — PICK SOCIAL */}
      <AddSocialModal
        open={pickerOpen}
        all={ALL_SOCIALS}
        selected={items}
        onToggle={toggle}
        onCancel={() => setPickerOpen(false)}
        onContinue={() => {
          setPickerOpen(false);
          if (enabled.length > 0) setFormOpen(true);
        }}
      />

      {/* STEP 2 — ADD LINKS */}
      <SocialLinksModal
        open={formOpen}
        items={enabled}
        onUpdate={update}
        onRemove={remove}
        onClose={() => setFormOpen(false)}
      />
    </>
  );
}

/* ================= LINKS MODAL ================= */

function SocialLinksModal({
  open,
  items,
  onClose,
  onUpdate,
  onRemove,
}: any) {
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleDone = () => {
    if (hasEmptySocialLink(items)) {
      setError("Please fill in all social links before saving.");
      return;
    }

    setError(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center px-3">
      <div className="bg-white w-full max-w-md rounded-2xl p-4 shadow-xl max-h-[85vh] flex flex-col">

        <h3 className="text-base font-semibold mb-3">
          Add your links
        </h3>

        {error && (
          <p className="text-sm text-red-600 mb-2">
            {error}
          </p>
        )}

        <div className="flex-1 overflow-y-auto space-y-3">
          {items.map((s: any) => {
            const Icon = ICONS[s.id] || FiGlobe;

            return (
              <div
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-xl border bg-white shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center text-white">
                  <Icon size={18} />
                </div>

                <input
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  placeholder={`Enter ${s.label} link`}
                  value={s.url}
                  onChange={(e) => {
                    setError(null);
                    onUpdate(s.id, e.target.value);
                  }}
                />

                <button
                  onClick={() => {
                    setError(null);
                    onRemove(s.id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleDone}
          className="mt-4 w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:opacity-90"
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}
