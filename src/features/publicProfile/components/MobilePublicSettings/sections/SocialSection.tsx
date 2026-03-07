import { useState, useEffect } from "react";
import { Trash2, ArrowLeft } from "lucide-react";
import { createPortal } from "react-dom";
import AddSocialModal from "./AddSocialModal";
import CommonItemsReorder from "../../../../settings/components/vice/sections/CommonItemsReorder";

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
  SiThreads,
  SiTelegram,
  SiAppstore,
  SiGoogleplay,
} from "react-icons/si";

import {
  FiPhone,
  FiGlobe,
  FiMail,
  FiMapPin,
  FiMessageCircle,
} from "react-icons/fi";

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

  email: FiMail,
  address: FiMapPin,
  threads: SiThreads,
  telegram: SiTelegram,
  sms: FiMessageCircle,
  calendly: FiGlobe,
  appstore: SiAppstore,
  playstore: SiGoogleplay,
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
  { id: "email", label: "Email" },
  { id: "address", label: "Address" },
  { id: "threads", label: "Threads" },
  { id: "telegram", label: "Telegram" },
  { id: "sms", label: "SMS" },
  { id: "calendly", label: "Calendly" },
  { id: "appstore", label: "App Store" },
  { id: "playstore", label: "Play Store" },
];

/* ================= VALIDATION ================= */

function isValidUrl(url: string) {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function validateSocialLink(id: string, value: string): string | null {
  if (!value || !value.trim()) return "This field is required.";
  const v = value.trim();

  switch (id) {
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? null
        : "Invalid email address.";

    case "phone":
    case "sms":
      return /^[0-9+\-\s()]{6,}$/.test(v)
        ? null
        : "Invalid phone number.";

    default:
      return isValidUrl(v)
        ? null
        : "Link must start with https:// ";
  }
}

/* ================= RANK HELPER ================= */

const normalizeRank = (items: any[]) =>
  items.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

/* ================= MAIN ================= */

export default function SocialSection({
  items = [],
  onChange,
  locked,
  autoOpen = false,
}: any) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const enabled = items.filter((i: any) => i.enabled === true);
  const isAnyOpen = pickerOpen || formOpen;

  useEffect(() => {
    if (autoOpen) setPickerOpen(true);
  }, [autoOpen]);

  /* ================= MUTATIONS ================= */

  const toggle = (s: any) => {
    if (locked) return;

    onChange((prev: any[]) => {
      const idx = prev.findIndex((i) => i.id === s.id);
      let updated;

      if (idx !== -1) {
        updated = prev.map((i, index) =>
          index === idx ? { ...i, enabled: !i.enabled } : i
        );
      } else {
        updated = [
          ...prev,
          { ...s, url: "", enabled: true, rank: prev.length + 1 },
        ];
      }

      return normalizeRank(updated);
    });
  };

  const update = (id: string, val: string) => {
    onChange((prev: any[]) =>
      normalizeRank(
        prev.map((i) => (i.id === id ? { ...i, url: val } : i))
      )
    );
  };

  const remove = (id: string) => {
    onChange((prev: any[]) =>
      normalizeRank(prev.filter((i) => i.id !== id))
    );
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

      <SocialLinksModal
        open={formOpen}
        items={enabled}
        onBack={() => {
          setFormOpen(false);
          setPickerOpen(true);
        }}
        onCloseAll={() => {
          setFormOpen(false);
          setPickerOpen(false);
        }}
        onUpdate={update}
        onRemove={remove}
        onReorder={(newItems: any[]) => {
          onChange(normalizeRank(newItems));
        }}
      />
    </>
  );
}

/* ================= LINKS MODAL ================= */

function SocialLinksModal({
  open,
  items,
  onBack,
  onCloseAll,
  onUpdate,
  onRemove,
  onReorder,
}: any) {
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleDone = () => {
    for (const item of items) {
      const validationError = validateSocialLink(item.id, item.url);
      if (validationError) {
        setError(`${item.label}: ${validationError}`);
        return;
      }
    }
    setError(null);
    onCloseAll();
  };

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center px-3">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <button
            onClick={onBack}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-purple-600"
          >
            <ArrowLeft size={18} />
          </button>

          <h3 className="text-base font-semibold">Add your links</h3>

          <button
            onClick={onCloseAll}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          <CommonItemsReorder
            items={[...items].sort((a, b) => a.rank - b.rank)}
            onChange={onReorder}
            renderItem={(s: any) => {
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
            }}
          />
        </div>

        <div className="p-4 border-t">
          <button
            onClick={handleDone}
            className="w-full py-3 rounded-xl bg-purple-600 text-white font-semibold hover:opacity-90"
          >
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}