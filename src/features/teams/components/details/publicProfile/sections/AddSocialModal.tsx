import { createPortal } from "react-dom";
import {
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Facebook,
  Ghost,
  Music2,
  MessageCircle,
  Phone,
  Globe,
  Plus,
  Check,
} from "lucide-react";

const ICONS: Record<string, any> = {
  instagram: Instagram,
  linkedin: Linkedin,
  twitter: Twitter,
  youtube: Youtube,
  facebook: Facebook,
  snapchat: Ghost,
  tiktok: Music2,
  whatsapp: MessageCircle,
  phone: Phone,
  website: Globe,
};

export default function AddSocialModal({
  open,
  all,
  selected,
  onClose,
  onToggle,
}: any) {
  if (!open) return null;

  const selectedIds = new Set(selected.map((s: any) => s.id));

  return createPortal(
    <div className="fixed inset-0 z-[999] bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Social</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {all.map((s: any) => {
            const Icon = ICONS[s.id] || Globe;
            const added = selectedIds.has(s.id);

            return (
              <button
                key={s.id}
                onClick={() => onToggle(s)}
                className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition
                ${
                  added
                    ? "bg-purple-50 border-purple-500 text-purple-700"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{s.label}</span>
                </div>

                <div
                  className={`h-7 w-7 flex items-center justify-center rounded-full border ${
                    added
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
    </div>,
    document.body
  );
}
