import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import YoutubeSection from "./sections/YoutubeSection";
import {
  savePublicProfile,
  savePublicProfileByUsername,
} from "../../../../publicProfile/slice";
import ProductsReorder from "./sections/ProductsReorder";
import LinksFilesSection from "./sections/LinksFilesSection";
import SectionsReorder from "./sections/SectionsReorder";
import { normalizeProfile } from "../../../../publicProfile/utils/normalizeProfile";
import { ProColorPicker } from "../../../../../common/utils/ColorPicker";
import DynamicForm, { type FieldConfig } from "../../../../../common/ui/DynamicForm";
import MeetingSection from "./sections/MeetingSections";
import ProfileSection from "./sections/ProfileSection";
import SocialSection from "./sections/SocialSection";
import { fetchProducts } from "../../../../products/slice";
import ResultModal from "../../../../../common/ui/ResultModal";

const THEME_COLOR_KEYS = [
  "primary_color",
  "background_color",
  "card_color",
  "text_color",
  "accent_color",
] as const;

/* ================= TYPES ================= */
export type LockMode = "global" | "individual" | "locked";

export interface LockMeta {
  locked: boolean;          // is this section locked?
  lock_mode?: LockMode;    // who controls it
}

interface ProfileConfig {
  avatar_url: string;
  cover_url: string;
  description: string;
}

export interface ProductRef {
  id: string | number;
  name?: string;
  price?: string;
  image_url?: string;
  rank: number;
  enabled: boolean;
}

export interface SectionItem {
  id: string;
  type: string;
  rank: number;
  enabled: boolean;

  locked: boolean;
  lock_mode?: LockMode; // 👈 who locked it
}

export interface ThemeConfig extends LockMeta {
  primary_color: string;
  background_color: string;
  card_color: string;
  text_color: string;
  accent_color: string;
}

export interface BannerConfig extends LockMeta {
  enabled: boolean;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
}

export interface ProductsConfig extends LockMeta {
  items: ProductRef[];
}

export interface MeetingConfig extends LockMeta {
  enabled: boolean;
  type: string;
  meeting_url: string;
  button_text: string;
}

interface PublicProfileConfig {
  profile: ProfileConfig;

  theme: ThemeConfig;

  banner: BannerConfig;

  meeting: MeetingConfig;

  social_links: {
    items: any[];
  };

  products: ProductsConfig;

  youtube: LockMeta & { items: any[] };
  links_files: LockMeta & { items: any[] };


  sections: SectionItem[];
}

/* ================= COMPONENT ================= */

