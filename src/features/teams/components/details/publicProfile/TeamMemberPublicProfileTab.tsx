import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import { uploadImage } from "../../../../publicProfile/services/publicProfile.api";
import YoutubeSection from "./sections/YoutubeSection";
import {
  savePublicProfile,
  savePublicProfileByUsername,
} from "../../../../publicProfile/slice";
import { ChevronDown } from "lucide-react";
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
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import CoverCropModal from "../../../../../common/ui/CoverCropModal";
import PhotoGallerySection from "./sections/PhotoGallerySection";
import VideoGallerySection from "./sections/VideoGallerySection";

const THEME_COLOR_KEYS = [
  "card_background",
  "button_color",
  "card_text",
  "button_text",
] as const;


/* ================= TYPES ================= */
export type LockMode = "global" | "individual" | "locked";

export interface LockMeta {
  locked: boolean;          // is this section locked?
  lock_mode?: LockMode;    // who controls it
}

export type ProfileLayoutType = 1 | 2 | 3;

export interface ContactConfig extends LockMeta {
  connect_title: string;
  contact_title: string;
}

export interface LayoutConfig extends LockMeta {
  profile_type: ProfileLayoutType;
  is_fade: boolean;
  font: string;
  card_alignment: "left" | "center" | "right";

  // NEW
  background_image?: string;
  color1?: string;      // gradient start
  color2?: string;      // gradient end
  direction?: string;  // "to-r", "to-b", etc
  custom_font?: string; // font URL
  use_background?:
  | "solid"
  | "gradient"
  | "image"
  | "video"
  | "waves"
  | "polka"
  | "stripes"
  | "zigzag";
  use_custom_font?: boolean;
  background_video?: string;
  profile_width?: number;
  button_style?: number;
}

interface ProfileConfig {
  avatar_url: string;
  description: string;
  custom_profile: boolean;
  custom_profile_url: string;
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
}


export interface ThemeConfig extends LockMeta {
  card_background: string;
  button_color: string;
  card_text: string;
  button_text: string;
}

export interface BannerConfig extends LockMeta {
  enabled: boolean;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
}

export interface ProductsConfig extends LockMeta {
  toggle_price: boolean;
  section_title: string;
  items: ProductRef[];
}


export interface MeetingConfig extends LockMeta {
  enabled: boolean;
  type: string;
  meeting_url: string;
  button_text: string;
}
export interface CoverConfig extends LockMeta {
  cover_url?: string;
}

export interface PhotoGalleryItem {
  title: string;
  description: string;
  link: string;
  img_url: string;
  rank: number;
  enabled: boolean;
}

export interface PhotoGalleryConfig extends LockMeta {
  section_title: string;
  items: PhotoGalleryItem[];
}

interface PublicProfileConfig {
  layout: LayoutConfig;
  profile: ProfileConfig;
  cover: CoverConfig;
  theme: ThemeConfig;
  contact: ContactConfig;
  banner: BannerConfig;

  meeting: MeetingConfig;

  social_links: {
    items: any[];
  };

  products: ProductsConfig;

  youtube: LockMeta & { items: any[] };
  links_files: LockMeta & { items: any[] };
  sections: LockMeta & {
    items: SectionItem[];
  };
  photo_gallery: PhotoGalleryConfig;
  video_gallery: LockMeta & {
    section_title: string;
    items: {
      title: string;
      description: string;
      link: string;
      video_url: string;
      rank: number;
      enabled: boolean;
    }[];
  };

}

/* ================= COMPONENT ================= */

