import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../../../app/hooks";
import {
  savePublicProfile,
  previewPublicProfile,
} from "../../../../publicProfile/slice";
import { ProColorPicker } from "../../../../../common/utils/ColorPicker";
import { createPortal } from "react-dom";

/* =====================================================
   TEAM MEMBER PUBLIC PROFILE EDITOR (SINGLE FILE)
===================================================== */

type AnyObj = Record<string, any>;

export default function TeamMemberPublicProfileTab({
  // member,
  publicProfile,
}: {
  member: any;
  publicProfile: any;
}) {
  const dispatch = useAppDispatch();
  const [config, setConfig] = useState<AnyObj | null>(null);

  useEffect(() => {
    if (!config && publicProfile?.configuration) {
      const clone = JSON.parse(
        JSON.stringify(publicProfile.configuration)
      );
      setConfig(clone);
    }
  }, [publicProfile, config]);

  if (!config)
    return <p className="text-gray-400">Loading profile config...</p>;

  /* 🔁 Helper: update local + preview */
  const update = (next: AnyObj) => {
    setConfig(next);
    dispatch(previewPublicProfile(next));
  };

  const save = () => {
    dispatch(savePublicProfile({ config }));
  };

  return (
    <div className="mt-6 space-y-10 pb-10">

      {/* PROFILE */}
      <Card title="Profile" desc="Basic information shown on the card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["name", "role"] as const).map((k) => (
            <Input
              key={k}
              label={k}
              value={config.profile?.[k] || ""}
              onChange={(v: string) =>
                update({
                  ...config,
                  profile: { ...config.profile, [k]: v },
                })
              }
            />
          ))}
        </div>

        <Input
          label="description"
          textarea
          value={config.profile?.description || ""}
          onChange={(v: string) =>
            update({
              ...config,
              profile: { ...config.profile, description: v },
            })
          }
        />
      </Card>

      {/* THEME */}
      <Card title="Theme" desc="Colors used across the profile">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {(
            [
              "primary_color",
              "background_color",
              "card_color",
              "text_color",
              "accent_color",
            ] as const
          ).map((k) => (
           <ColorPickerField
    key={k}
    label={k.replace("_", " ")}
    value={config.theme?.[k] || "#4D00D4"}
    onChange={(v) =>
      update({
        ...config,
        theme: { ...config.theme, [k]: v },
      })
    }
  />

          ))}
        </div>
      </Card>

      {/* BANNER */}
      <Card title="Banner" desc="Top banner CTA section">
        <Toggle
          label="Enable banner"
          value={!!config.banner?.enabled}
          onChange={(v: boolean) =>
            update({
              ...config,
              banner: { ...config.banner, enabled: v },
            })
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(["image_url", "cta_text", "cta_url"] as const).map((k) => (
            <Input
              key={k}
              label={k.replace("_", " ")}
              value={config.banner?.[k] || ""}
              onChange={(v: string) =>
                update({
                  ...config,
                  banner: { ...config.banner, [k]: v },
                })
              }
            />
          ))}
        </div>
      </Card>

      {/* SOCIAL LINKS */}
      <Card title="Social Links" desc="Manage visible social buttons">
        <div className="space-y-4">
          {config.social_links?.items?.map(
            (item: AnyObj, i: number) => (
              <div
                key={i}
                className="rounded-xl border border-white/10 bg-white/40 backdrop-blur p-4 space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Label"
                    value={item.label}
                    onChange={(v: string) => {
                      const items = [...config.social_links.items];
                      items[i] = { ...items[i], label: v };
                      update({
                        ...config,
                        social_links: { ...config.social_links, items },
                      });
                    }}
                  />
                  <Input
                    label="URL"
                    value={item.url}
                    onChange={(v: string) => {
                      const items = [...config.social_links.items];
                      items[i] = { ...items[i], url: v };
                      update({
                        ...config,
                        social_links: { ...config.social_links, items },
                      });
                    }}
                  />
                </div>

                <Toggle
                  label="Enabled"
                  value={item.enabled}
                  onChange={(v: boolean) => {
                    const items = [...config.social_links.items];
                    items[i] = { ...items[i], enabled: v };
                    update({
                      ...config,
                      social_links: { ...config.social_links, items },
                    });
                  }}
                />
              </div>
            )
          )}
        </div>
      </Card>

      {/* SECTIONS */}
      <Card title="Sections" desc="Control layout order & visibility">
        <div className="space-y-3">
          {config.sections?.map((s: AnyObj, i: number) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-white/10 bg-white/30 backdrop-blur p-3"
            >
              <span className="font-medium capitalize">{s.type}</span>

              <div className="flex items-center gap-4">
                <input
                  type="number"
                  className="w-16 rounded-md border px-2 py-1"
                  value={s.rank}
                  onChange={(e) => {
                    const arr = [...config.sections];
                    arr[i] = { ...arr[i], rank: Number(e.target.value) };
                    update({ ...config, sections: arr });
                  }}
                />

                <Toggle
                  label=""
                  value={s.enabled}
                  onChange={(v: boolean) => {
                    const arr = [...config.sections];
                    arr[i] = { ...arr[i], enabled: v };
                    update({ ...config, sections: arr });
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* SAVE */}
      <button
        onClick={save}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg hover:opacity-90 transition"
      >
        Save Public Profile
      </button>
    </div>
  );
}

/* =====================================================
   UI COMPONENTS
===================================================== */

function Card({
  title,
  desc,
  children,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur shadow-xl p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      {children}
    </div>
  );
}


function Input({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs uppercase text-gray-500">{label}</label>
      {textarea ? (
        <textarea
          className="w-full rounded-lg border px-3 py-2"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <span className="text-sm">{label}</span>
      <input
        type="checkbox"
        className="sr-only"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={`w-10 h-5 rounded-full transition ${
          value ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full shadow transform transition ${
            value ? "translate-x-5" : "translate-x-1"
          } mt-0.5`}
        />
      </div>
    </label>
  );
}

function ColorPickerField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPos({
            top: rect.bottom + window.scrollY + 8,
            left: rect.left + window.scrollX,
          });
          setOpen((v) => !v);
        }}
        className="flex items-center justify-between w-full rounded-lg border p-3 hover:bg-gray-50"
      >
        <span className="text-sm capitalize">{label}</span>
        <span
          className="w-8 h-5 rounded border"
          style={{ background: value }}
        />
      </button>

      {open &&
        createPortal(
          <>
            {/* overlay */}
            <div
              className="fixed inset-0 z-[9998]"
              onClick={() => setOpen(false)}
            />

            {/* floating picker */}
            <div
              className="fixed z-[9999]"
              style={{ top: pos.top, left: pos.left }}
            >
              <ProColorPicker
                value={value}
                onChange={(v) => {
                  onChange(v);
                }}
              />
            </div>
          </>,
          document.body
        )}
    </div>
  );
}