export default function TeamMemberPublicProfileTab({
  onLiveChange,
  useSelfApi = false,   // 👈 default = admin mode
  showLockable = false,  // 👈 new prop for lockable visibility
}: {
  onLiveChange?: (cfg: any) => void;
  useSelfApi?: boolean;
  showLockable?: boolean;
}) {

  const dispatch = useAppDispatch();
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const { data: publicProfile, loading } = useAppSelector(
    (s) => s.publicProfile
  );
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});

  const { products, loading: productsLoading } = useAppSelector(
    (s) => s.products
  );

  const [config, setConfig] = useState<PublicProfileConfig | null>(null);

  /* ---------- Product search state ---------- */
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [hasNextProducts, setHasNextProducts] = useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

  /* ---------- Options cache ---------- */
  const [productOptions, setProductOptions] = useState<
    { label: string; value: number }[]
  >([]);

  /* ================= INIT ================= */

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, page_size: 10, mode: "paginate" }))
      .unwrap()
      .then((r) => setHasNextProducts(Boolean(r.meta?.has_next)));
  }, [dispatch]);

  /* ================= NORMALIZE ================= */

  useEffect(() => {
    if (publicProfile) {
      const normalized = normalizeProfile(publicProfile) as PublicProfileConfig;
      setConfig(normalized);
    }
  }, [publicProfile]);


  /* ================= CACHE OPTIONS ================= */

  useEffect(() => {
    setProductOptions((prev) => {
      const map = new Map(prev.map((o) => [o.value, o]));
      products.forEach((p) =>
        map.set(p.id, { label: p.name, value: p.id })
      );
      return Array.from(map.values());
    });
  }, [products]);

  const uploadBannerImage = async (file: File) => {
    const res = await uploadImage(file);
    update({
      ...config!,
      banner: {
        ...config!.banner,
        image_url: res.data.url, // 👈 API response
      },
    });
  };

  /* ================= SEARCH ================= */

  useEffect(() => {
    if (!productSearch.trim()) return;
    const t = setTimeout(() => {
      setProductPage(1);
      dispatch(
        fetchProducts({
          page: 1,
          page_size: 10,
          search: productSearch,
          mode: "paginate",
        })
      );
    }, 400);
    return () => clearTimeout(t);
  }, [productSearch, dispatch]);

  /* ================= LOAD MORE ================= */
  const mergeSelectedProducts = (
    selectedIds: (string | number)[],
    allProducts: any[],
    existing: any[]
  ) => {
    return selectedIds.map((id, index) => {
      const prev = existing.find((p) => p.id === id);
      const fromApi = allProducts.find((p) => p.id === id);

      return {
        id,
        name: prev?.name || fromApi?.name || "",
        price: prev?.price || fromApi?.price || "",
        image_url: prev?.image_url || fromApi?.image_url || "",
        rank: index + 1,
        enabled: prev?.enabled ?? true,
      };
    });
  };

  const loadMoreProducts = async () => {
    if (!hasNextProducts || loadingMoreProducts) return;
    setLoadingMoreProducts(true);

    const r = await dispatch(
      fetchProducts({
        page: productPage + 1,
        page_size: 10,
        search: productSearch || undefined,
        mode: "infinite",
      })
    ).unwrap();

    setProductPage((p) => p + 1);
    setHasNextProducts(Boolean(r.meta?.has_next));
    setLoadingMoreProducts(false);
  };


  /* ================= LOOKUP FOR PREVIEW ================= */

  // useEffect(() => {
  //   const ids = config?.products?.items.map((p) => p.id) ?? [];
  //   if (ids.length) dispatch(lookupProducts(ids));
  // }, [config?.products?.items, dispatch]);

  /* ================= HELPERS ================= */

  const update = (next: PublicProfileConfig) => {
    setConfig(next);
    onLiveChange?.(next); // 👈 push to preview
  };

  const save = async () => {
    if (!config) return;

    const withLock = <T extends { locked: boolean; lock_mode?: LockMode }>(v: T) =>
      showLockable
        ? { ...v, locked: v.locked, lock_mode: v.lock_mode }
        : { ...v, locked: v.locked };

    const payload = {
      profile: config.profile,

      theme: withLock(config.theme),

      banner: withLock(config.banner),

      meeting: withLock(config.meeting),

      social_links: { items: config.social_links.items },

      products: {
        ...withLock(config.products),
        items: config.products.items,
      },

      youtube: showLockable
        ? { items: config.youtube.items, locked: config.youtube.locked, lock_mode: config.youtube.lock_mode }
        : { items: config.youtube.items },

      links_files: showLockable
        ? { items: config.links_files.items, locked: config.links_files.locked, lock_mode: config.links_files.lock_mode }
        : { items: config.links_files.items },

      sections: config.sections.map((s) =>
        showLockable
          ? { ...s, locked: s.locked, lock_mode: s.lock_mode }
          : { ...s, locked: s.locked }
      ),
    };

    try {
      if (useSelfApi) {
        await dispatch(savePublicProfile({ config: payload })).unwrap();
      } else {
        await dispatch(
          savePublicProfileByUsername({
            username: publicProfile!.username!,
            config: payload,
          })
        ).unwrap();
      }

      setResultSuccess(true);
      setResultMessage("Public profile saved successfully.");
      setResultOpen(true);
    } catch (err) {
      setResultSuccess(false);
      setResultMessage("Something went wrong while saving.");
      setResultOpen(true);
    }
  };