export default function TeamMemberPublicProfileTab({
  onLiveChange,
  useSelfApi = false,   // 👈 default = admin mode
  showLockable = false,  // 👈 new prop for lockable visibility
  onCropToggle,
}: {
  onLiveChange?: (cfg: any) => void;
  useSelfApi?: boolean;
  showLockable?: boolean;
  onCropToggle?: (open: boolean) => void;
}) {
  const dispatch = useAppDispatch();
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");
  const [isCropping, setIsCropping] = useState(false);
  const coverFileRef = useRef<File | null>(null);

  const { data: publicProfile, loading } = useAppSelector(
    (s) => s.publicProfile
  );
  const [formErrors, setFormErrors] = useState<Record<string, string | null>>({});

  const { products, loading: productsLoading } = useAppSelector(
    (s) => s.products
  );

  const [config, setConfig] = useState<PublicProfileConfig | null>(null);
  console.log(config)

  /* ---------- Product search state ---------- */
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [hasNextProducts, setHasNextProducts] = useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

  /* ---------- Options cache ---------- */
  const [productOptions, setProductOptions] = useState<
    { label: string; value: number }[]
  >([]);

  const uploadLayoutBackground = async (file: File) => {
    const res = await uploadImage(file);
    update({
      ...config!,
      layout: {
        ...config!.layout,
        background_image: res.data.url,
      },
    });
  };

 function uploadCustomFont(file: File) {
  if (!file) return;

  if (!/\.(ttf|otf|woff)$/i.test(file.name)) {
    alert("Only .ttf, .otf, .woff fonts are allowed");
    return;
  }

  uploadImage(file)
    .then((res: any) => {
      const fontUrl = res.data.url;

      update({
        ...config!,                 // keep all required fields
        layout: {
          ...config!.layout,
          custom_font: fontUrl,
          use_custom_font: true,
          font: "custom",
        },
      });
    })
    .catch(() => alert("Font upload failed"));
}




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
      setConfig(normalized,);
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

  const update = (next: PublicProfileConfig) => {
    setConfig(next);
    onLiveChange?.(next); // 👈 push to preview
  };

  const save = async () => {
    if (!config) return;

    const withLock = <T extends { locked: boolean; lock_mode?: LockMode }>(v: T) =>
      showLockable
        ? {
          ...v,
          locked: v.locked,
          lock_mode: v.locked ? v.lock_mode ?? "individual" : undefined,
        }
        : { ...v, locked: v.locked };

    const payload = {
      profile: config.profile,
      layout: withLock(config.layout),
      cover: withLock(config.cover),
      theme: withLock(config.theme),

      banner: withLock(config.banner),
      contact: withLock(config.contact),
      meeting: withLock(config.meeting),

      social_links: { items: config.social_links.items },
      photo_gallery: withLock(config.photo_gallery),
      video_gallery: showLockable
        ? {
          section_title: config.video_gallery.section_title,
          items: config.video_gallery.items,
          locked: config.video_gallery.locked,
          lock_mode: config.video_gallery.lock_mode,
        }
        : {
          section_title: config.video_gallery.section_title,
          items: config.video_gallery.items,
        },

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

      sections: showLockable
        ? {
          items: config.sections.items,
          locked: config.sections.locked,
          lock_mode: config.sections.lock_mode,
        }
        : {
          items: config.sections.items,
        },

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
      // dispatch(loadPublicProfile({ handle: publicProfile!.username! }));
      // window.location.reload();
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

  function GradientDirectionDropdown({
    value,
    onChange,
  }: {
    value?: string;
    onChange: (v: string) => void;
  }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const [menuW, setMenuW] = useState(0);

    const options = [
      { id: "to-r", label: "Left → Right" },
      { id: "to-l", label: "Right → Left" },   // 👈 NEW
      { id: "to-b", label: "Top → Bottom" },
      { id: "to-t", label: "Bottom → Top" },
    ];

    const [pos, setPos] = useState({ top: 0, left: 0 });


    const active =
      options.find((o) => o.id === value) || options[0];

    // sync width
    useEffect(() => {
      if (btnRef.current) setMenuW(btnRef.current.offsetWidth);
    }, [active.label]);

    // close on outside click / scroll
    useEffect(() => {
      if (!open) return;

      const close = (e: any) => {
        if (
          btnRef.current?.contains(e.target) ||
          menuRef.current?.contains(e.target)
        )
          return;
        setOpen(false);
      };

      document.addEventListener("mousedown", close);
      window.addEventListener("scroll", close, true);

      return () => {
        document.removeEventListener("mousedown", close);
        window.removeEventListener("scroll", close, true);
      };
    }, [open]);

    return (
      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          onClick={() => {
            if (!btnRef.current) return;

            const r = btnRef.current.getBoundingClientRect();

            const MENU_H = 120; // height of dropdown
            const GAP = 6;

            let top = r.bottom + GAP;

            // 🔁 flip to top if not enough space below
            if (top + MENU_H > window.innerHeight) {
              top = r.top - MENU_H - GAP;
            }

            let left = r.left;

            // keep inside viewport horizontally
            if (left + menuW > window.innerWidth) {
              left = window.innerWidth - menuW - GAP;
            }
            if (left < GAP) left = GAP;

            setPos({ top, left });
            setOpen(true);
          }}


          className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm bg-white w-full"
        >
          {active.label}
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>

        {open &&
          createPortal(
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                width: menuW,
                zIndex: 10000,
              }}
              className="rounded-md border bg-white shadow-xl"
            >
              {options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-purple-50 ${active.id === o.id
                    ? "bg-purple-100 text-purple-700"
                    : ""
                    }`}
                >
                  {o.label}
                </button>
              ))}
            </div>,
            document.body
          )}

      </div>
    );
  }

  /* ================= UI ================= */
  const isLayoutLocked = isReadOnly(config.layout);

  return (
    <div className=" space-y-10">
      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />

      <Card title="Card Layout" desc="Choose how your card looks">
        {showLockable && (
          <LockControl
            value={config.layout}
            onChange={(v) =>
              update({
                ...config,
                layout: { ...config.layout, ...v },
              })
            }
          />
        )}

        <div className={isLayoutLocked ? "opacity-60 pointer-events-none" : ""}>

          {/* LAYOUT TYPE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((t) => (
              <button
                key={t}
                onClick={() =>
                  update({
                    ...config,
                    layout: { ...config.layout, profile_type: t as any },
                  })
                }
                className={`border rounded-xl p-2 transition ${config.layout.profile_type === t
                  ? "border-black ring-2 ring-gray-300"
                  : "border-gray-200"
                  }`}
              >
                <img
                  src={
                    t === 1
                      ? "/profileLayout/profile-1.jpg"
                      : t === 2
                        ? "/profileLayout/profile-2.jpg"
                        : "/profileLayout/profile-3.jpg"
                  }
                  className="w-full rounded"
                />
                <p className="text-xs text-center mt-2">
                  {t === 1 && "Profile Picture"}
                  {t === 2 && "Small Profile"}
                  {t === 3 && "Cover + Profile"}
                </p>
              </button>
            ))}
          </div>

          {/* FADE TOGGLE */}
          {config.layout.profile_type !== 2 && (
            <div className="mt-5">
              <Switch
                label="Fade cover"
                value={config.layout.is_fade}
                onChange={(v) =>
                  update({
                    ...config,
                    layout: { ...config.layout, is_fade: v },
                  })
                }
              />
            </div>
          )}

          {/* COVER UPLOAD (only when layout = 3) */}
          {config.layout.profile_type === 3 && (
            <div className="mt-6 space-y-3">

              {/* LOCK CONTROL */}
              {showLockable && (
                <LockControl
                  value={config.cover}
                  onChange={(v) =>
                    update({
                      ...config,
                      cover: { ...config.cover, ...v },
                    })
                  }
                />
              )}

              <p className="text-sm font-medium text-gray-700">
                Cover Image
              </p>

              <div
                className={`relative h-40 w-full rounded-xl border overflow-hidden bg-gray-50 transition ${isReadOnly(config.cover)
                  ? "opacity-60 pointer-events-none"
                  : "hover:shadow-md"
                  }`}
              >
                {config.cover.cover_url ? (
                  <img
                    src={config.cover.cover_url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No cover image
                  </div>
                )}

                {/* HOVER OVERLAY */}
                {!isReadOnly(config.cover) && (
                  <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition">
                    Change
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        if (!e.target.files) return;
                        coverFileRef.current = e.target.files[0];
                        setIsCropping(true);
                      }}

                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* FONT PICKER */}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Choose a Font</h4>

            <div className="grid grid-cols-2 gap-3">
              {[
                "Inter",
                "Roboto",
                "Montserrat",
                "Merriweather",
                "Caveat",
                "Gloria Hallelujah",
              ].map((font) => (
                <button
                  key={font}
                  onClick={() =>
                    update({
                      ...config,
                      layout: { ...config.layout, font },
                    })
                  }
                  className={`border rounded-xl py-3 text-sm transition ${config.layout.font === font
                    ? "border-black"
                    : "border-gray-200"
                    }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          {/* Use Custom Font */}
          <div className="mt-6">
            <Switch
              label="Use custom font"
              value={config.layout.use_custom_font ?? false}
              onChange={(v) =>
                update({
                  ...config,
                  layout: {
                    ...config.layout,
                    use_custom_font: v,
                    font: v ? "custom" : "Inter", // fallback
                  },
                })
              }
            />
          </div>


          {/* Custom font */}
          {config.layout.use_custom_font && (
            <div className="mt-6">
              <p className="text-sm font-medium">Custom Font</p>

              <label className="inline-block border px-3 py-2 rounded cursor-pointer text-sm">
                Upload Font
                <input
                  type="file"
                  hidden
                  accept=".ttf,.otf,.woff"
                  onChange={(e) =>
                    e.target.files &&
                    uploadCustomFont(e.target.files[0])
                  }
                />
              </label>

              {config.layout.custom_font && (
                <p className="text-xs mt-1 text-purple-600">
                  Uploaded ✔
                </p>
              )}
            </div>
          )}

          {/* ALIGNMENT */}
          <div className="mt-8 border-t pt-6">
            <h4 className="text-sm font-medium mb-3">
              Card Layout Alignment
            </h4>

            <div className="grid grid-cols-3 gap-3">
              {([
                { id: "left", Icon: AlignLeft },
                { id: "center", Icon: AlignCenter },
                { id: "right", Icon: AlignRight },
              ] as const).map(({ id, Icon }) => (
                <button
                  key={id}
                  onClick={() =>
                    update({
                      ...config,
                      layout: {
                        ...config.layout,
                        card_alignment: id,
                      },
                    })
                  }
                  className={`border rounded-xl py-3 flex items-center justify-center transition ${config.layout.card_alignment === id
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>

          </div>

          {/* BUTTON STYLE */}
          <div className="mt-8 border-t pt-6">
            <h4 className="text-sm font-medium mb-3 flex items-center gap-1">
              Button Style
              <span className="text-gray-400 cursor-pointer">ⓘ</span>
            </h4>

            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((s) => {
                const isActive = config.layout.button_style === s;

                const shape =
                  s === 1
                    ? ""
                    : s === 2
                      ? "rounded-md"
                      : "rounded-full";

                return (
                  <button
                    key={s}
                    onClick={() =>
                      update({
                        ...config,
                        layout: { ...config.layout, button_style: s },
                      })
                    }
                    className={`relative h-12 w-full border transition ${isActive
                      ? "border-black ring-2 ring-gray-300"
                      : "border-gray-300 hover:border-gray-400"
                      }`}
                  >
                    {/* preview button */}
                    <div
                      className={`absolute inset-2 ${shape} border border-gray-400 bg-white`}
                    />
                  </button>
                );
              })}
            </div>
          </div>


          {/* PROFILE WIDTH */}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Profile Width</h4>

            <div className="flex items-center gap-3 w-1/2">
              <input
                type="number"
                min={0}
                max={600}
                step={1}
                value={
                  config.layout.profile_width === 0
                    ? ""
                    : config.layout.profile_width
                }
                onChange={(e) => {
                  const val = e.target.value;

                  // allow empty
                  if (val === "") {
                    update({
                      ...config,
                      layout: { ...config.layout, profile_width: 0 },
                    });
                    return;
                  }

                  update({
                    ...config,
                    layout: {
                      ...config.layout,
                      profile_width: Number(val),
                    },
                  });
                }}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. 360"
              />

              <span className="text-xs text-gray-500">px</span>
            </div>

            <p className="text-xs text-gray-400 mt-1">
              Recommended: 6 – 8 px
            </p>
          </div>




          {/* BACKGROUND TYPE */}
          <div className="mt-6">
            <p className="text-sm font-medium mb-2">Background Type</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                "solid",
                "gradient",
                "image",
                "video",
                "waves",
                "polka",
                "stripes",
                "zigzag",
              ].map((t) => (
                <button
                  key={t}
                  onClick={() =>
                    update({
                      ...config,
                      layout: { ...config.layout, use_background: t as any },
                    })
                  }
                  className={`border rounded-xl py-2 text-sm capitalize transition ${config.layout.use_background === t
                    ? "border-black bg-gray-50"
                    : "border-gray-200"
                    }`}
                >
                  {t}
                </button>
              ))}

            </div>
          </div>

          {/* SOLID BACKGROUND */}
          {config.layout.use_background === "solid" && (
            <div className="mt-6">
              <p className="text-sm font-medium">Solid Background Color</p>

              <div className="mt-2 w-1/2">
                <ColorPickerField
                  label="Color"
                  value={config.layout.color1 || "#000000"}
                  onChange={(v) =>
                    update({
                      ...config,
                      layout: { ...config.layout, color1: v },
                    })
                  }
                />
              </div>
            </div>
          )}
         {config.layout.use_background === "video" && (
  <div className="mt-6 space-y-3">
    <p className="text-sm font-medium">Background Video</p>

    {/* PREVIEW */}
    {config.layout.background_video && (
      <video
        src={config.layout.background_video}
        className="w-full h-40 rounded-lg object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
    )}

    {/* UPLOAD */}
    <label className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-dashed cursor-pointer text-sm hover:bg-gray-50">
      Upload video
      <input
        type="file"
        accept="video/mp4,video/webm"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;

          const res = await uploadImage(file); // reuse existing
          const url = res.data.url;

          update({
            ...config,
            layout: { ...config.layout, background_video: url },
          });
        }}
      />
    </label>

    <p className="text-xs text-gray-500">
      MP4 / WebM • Autoplays silently in background
    </p>
  </div>
)}

          {["waves", "polka", "stripes", "zigzag"].includes(
            config.layout.use_background || ""
          ) && (
              <div className="mt-6">
                <p className="text-sm font-medium">Pattern Background Color</p>

                <div className="mt-2 w-1/2">
                  <ColorPickerField
                    label="Background"
                    value={config.layout.color1 || "#2f343a"}
                    onChange={(v) =>
                      update({
                        ...config,
                        layout: { ...config.layout, color1: v },
                      })
                    }
                  />
                </div>
              </div>
            )}


          {/* Gradient */}
          {config.layout.use_background === "gradient" && (
            <div className="mt-6">
              <p className="text-sm font-medium">Gradient Background</p>

              <div className="grid grid-cols-3 gap-3">
                <ColorPickerField
                  label="From"
                  value={config.layout.color1 || "#7c3aed"}
                  onChange={(v) =>
                    update({
                      ...config,
                      layout: { ...config.layout, color1: v },
                    })
                  }
                />
                <ColorPickerField
                  label="To"
                  value={config.layout.color2 || "#6366f1"}
                  onChange={(v) =>
                    update({
                      ...config,
                      layout: { ...config.layout, color2: v },
                    })
                  }
                />

                <GradientDirectionDropdown
                  value={config.layout.direction}
                  onChange={(dir) =>
                    update({
                      ...config,
                      layout: { ...config.layout, direction: dir },
                    })
                  }
                />
              </div>
            </div>
          )}

          {/* BG Image */}
          {config.layout.use_background === "image" && (
            <div className="mt-6">
              <p className="text-sm font-medium">Background Image</p>

              <div className="relative h-32 w-full rounded-xl border overflow-hidden bg-gray-50">
                {config.layout.background_image ? (
                  <img
                    src={config.layout.background_image}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-gray-400">
                    No background image
                  </div>
                )}

                <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition">
                  Upload
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) =>
                      e.target.files &&
                      uploadLayoutBackground(e.target.files[0])
                    }
                  />
                </label>
              </div>
            </div>
          )}

        </div>

      </Card>


      <Card title="Profile" desc="Basic information shown on the card">
        <ProfileSection
          profile={config.profile}
          onChange={(p: ProfileConfig) =>
            update({ ...config, profile: p })
          }
          onCropToggle={onCropToggle}   // 👈 ADD
        />
      </Card>

      <Card title="Contact" desc="Customize contact buttons">
        {showLockable && (
          <LockControl
            value={config.contact}
            onChange={(v) =>
              update({ ...config, contact: { ...config.contact, ...v } })
            }
          />
        )}

        <div className="space-y-6">

          {/* CONNECT BUTTON TITLE */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              Connect Button Text
            </p>
            <Input
              value={config.contact.connect_title}
              onChange={(v) =>
                update({
                  ...config,
                  contact: { ...config.contact, connect_title: v },
                })
              }
              placeholder="e.g. Connect"
            />
          </div>

          {/* SAVE CONTACT BUTTON TITLE */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-700">
              Save Contact Button Text
            </p>
            <Input
              value={config.contact.contact_title}
              onChange={(v) =>
                update({
                  ...config,
                  contact: { ...config.contact, contact_title: v },
                })
              }
              placeholder="e.g. Save Contact"
            />
          </div>

        </div>
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
        {/* TOGGLE PRICE VISIBILITY */}
        <div className="px-6 mt-4">
          <div
            className={`flex items-center justify-between rounded-xl border px-4 py-3 bg-white ${isReadOnly(config.products) ? "opacity-60 pointer-events-none" : ""
              }`}
          >
            <div>
              <p className="text-sm font-medium text-gray-800">
                Show Product Prices
              </p>
              <p className="text-xs text-gray-500">
                Toggle whether prices appear on the public card
              </p>
            </div>

            <Switch
              label=""   // we already show text on left
              value={config.products.toggle_price}
              onChange={(v) =>
                update({
                  ...config,
                  products: {
                    ...config.products,
                    toggle_price: v,
                  },
                })
              }
            />
          </div>
        </div>

        {/* SECTION TITLE */}
        <div className="px-6 mt-4">
          <div
            className={`space-y-1 ${isReadOnly(config.products) ? "opacity-60 pointer-events-none" : ""
              }`}
          >
            <p className="text-sm font-medium text-gray-700">
              Section Title
            </p>
            <Input
              value={config.products.section_title}
              placeholder="Products"
              onChange={(v) =>
                update({
                  ...config,
                  products: {
                    ...config.products,
                    section_title: v,
                  },
                })
              }
            />
          </div>
        </div>


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
                  ...config.products,              // 🔥 keep toggle_price + section_title
                  locked: config.products.locked,  // keep lock
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


      <Card title="Photo Gallery" desc="Manage your gallery images">
        {showLockable && (
          <LockControl
            value={config.photo_gallery}
            onChange={(v) =>
              update({
                ...config,
                photo_gallery: { ...config.photo_gallery, ...v },
              })
            }
          />
        )}

        <PhotoGallerySection
          value={config.photo_gallery}
          disabled={isReadOnly(config.photo_gallery)}
          onChange={(v: any) =>
            update({ ...config, photo_gallery: v })
          }
        />
      </Card>

      <Card title="Video Gallery" desc="Manage your videos">
        {showLockable && (
          <LockControl
            value={config.video_gallery}
            onChange={(v) =>
              update({ ...config, video_gallery: { ...config.video_gallery, ...v } })
            }
          />
        )}

        <VideoGallerySection
          value={config.video_gallery}
          disabled={isReadOnly(config.video_gallery)}
          onChange={(v) => update({ ...config, video_gallery: v })}
        />
      </Card>



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

        {showLockable && (
          <LockControl
            value={config.sections}
            onChange={(v) =>
              update({
                ...config,
                sections: { ...config.sections, ...v },
              })
            }
          />
        )}

        <SectionsReorder
          sections={config.sections.items}
          groupLocked={config.sections.locked}
          onChange={(items) =>
            update({
              ...config,
              sections: { ...config.sections, items },
            })
          }
        />
      </Card>



      <button
        onClick={save}
        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg hover:opacity-90 transition"
      >
        Save Public Profile
      </button>
      {isCropping && coverFileRef.current && (
        <CoverCropModal
          file={coverFileRef.current}
          onCancel={() => {
            coverFileRef.current = null;
            setIsCropping(false);
          }}
          onSave={async (blob) => {
            const file = new File([blob], "cover.jpg", { type: "image/jpeg" });
            const res = await uploadImage(file);

            update({
              ...config!,
              cover: { ...config!.cover, cover_url: res.data.url },
            });

            coverFileRef.current = null;
            setIsCropping(false);
          }}
        />
      )}

    </div>
  );
}

/* ================= UI ================= */

export function Card({
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
    <div className="relative z-0 overflow-visible rounded-2xl bg-white/70 p-6 space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>

      <div className={scroll ? "max-h-[280px] overflow-visible" : ""}>
        {children}
      </div>
    </div>
  );
}


export function Input({
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


export function Toggle({
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
            className="fixed inset-0 z-[500]"
            onClick={() => setOpen(false)}
          >
            <div
              style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                zIndex: 600,
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
  value?: LockMeta;
  onChange: (v: LockMeta) => void;
}) {
  if (!value) return null; // ⛑ prevent crash

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuW, setMenuW] = useState(0);

  const modes: { id: LockMode; label: string }[] = [
    { id: "individual", label: "Individual" },
    { id: "global", label: "Global" },
    { id: "locked", label: "System Locked" },
  ];

  const currentMode: LockMode = value.lock_mode ?? "individual";
  const active = modes.find((m) => m.id === currentMode) || modes[0];

  // sync dropdown width with button
  useEffect(() => {
    if (btnRef.current) {
      setMenuW(btnRef.current.offsetWidth);
    }
  }, [active.label]);

  // close on outside click or scroll
  useEffect(() => {
    if (!open) return;

    const close = (e?: Event) => {
      if (
        e instanceof MouseEvent &&
        (btnRef.current?.contains(e.target as Node) ||
          menuRef.current?.contains(e.target as Node))
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", close, true);

    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        {/* Toggle */}
        Locked
        <button
          type="button"
          title={value.locked ? "Lock on" : "Lock off"}   // 👈 tooltip
          onClick={() =>
            onChange({
              ...value,
              locked: !value.locked,
              lock_mode: !value.locked
                ? value.lock_mode ?? "individual"
                : undefined,
            })
          }
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${value.locked ? "bg-purple-600" : "bg-gray-300"
            }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${value.locked ? "translate-x-5" : "translate-x-1"
              }`}
          />
        </button>

        {/* Dropdown */}
        <div className="relative">
          <button
            ref={btnRef}
            type="button"
            onClick={() => {
              if (!value.lock_mode) {
                onChange({ ...value, lock_mode: "individual" });
              }
              setOpen((v) => !v);
            }}
            className="flex items-center justify-between gap-2 border rounded-md px-3 py-1 text-xs bg-white min-w-[120px]"
          >
            {active.label}
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {open && (
            <div
              ref={menuRef}
              style={{ width: menuW }}
              className="absolute right-0 mt-1 rounded-md border bg-white shadow-lg z-50"
            >
              {modes.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onChange({ ...value, lock_mode: m.id });
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-xs hover:bg-purple-50 ${active.id === m.id
                    ? "bg-purple-100 text-purple-700"
                    : ""
                    }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Switch({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-10">
      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>

      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${value ? "bg-purple-600" : "bg-gray-300"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${value ? "translate-x-6" : "translate-x-1"
            }`}
        />
      </button>
    </div>
  );
}
