import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import YoutubeSection from "./sections/YoutubeSection";
import {
  savePublicProfile,
  previewPublicProfile,
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

/* ================= TYPES ================= */

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
  locked: boolean;
  enabled: boolean;
}

interface PublicProfileConfig {
  profile: ProfileConfig;
  theme: Record<string, string>;
  banner: {
    enabled: boolean;
    image_url?: string;
    cta_text?: string;
    cta_url?: string;
  };
  meeting: {
    locked: boolean;
    enabled: boolean;
    type: string;
    meeting_url: string;
    button_text: string;
  };

  social_links: { items: any[] };
  products: {
    locked: boolean;
    items: ProductRef[];
  };
  youtube: { items: any[] };
  links_files: { items: any[] };
  sections: SectionItem[];
}

/* ================= COMPONENT ================= */

export default function TeamMemberPublicProfileTab() {
  const dispatch = useAppDispatch();

  const { data: publicProfile, loading } = useAppSelector(
    (s) => s.publicProfile
  );
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});

  const { products, loading: productsLoading } = useAppSelector(
    (s) => s.products
  );

  const [config, setConfig] = useState<PublicProfileConfig | null>(null);
  const [initialized, setInitialized] = useState(false);

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
    if (publicProfile && !initialized) {
      const normalized = normalizeProfile(publicProfile) as PublicProfileConfig;
      setConfig(normalized);
      dispatch(previewPublicProfile(normalized));
      setInitialized(true);
    }
  }, [publicProfile, initialized, dispatch]);

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
    dispatch(previewPublicProfile(next));
  };

  const save = () => {
    if (!config) return;
    dispatch(
      savePublicProfile({
        config: {
          profile: config.profile,
          theme: config.theme,
          banner: config.banner,
          meeting: config.meeting,
          social_links: { items: config.social_links.items },
          products: {
            locked: config.products.locked,
            items: config.products.items,
          },

          youtube: { items: config.youtube.items },
          links_files: { items: config.links_files.items },
          sections: config.sections,
        },
      })
    );
  };

  if (loading || !config)
    return <p className="text-gray-400">Loading profile config...</p>;

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(config.theme).map(([k, v]) => (
            <ColorPickerField
              key={k}
              label={k.replace("_", " ")}
              value={v}
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

  {/* SELECT */}
  <div className="px-1">

    <DynamicForm
      fields={productField}
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
        <Toggle
          label="Enable banner"
          value={config.banner.enabled}
          onChange={(v: boolean) =>
            update({
              ...config,
              banner: { ...config.banner, enabled: v },
            })
          }
        />

        {/* BANNER IMAGE UPLOAD */}
        <div className="space-y-2">
          <p className="text-xs text-gray-500">Banner Image</p>

          <div className="relative h-40 w-full rounded-xl border overflow-hidden bg-gray-50">
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
                accept="image/*"
                onChange={(e) =>
                  e.target.files && uploadBannerImage(e.target.files[0])
                }
              />
            </label>
          </div>
        </div>

        {/* CTA FIELDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            value={config.banner.cta_text || ""}
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
        <YoutubeSection
          items={config.youtube.items}
          onChange={(items) =>
            update({ ...config, youtube: { ...config.youtube, items } })
          }
        />
      </Card>

      <Card title="Meeting Button" desc="Book a call / meeting link">
        <MeetingSection
          value={config.meeting}
          onChange={(m: any) => update({ ...config, meeting: m })}
        />
      </Card>

      <Card title="Links & Files" desc="Add external links or downloadable files">
        <LinksFilesSection
          value={config.links_files}
          onChange={(v) =>
            update({ ...config, links_files: v })
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
    <div className="relative z-0 rounded-2xl bg-white/70 backdrop-blur p-6 space-y-4">
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
}: {
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {

  return textarea ? (
    <textarea
      className="w-full rounded-lg border px-3 py-2"
      rows={3}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ) : (
    <input
      className="w-full rounded-lg border px-3 py-2"
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
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
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
  const [pos, setPos] = useState({ top: 0, left: 0 });

  return (
    <>
      <button
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setPos({ top: r.bottom + window.scrollY, left: r.left + window.scrollX });
          setOpen(true);
        }}
        className="flex justify-between w-full border p-3 rounded"
      >
        {label}
        <span className="w-8 h-5 rounded" style={{ background: value }} />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" onClick={() => setOpen(false)}>
            <div style={pos} className="absolute">
              <ProColorPicker value={value} onChange={onChange} />
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