const role = useAppSelector((s) => s.auth.role);

  if (loading || !config)
    return <p className="text-gray-400">Loading profile config...</p>;
  const isReadOnly = (meta?: { locked?: boolean }) =>
    meta?.locked === true && role !== "vendor_admin";

  /* ================= FIELDS ================= */

  const productField: FieldConfig[] = [
    {
      name: "product_ids",
      label: "Select Products",
      type: "search-multiselect",
      options: productOptions,
      onSearch: setProductSearch,
      onScrollEnd: loadMoreProducts,
      showLoader: loadingMoreProducts || productsLoading,
    },
  ];

  /* ================= UI ================= */

  return (
    <div className=" space-y-10 pb-10">
      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />

      <Card title="Profile" desc="Basic information shown on the card">
        <ProfileSection
          profile={config.profile}
          onChange={(p: ProfileConfig) =>
            update({ ...config, profile: p })
          }
        />
      </Card>

      <Card title="Social Links" desc="Your public social profiles">
        <SocialSection
          items={config.social_links.items}
          onChange={(items: any[]) =>
            update({ ...config, social_links: { items } })
          }
        />
      </Card>

      <Card title="Theme" desc="Colors used across the profile">
        {showLockable && (
          <LockControl
            value={config.theme}
            onChange={(v) =>
              update({
                ...config,
                theme: { ...config.theme, ...v },
              })
            }
          />
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {THEME_COLOR_KEYS.map((k) => (
            <ColorPickerField
              key={k}
              label={k.replace("_", " ")}
              value={config.theme[k]}
              disabled={isReadOnly(config.theme)}
              onChange={(val: string) =>
                update({
                  ...config,
                  theme: { ...config.theme, [k]: val },
                })
              }
            />
          ))}
        </div>
      </Card>


      <div className="rounded-2xl bg-[#FBFAFF]">

        {/* HEADER */}
        <div className="px-6 pt-6">
          <h3 className="text-xl font-semibold text-gray-900 pb-4">
            Products
          </h3>
          <p className="text-sm text-gray-500">
            Select which products appear on your public card
          </p>
        </div>
        {showLockable && (
          <div className="px-6 mt-3">
            <LockControl
              value={config.products}
              onChange={(v) =>
                update({
                  ...config,
                  products: { ...config.products, ...v },
                })
              }
            />
          </div>
        )}

        {/* SELECT */}
        <div className="px-1">

          <DynamicForm
            fields={productField}
            disabled={isReadOnly(config.products)}
            form={{
              product_ids: config.products.items.map((p) => p.id),
            }}
            onChange={(_, ids: (string | number)[]) =>
              update({
                ...config,
                products: {
                  locked: config.products.locked,
                  items: mergeSelectedProducts(
                    ids,
                    products,
                    config.products.items
                  ),
                },
              })
            }
            errors={formErrors}
            setErrors={setFormErrors}
          />
        </div>

        <div className="px-6 pb-6 border-t">

          {/* REORDER (keep your existing component) */}
          {config.products.items.length > 0 && (
            <div className="space-y-3">
              <ProductsReorder
                items={config.products.items}
                disabled={isReadOnly(config.products)}
                onChange={(items) =>
                  update({
                    ...config,
                    products: {
                      ...config.products,
                      items,
                    },
                  })
                }
              />
            </div>
          )}
        </div>

      </div>



      <Card title="Banner" desc="Top banner CTA section">
        {showLockable && (
          <LockControl
            value={config.banner}
            onChange={(v) =>
              update({
                ...config,
                banner: { ...config.banner, ...v },
              })
            }
          />
        )}

        {/* ENABLE TOGGLE */}
        <Toggle
          label="Enable banner"
          value={config.banner.enabled}
          disabled={isReadOnly(config.banner)}
          onChange={(v: boolean) =>
            update({
              ...config,
              banner: { ...config.banner, enabled: v },
            })
          }
        />

        {/* IMAGE */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Banner Image</p>

          <div
            className={`relative h-40 w-full rounded-xl border overflow-hidden bg-gray-50 ${isReadOnly(config.banner) ? "opacity-60 pointer-events-none" : ""
              }`}
          >
            {config.banner.image_url ? (
              <img
                src={config.banner.image_url}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No banner image
              </div>
            )}

            <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition">
              Change
              <input
                type="file"
                hidden
                disabled={isReadOnly(config.banner)}
                accept="image/*"
                onChange={(e) =>
                  e.target.files && uploadBannerImage(e.target.files[0])
                }
              />
            </label>
          </div>
        </div>

        {/* CTA */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 ${isReadOnly(config.banner) ? "opacity-60 pointer-events-none" : ""
            }`}
        >
          <Input
            value={config.banner.cta_text || ""}
            disabled={isReadOnly(config.banner)}
            onChange={(v) =>
              update({
                ...config,
                banner: { ...config.banner, cta_text: v },
              })
            }
            placeholder="CTA Text"
          />

          <Input
            value={config.banner.cta_url || ""}
            disabled={isReadOnly(config.banner)}
            onChange={(v) =>
              update({
                ...config,
                banner: { ...config.banner, cta_url: v },
              })
            }
            placeholder="CTA URL"
          />
        </div>
      </Card>

      <Card title="Videos" desc="Your YouTube / video links">
        {showLockable && (
          <LockControl
            value={config.youtube}
            onChange={(v) =>
              update({
                ...config,
                youtube: { ...config.youtube, ...v },
              })
            }
          />
        )}

        <YoutubeSection
          disabled={isReadOnly(config.youtube)}
          items={config.youtube.items}
          onChange={(items) =>
            update({ ...config, youtube: { ...config.youtube, items } })
          }
        />
      </Card>


      <Card title="Meeting Button" desc="Book a call / meeting link">
        {showLockable && (
          <LockControl
            value={config.meeting}
            onChange={(v) =>
              update({
                ...config,
                meeting: { ...config.meeting, ...v },
              })
            }
          />

        )}
        <MeetingSection
          disabled={isReadOnly(config.meeting)}
          value={config.meeting}
          onChange={(m: any) => update({ ...config, meeting: m })}
        />
      </Card>

      <Card title="Links & Files" desc="Add external links or downloadable files">
        {showLockable && (

          <LockControl
            value={config.links_files}
            onChange={(v) =>
              update({
                ...config,
                links_files: { ...config.links_files, ...v },
              })
            }
          />
        )}
        <LinksFilesSection
          disabled={isReadOnly(config.links_files)}
          value={config.links_files}
          onChange={(v) =>
            update({ ...config, links_files: { ...config.links_files, ...v } })
          }
        />
      </Card>

      <Card title="Sections" desc="Reorder your public sections">
        <SectionsReorder
          sections={config.sections}
          onChange={(next: any) =>
            update({ ...config, sections: next })
          }
        />
      </Card>

      <button
        onClick={save}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg hover:opacity-90 transition"
      >
        Save Public Profile
      </button>
    </div>
  );
}

/* ================= UI ================= */

function Card({
  title,
  desc,
  children,
  scroll = false,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  scroll?: boolean;
}) {
  return (
    <div className="relative z-0 rounded-2xl bg-white/70 p-6 space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>

      <div className={scroll ? "max-h-[280px] overflow-visible" : ""}>
        {children}
      </div>
    </div>
  );
}


function Input({
  value,
  onChange,
  textarea,
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  disabled?: boolean;
}) {
  const base =
    "w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500";

  const disabledCls = disabled
    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
    : "";

  return textarea ? (
    <textarea
      disabled={disabled}
      className={`${base} ${disabledCls}`}
      rows={3}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ) : (
    <input
      disabled={disabled}
      className={`${base} ${disabledCls}`}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}


function Toggle({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-3 ${disabled ? "text-gray-400 cursor-not-allowed" : ""
        }`}
    >
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={disabled ? "cursor-not-allowed" : ""}
      />
    </label>
  );
}


function ColorPickerField({
  label,
  value,
  onChange,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement | null>(null);

  const PICKER_W = 280;
  const PICKER_H = 260;
  const GAP = 8;

  // close on unmount
  useEffect(() => () => setOpen(false), []);

  // close on scroll
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [open]);

  const openPicker = () => {
    if (!btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();

    const spaceBelow = window.innerHeight - r.bottom;
    const spaceAbove = r.top;


    let top = r.bottom + GAP;
    let left = r.left;

    // vertical flip
    if (spaceBelow < PICKER_H && spaceAbove > PICKER_H) {
      top = r.top - PICKER_H - GAP;
    }

    // horizontal shift
    if (left + PICKER_W > window.innerWidth) {
      left = window.innerWidth - PICKER_W - GAP;
    }

    if (left < GAP) left = GAP;

    setPos({ top, left });
    setOpen(true);
  };

  if (disabled) {
    return (
      <div className="flex justify-between w-full border p-3 rounded bg-gray-100 text-gray-400 cursor-not-allowed">
        {label}
        <span className="w-8 h-5 rounded" style={{ background: value }} />
      </div>
    );
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={openPicker}
        className="flex justify-between w-full border p-3 rounded"
      >
        {label}
        <span className="w-8 h-5 rounded" style={{ background: value }} />
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999]"
            onClick={() => setOpen(false)}
          >
            <div
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                zIndex: 100000,
              }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl p-3"
            >
              <ProColorPicker value={value} onChange={onChange} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function LockControl({
  value,
  onChange,
}: {
  value: LockMeta;
  onChange: (v: LockMeta) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 border rounded-lg mb-4">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={value.locked}
          onChange={(e) =>
            onChange({
              ...value,
              locked: e.target.checked,
              lock_mode: e.target.checked
                ? value.lock_mode ?? "individual"
                : undefined,
            })
          }
        />
        <span className="text-sm">Locked</span>
      </label>


      <select
        value={value.lock_mode ?? "individual"}
        onChange={(e) =>
          onChange({
            ...value,
            lock_mode: e.target.value as LockMode,
          })
        }
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="individual">Individual</option>
        <option value="global">Global</option>
        <option value="locked">System Locked</option>
      </select>
    </div>
  );
}
