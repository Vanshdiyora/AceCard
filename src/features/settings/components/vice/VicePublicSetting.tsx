import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { uploadImage } from "../../../publicProfile/services/publicProfile.api";
import YoutubeSection from "./sections/YoutubeSection";
import { useLocation } from "react-router-dom";
import {
  savePublicProfile,
  savePublicProfileByUsername,
} from "../../../publicProfile/slice";
import { ChevronDown } from "lucide-react";
import ProductsReorder from "./sections/ProductsReorder";
import LinksFilesSection from "./sections/LinksFilesSection";
import SectionsReorder from "./sections/SectionsReorder";
import { normalizeProfile } from "../../../publicProfile/utils/normalizeProfile";
import { ProColorPicker } from "../../../../common/utils/ColorPicker";
import DynamicForm, { type FieldConfig } from "../../../../common/ui/DynamicForm";
import MeetingSection from "./sections/MeetingSections";
import ProfileSection from "./sections/ProfileSection";
import SocialSection from "./sections/SocialSection";
import { fetchProducts } from "../../../products/slice";
import ResultModal from "../../../../common/ui/ResultModal";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import CoverCropModal from "../../../../common/ui/CoverCropModal";
import PhotoGallerySection from "./sections/PhotoGallerySection";
// import VideoGallerySection from "./sections/VideoGallerySection";
// import { normalizeApiError } from "../../../../utils/normalizeApiError";
import { SOCIAL_ICONS } from "./sections/socialIcons";
import CommonModal from "./sections/CommonModal";
import { fetchTeam } from "../../../teams/slice"; // adjust 
import AddSectionModal from "./sections/AddSectionModal";
const THEME_COLOR_KEYS = [
  "card_background",
  "button_color",
  "card_text",
  "button_text",
  "image_text_color",
] as const;

const THEME_COLOR_LABELS: Record<typeof THEME_COLOR_KEYS[number], string> = {
  card_background: "Card background",
  button_color: "Button color",
  card_text: "Card text",
  button_text: "Button text",
  image_text_color: "Image text",
};

type Validator<T> = (item: T) => boolean;

export function canAddNewRow<T>(
  items: T[],
  isComplete: Validator<T>
) {
  if (!items || items.length === 0) return true;

  const last = items[items.length - 1];
  return isComplete(last);
}
function extractYoutubeId(url: string) {
  if (!url) return "";
  const match =
    url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
  return match?.[1] ?? "";
}

export function isYoutubeRowComplete(item: any) {
  if (!item) return false;

  // required fields
  if (!item.url || item.url.trim() === "") return false;

  // must be a valid youtube link
  return Boolean(extractYoutubeId(item.url));
}

export function isPhotoRowComplete(item?: any) {
  if (!item) return true; // allow first row
  if (!item.title || item.title.trim() === "") return false;
  // if (!item.img_url || item.img_url.trim() === "") return false;
  return true;
}

export function isLinkFileRowComplete(item?: any) {
  if (!item) return true;

  if (!item.title || item.title.trim() === "") return false;

  if (item.type === "link") {
    return Boolean(item.url && item.url.trim());
  }

  if (item.type === "file") {
    return Boolean(item.file_url && item.file_url.trim());
  }

  return true;
}
function hasInvalidSocialLinks(items: any[] = []) {
  return items.some(
    (i) => i.enabled === true && (!i.url || i.url.trim() === "")
  );
}


/* ================= TYPES ================= */
export type LockMode = "global" | "individual";

export interface LinksFilesConfig extends LockMeta {
  section_title: string;
  locked_by: string;
  items: any[];
}

export interface LockMeta {
  locked: boolean;          // is this section locked?
  lock_mode?: LockMode;    // who controls it
}

export type ProfileLayoutType = 1 | 2 | 3;

export interface YoutubeConfig extends LockMeta {
  section_title: string;
  locked_by: string;
  items: any[];
}

export interface ContactConfig extends LockMeta {
  connect_title: string;
  contact_title: string;
  locked_by: string;
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
  | "polka"
  | "stripes"
  | "zigzag";
  use_custom_font?: boolean;
  background_video?: string;
  fade_color?: string;
  profile_width?: number;
  button_style?: number;
  profile_radius?: number;
  locked_by: string;
}

interface ProfileConfig {
  avatar_url: string;
  description: string;
  custom_profile: boolean;
  custom_profile_url: string;
  custom_job_role: string;
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
  image_text_color: string;
  locked_by: string;
}

export interface BannerConfig extends LockMeta {
  enabled: boolean;
  image_url?: string;
  cta_text?: string;
  cta_url?: string;
  locked_by: string;
}

export interface ProductsConfig extends LockMeta {
  toggle_price: boolean;
  section_title: string;
  locked_by: string;
  items: ProductRef[];
}


export interface MeetingConfig extends LockMeta {
  enabled: boolean;
  type: string;
  meeting_url: string;
  button_text: string;
  locked_by: string;
}
export interface CoverConfig extends LockMeta {
  cover_url?: string;
  locked_by: string;
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
  locked_by: string;
  items: PhotoGalleryItem[];
}

interface PublicProfileConfig {
  role: string;
  layout: LayoutConfig;
  profile: ProfileConfig;
  cover: CoverConfig;
  theme: ThemeConfig;
  contact: ContactConfig;
  banner: BannerConfig;

  meeting: MeetingConfig;

  social_links: LockMeta & {
    locked_by: string;
    items: any[];
  };


  products: ProductsConfig;

  youtube: YoutubeConfig;
  links_files: LinksFilesConfig;
  sections: LockMeta & {
    locked_by: string;
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

function getChangedFields<T extends object>(
  current: T,
  original: T
): Partial<T> {
  const result: Partial<T> = {};

  Object.keys(current).forEach((key) => {
    const currVal = (current as any)[key];
    const origVal = (original as any)[key];

    // Handle strings safely (important for bio)
    if (typeof currVal === "string" && typeof origVal === "string") {
      if (currVal.trim() !== origVal.trim()) {
        (result as any)[key] = currVal;
      }
      return;
    }

    // Deep compare objects
    if (JSON.stringify(currVal) !== JSON.stringify(origVal)) {
      (result as any)[key] = currVal;
    }
  });

  return result;
}

/* ================= COMPONENT ================= */

export default function VicePublicSetting({
  onLiveChange,
  username,
  useSelfApi = false,   // 👈 default = admin mode
  showLockable = false,  // 👈 new prop for lockable visibility
  onCropToggle,
}: {
  onLiveChange?: (cfg: any) => void;
  username?: string;
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
  const [originalConfig, setOriginalConfig] = useState<PublicProfileConfig | null>(null);

  const { data: publicProfile, loading } = useAppSelector(
    (s) => s.publicProfile
  );
  const { members } = useAppSelector((s) => s.team);
  const location = useLocation();

  const showTeamSection = location.pathname === "/admin/settings";

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

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [draftProducts, setDraftProducts] = useState<ProductRef[]>([]);
  const [photoGalleryModalOpen, setPhotoGalleryModalOpen] = useState(false);
  const [draftPhotoGallery, setDraftPhotoGallery] =
    useState<PhotoGalleryConfig | null>(null);
  const [linksFilesModalOpen, setLinksFilesModalOpen] = useState(false);
  const [draftLinksFiles, setDraftLinksFiles] =
    useState<PublicProfileConfig["links_files"] | null>(null);
  const [socialModalOpen, setSocialModalOpen] = useState(false);
  const [draftSocialLinks, setDraftSocialLinks] =
    useState<PublicProfileConfig["social_links"] | null>(null);
  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [draftYoutube, setDraftYoutube] = useState<PublicProfileConfig["youtube"] | null>(null);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);


  /* ---------- Team search state ---------- */
  const [teamSearch, setTeamSearch] = useState("");
  const [teamPage, setTeamPage] = useState(1);
  const [hasNextTeam, setHasNextTeam] = useState(true);
  const [loadingMoreTeam, setLoadingMoreTeam] = useState(false);
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);

  const [teamOptions, setTeamOptions] = useState<
    { label: string; value: string }[]
  >([]);

  /* ---------- Options cache ---------- */
  const [productOptions, setProductOptions] = useState<
    { label: string; value: number }[]
  >([]);


  // 📄 PAGE CHANGE EFFECT (APPEND)
  useEffect(() => {
    if (teamPage === 1) return;

    dispatch(
      fetchTeam({
        page: teamPage,
        page_size: 10,
        search: teamSearch?.trim() || undefined,
        append: true,
      })
    )
      .unwrap()
      .then((r) => {
        setHasNextTeam(Boolean(r.meta?.has_next));
      })
      .finally(() => {
        setLoadingMoreTeam(false); // ✅ VERY IMPORTANT
      });
  }, [teamPage, dispatch]);

  // 📄 PAGE CHANGE EFFECT
  useEffect(() => {
    const delay = setTimeout(() => {
      setTeamPage(1);
      setLoadingMoreTeam(true); // optional

      dispatch(
        fetchTeam({
          page: 1,
          page_size: 10,
          search: teamSearch?.trim() || undefined,
          append: false,
        })
      )
        .unwrap()
        .then((r) => {
          setHasNextTeam(Boolean(r.meta?.has_next));
        })
        .finally(() => {
          setLoadingMoreTeam(false); // ✅ reset here too
        });
    }, 400);

    return () => clearTimeout(delay);
  }, [teamSearch, dispatch]);


  useEffect(() => {
    setTeamOptions((prev) => {
      const map = new Map(prev.map((o) => [o.value, o]));

      members.forEach((m) => {
        if (!m.username) return;

        map.set(m.username, {
          label: m.name || m.email || m.username,
          value: m.username, // ✅ username
        });
      });

      return Array.from(map.values());
    });
  }, [members]);




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
      setOriginalConfig(structuredClone(normalized));
    }
  }, [publicProfile]);

  const validateBeforeSave = () => {
    // if (!config?.profile.description?.trim()) {
    //   setResultSuccess(false);
    //   setResultMessage("Profile description is required.");
    //   setResultOpen(true);
    //   return false;
    // }

    if (hasInvalidSocialLinks(config?.social_links.items)) {
      setResultSuccess(false);
      setResultMessage("Please fill all enabled social links.");
      setResultOpen(true);
      return false;
    }

    return true;
  };

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

  const isSectionEnabled = (type: string) => {
    console.log("Sections:", config?.sections.items);

    return config?.sections.items?.some(
      (s) => s.type === type && s.enabled
    );
  };

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
        image_url: prev?.image_url || fromApi?.image_url || prev?.product_img_url || fromApi?.product_img_url || "",
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
    if (!config || !originalConfig) return;

    // 1️⃣ Validate first
    if (!validateBeforeSave()) return;

    // 2️⃣ Get only changed sections
    const changedPayload = getChangedFields(config, originalConfig);

    if (Object.keys(changedPayload).length === 0) {
      setResultSuccess(true);
      setResultMessage("No changes detected.");
      setResultOpen(true);
      return;
    }

    try {
      const hasTeamUsers =
        Array.isArray(selectedUsernames) &&
        selectedUsernames.length > 0;

      if (!useSelfApi || hasTeamUsers) {
        const usernamesToUpdate = hasTeamUsers
          ? selectedUsernames
          : [publicProfile?.username!];

        await dispatch(
          savePublicProfileByUsername({
            usernames: usernamesToUpdate,
            config: changedPayload, // 👈 ONLY CHANGED
          })
        ).unwrap();
      } else {
        await dispatch(
          savePublicProfile({
            config: changedPayload, // 👈 ONLY CHANGED
          })
        ).unwrap();
      }

      setOriginalConfig(structuredClone(config)); // 👈 reset snapshot

      setResultSuccess(true);
      setResultMessage("Public profile updated successfully.");
      setResultOpen(true);
    } catch (err: any) {
      let msg = err?.message || "Something went wrong.";
      setResultSuccess(false);
      setResultMessage(msg);
      setResultOpen(true);
    }
  };

  const role = useAppSelector((s) => s.auth.role);

  if (loading || !config)
    return <p className="text-gray-400">Loading...</p>;
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

            // 👇 CLOSE if already open
            if (open) {
              setOpen(false);
              return;
            }

            const r = btnRef.current.getBoundingClientRect();

            const MENU_H = 120;
            const GAP = 6;

            let top = r.bottom + GAP;

            if (top + MENU_H > window.innerHeight) {
              top = r.top - MENU_H - GAP;
            }

            let left = r.left;

            if (left + menuW > window.innerWidth) {
              left = window.innerWidth - menuW - GAP;
            }
            if (left < GAP) left = GAP;

            setPos({ top, left });
            setOpen(true);
          }}

          className="flex items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm bg-white w-full h-12"
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
  const handleAddSection = (type: string) => {
    const exists = config.sections.items.find(
      (s) => s.type === type
    );

    let updated;

    if (exists) {
      // toggle enable state
      updated = config.sections.items.map((s) =>
        s.type === type
          ? { ...s, enabled: !s.enabled }
          : s
      );
    } else {
      // add new section
      updated = [
        ...config.sections.items,
        {
          id: type,
          type,
          rank: config.sections.items.length + 1,
          enabled: true,
        },
      ];
    }

    update({
      ...config,
      sections: {
        ...config.sections,
        items: updated,
      },
    });
  };


  /* ================= UI ================= */
  const isLayoutLocked = isReadOnly(config.layout);
  const loadMoreTeams = () => {
    if (!hasNextTeam || loadingMoreTeam) return;

    setLoadingMoreTeam(true);
    setTeamPage((prev) => prev + 1);
  };

  const teamField: FieldConfig[] = [
    {
      name: "team_ids",
      label: "Select Team Members",
      type: "search-multiselect",
      options: teamOptions,
      onSearch: setTeamSearch,
      onScrollEnd: loadMoreTeams,
      showLoader: loadingMoreTeam,
    },
  ];

  return (
    <div className="mb-4">
      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />

      {/* TEAM SELECT */}
      {showTeamSection && (
        <>
          <div className="pt-6 px-6">
            <h4 className="text-lg font-medium">
              Team Members
            </h4>
          </div>

          <div className="px-1">
            <DynamicForm
              fields={teamField}
              form={{
                team_ids: selectedUsernames,
              }}
              onChange={(_, usernames: string[]) =>
                setSelectedUsernames(usernames)
              }
              errors={formErrors}
              setErrors={setFormErrors}
            />
          </div>
        </>
      )}

      <Card title="Card Layout" desc="Choose how your card looks">
        {showLockable && (
          <LockControl
            value={config.layout}
            role={config.role}
            currentUser={username}
            onChange={(v) =>
              update({
                ...config,
                layout: { ...config.layout, ...v },
              })
            }
          />
        )}

        <div className={isLayoutLocked ? "" : ""}>

          {/* LAYOUT TYPE */}
          <div className={isLayoutLocked ? "opacity-60 pointer-events-none" : ""}>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg">
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
               <div className="aspect-square w-full max-w-[110px] mx-auto overflow-hidden rounded-lg bg-gray-50">

                    <img
                      src={
                        t === 1
                          ? "/profileLayout/profile1.png"
                          : t === 2
                            ? "/profileLayout/profile2.png"
                            : "/profileLayout/profile3.png"
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <p className="text-xs text-center mt-2">
                    {t === 1 && "Profile Picture"}
                    {t === 2 && "Small Profile"}
                    {t === 3 && "Cover + Profile"}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* PROFILE + COVER SECTION */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-[0.7fr_1fr_1fr] gap-20 max-w-lg items-start">

            {/* PROFILE PHOTO — ALWAYS VISIBLE */}
            <div className="min-w-32">
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-semibold text-gray-800">
                  Profile Photo
                </p>
              </div>

              <ProfileSection
                profile={config.profile}
                onChange={(p: ProfileConfig) =>
                  update({
                    ...config,
                    profile: {
                      ...config.profile,
                      ...p,
                    },
                  })
                }
                onCropToggle={onCropToggle}
              />
            </div>

            {/* COVER BACKGROUND — ONLY WHEN TYPE 3 */}
            {config.layout.profile_type === 3 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-semibold text-gray-800">
                    Cover Background
                  </p>
                </div>

                {/* Lock only for cover */}
                {showLockable && (
                  <div className="mb-3">
                    <LockControl
                      value={config.cover}
                      role={config.role}
                      onChange={(v) =>
                        update({
                          ...config,
                          cover: { ...config.cover, ...v },
                        })
                      }
                    />
                  </div>
                )}


                <div
                  className={`relative h-40 w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 transition ${isReadOnly(config.cover)
                    ? "opacity-60 pointer-events-none"
                    : "hover:bg-gray-100"
                    }`}
                >
                  {config.cover.cover_url ? (
                    <img
                      src={config.cover.cover_url}
                      className="absolute inset-0 w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-sm text-gray-500">
                      <p>Drag file here for upload or</p>
                      <span className="mt-2 inline-block bg-gray-200 px-4 py-1.5 rounded-full text-xs font-medium">
                        Select Files
                      </span>
                    </div>
                  )}

                  {!isReadOnly(config.cover) && (
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (!e.target.files) return;
                        coverFileRef.current = e.target.files[0];
                        setIsCropping(true);
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* BASIC INFO (READ ONLY) */}
          <div className="mt-8 max-w-lg space-y-6">

            {/* BASIC INFO GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* FULL NAME */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Full Name
                </p>
                <Input
                  value={publicProfile?.name || ""}
                  onChange={() => { }}
                  disabled
                />
              </div>

              {/* COMPANY NAME */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Company Name
                </p>
                <Input
                  value={publicProfile?.vendor_name || ""}
                  onChange={() => { }}
                  disabled
                />
              </div>

              {/* JOB TITLE / ROLE */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Job Title / Role
                </p>
                <Input
                  value={
                    publicProfile?.custom_job_role ||
                    publicProfile?.role ||
                    ""
                  }
                  onChange={() => { }}
                  disabled
                />
              </div>

              {/* LOCATION */}
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Location
                </p>
                <Input
                  value={publicProfile?.address || ""}
                  onChange={() => { }}
                  disabled
                />
              </div>

            </div>

            {/* BIO — FULL WIDTH & EDITABLE */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Bio
              </p>

              <Input
                textarea
                value={config.profile.description}
                placeholder="Describe your work"
                onChange={(v) =>
                  update({
                    ...config,
                    profile: {
                      ...config.profile,
                      description: v,
                    },
                  })
                }
              />
            </div>

          </div>

          {/* FADE TOGGLE + COLOR */}
          <div className={isLayoutLocked ? "opacity-60 pointer-events-none" : ""}>
            {config.layout.profile_type !== 2 && (
              <div className="mt-6 space-y-4">

                {/* Fade Toggle */}
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

                {/* Fade Color — Theme Style */}
                {config.layout.is_fade && (
                  <ThemeColorRow
                    label="Fade color"
                    value={config.layout.fade_color ?? "#000000"}
                    disabled={!config.layout.is_fade}
                    onChange={(val: string) =>
                      update({
                        ...config,
                        layout: { ...config.layout, fade_color: val },
                      })
                    }
                  />
                )}
              </div>
            )}
          </div>

          {/* ALIGNMENT */}
          <div className={isLayoutLocked ? "opacity-60 pointer-events-none" : ""}>
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
          </div>

          {/* AVATAR SETTINGS — ONE LINE */}
          <div className={isLayoutLocked ? "opacity-60 pointer-events-none" : ""}>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Avatar Border Thickness */}
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Avatar Border Thickness
                </h4>

                <div className="flex items-center gap-3">
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
                    placeholder="e.g. 6"
                  />

                  <span className="text-xs text-gray-500">px</span>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  Recommended: 6 - 8 px
                </p>
              </div>

              {/* Profile Size */}
              <div>
                <h4 className="text-sm font-medium mb-3">
                  Profile Size
                </h4>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={40}
                    max={80}
                    step={1}
                    value={
                      config.layout.profile_radius === 0
                        ? ""
                        : config.layout.profile_radius
                    }
                    onChange={(e) => {
                      const val = e.target.value;

                      if (val === "") {
                        update({
                          ...config,
                          layout: { ...config.layout, profile_radius: 0 },
                        });
                        return;
                      }

                      update({
                        ...config,
                        layout: {
                          ...config.layout,
                          profile_radius: Number(val),
                        },
                      });
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g. 60"
                  />

                  <span className="text-xs text-gray-500">px</span>
                </div>

                <p className="text-xs text-gray-400 mt-1">
                  Recommended: 60 - 70 px
                </p>
              </div>

            </div>
          </div>

          {/* FONT PICKER */}
          <div className={isLayoutLocked ? "opacity-60 pointer-events-none" : ""}>
            <div className="mt-6">
              <label className="text-sm font-medium mb-2 block">
                Choose a Font
              </label>

              <FontDropdown
                value={config.layout.font}
                useCustom={config.layout.use_custom_font}
                onChange={(font, isCustom) =>
                  update({
                    ...config,
                    layout: {
                      ...config.layout,
                      font,
                      use_custom_font: isCustom,
                    },
                  })
                }
              />
            </div>
          </div>

          {config.layout.use_custom_font && (
            <div className={isLayoutLocked ? "opacity-60 pointer-events-none" : ""}>
              <div className="mt-4">
                <label className="text-sm font-medium block mb-2">
                  Custom Font
                </label>

                <label
                  className="
        flex cursor-pointer items-center justify-between
        rounded-xl border border-dashed border-gray-300
        px-4 py-4 text-sm
        transition hover:border-gray-400 hover:bg-gray-50
      "
                >
                  <div>
                    <p className="font-medium text-gray-700">
                      Upload font file
                    </p>
                    <p className="text-xs text-gray-500">
                      TTF, OTF, WOFF, WOFF2
                    </p>
                  </div>

                  <span className="
        rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white
      ">
                    Browse
                  </span>

                  <input
                    type="file"
                    hidden
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={(e) =>
                      e.target.files && uploadCustomFont(e.target.files[0])
                    }
                  />
                </label>

                {config.layout.custom_font && (
                  <p className="mt-2 text-xs text-green-600">
                    Font uploaded successfully
                  </p>
                )}
              </div>
            </div>
          )}

          {/* BUTTON STYLE */}
          <div className={isLayoutLocked ? "opacity-60 pointer-events-none" : ""}>
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
                      className={`relative h-12 w-full border transition rounded-xl ${isActive
                        ? "border-black ring-2 ring-gray-300"
                        : "border-gray-300 hover:border-gray-400"
                        }`}
                    >
                      {/* preview button */}
                      <div
                        className={`absolute inset-2 ${shape} border border-gray-400 bg-gray-200`}
                      />

                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTIONS */}
          <div className="mt-10">

            {/* TITLE */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Add Sections to Your Card
              </h3>
            </div>

            {(() => {
              const visibleSections = config.sections.items.filter(
                (s) =>
                  s.enabled &&
                  !["video_gallery"].includes(s.type)
              );

              const hasOnlyProfile =
                visibleSections.length === 1 &&
                visibleSections[0].type === "profile";

              const showEmptyState =
                visibleSections.length === 0 || hasOnlyProfile;

              return showEmptyState ? (
                /* EMPTY STATE */
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center bg-white">

                  <h4 className="text-sm font-semibold text-gray-800">
                    Customize Your Card With Sections
                  </h4>

                  <p className="text-sm text-gray-500 mt-2">
                    Click "+ Add Section" to add contact details, social media, videos, and more.
                  </p>

                  <button
                    type="button"
                    onClick={() => setAddSectionOpen(true)}
                    className="mt-5 px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium transition"
                  >
                    Add Section
                  </button>

                </div>
              ) : (
                <>
                  {/* ADD BUTTON */}
                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setAddSectionOpen(true)}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:opacity-90"
                    >
                      + Add Section
                    </button>
                  </div>

                  {/* REORDER */}
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
                </>
              );
            })()}
          </div>

          {/* BACKGROUND TYPE */}
          <div className={isLayoutLocked ? "opacity-60 pointer-events-none" : ""}>
            <div className="mt-6">
              <p className="text-sm font-medium mb-2">Background Type</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-4">

                {[
                  { id: "solid", label: "Solid Color" },
                  { id: "gradient", label: "Gradient" },
                  { id: "image", label: "Image" },
                  { id: "video", label: "Video" },
                  { id: "waves", label: "Waves" },
                  { id: "polka", label: "Polka Dots" },
                  { id: "stripes", label: "Stripes" },
                  { id: "zigzag", label: "Zigzag" },
                ].map((item) => {
                  const isActive = config.layout.use_background === item.id;

                  return (
                    <div key={item.id} className="text-center">

                      <button
                        type="button"
                        onClick={() =>
                          update({
                            ...config,
                            layout: {
                              ...config.layout,
                              use_background: item.id as any,
                            },
                          })
                        }
                        className={`
            relative w-full aspect-square rounded-2xl overflow-hidden
            border-2 transition
            ${isActive
                            ? "border-black ring-2 ring-gray-300"
                            : "border-gray-200 hover:border-gray-400"}
          `}
                      >

                        {/* PREVIEW AREA */}
                        {item.id === "solid" && (
                          <div className="w-full h-full bg-gray-700" />
                        )}

                        {item.id === "gradient" && (
                          <div className="w-full h-full bg-gradient-to-b from-gray-500 to-gray-800" />
                        )}

                        {item.id === "image" && (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            🖼
                          </div>
                        )}

                        {item.id === "video" && (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            ▶
                          </div>
                        )}

                        {/* SVG BACKGROUNDS */}
                        {["waves", "polka", "stripes", "zigzag"].includes(item.id) && (
                          <img
                            src={`/backgrounds/${item.id}.svg`}   // 👈 use your svg path here
                            alt={item.label}
                            className="w-full h-full object-cover"
                          />
                        )}

                      </button>

                      {/* LABEL */}
                      <p className="mt-3 text-sm font-medium text-gray-800">
                        {item.label}
                      </p>

                    </div>
                  );
                })}

              </div>

            </div>

            {/* SOLID BACKGROUND */}
            {config.layout.use_background === "solid" && (
              <div className="mt-6">
                <p className="text-sm font-medium">Card Background Color</p>

                <div className="mt-2">
                  <ThemeColorRow
                    label="Color"
                    value={config.layout.color1 || "#000000"}
                    disabled={isLayoutLocked}
                    onChange={(val: string) =>
                      update({
                        ...config,
                        layout: { ...config.layout, color1: val },
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

            {["polka", "waves", "stripes", "zigzag"].includes(
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
                <p className="text-sm font-medium mb-2">Gradient Background</p>

                <div className="grid grid-cols-1 gap-4">
                  <ThemeColorRow
                    label="From"
                    value={config.layout.color1 || "#7c3aed"}
                    disabled={isLayoutLocked}
                    onChange={(val: string) =>
                      update({
                        ...config,
                        layout: { ...config.layout, color1: val },
                      })
                    }
                  />

                  <ThemeColorRow
                    label="To"
                    value={config.layout.color2 || "#6366f1"}
                    disabled={isLayoutLocked}
                    onChange={(val: string) =>
                      update({
                        ...config,
                        layout: { ...config.layout, color2: val },
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
        </div>

      </Card>

      {/* <Card title="Profile" desc="Basic information shown on the card">
        <ProfileSection
          profile={config.profile}
          onChange={(p: ProfileConfig) =>
            update({
              ...config,
              profile: {
                ...config.profile,   // 👈 KEEP existing fields
                ...p,                // 👈 overwrite edited ones
              },
            })
          }
          onCropToggle={onCropToggle}   // 👈 ADD
        />
      </Card> */}



      <Card title="Theme" desc="Colors used across the profile">
        {showLockable && (
          <LockControl
            value={config.theme}
            role={config.role}
            onChange={(v) =>
              update({
                ...config,
                theme: { ...config.theme, ...v },
              })
            }
          />
        )}
        <div className="space-y-6">
          {THEME_COLOR_KEYS.map((k) => (
            <ThemeColorRow
              key={k}
              label={THEME_COLOR_LABELS[k]}
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

      {/* <Card title="Video Gallery" desc="Manage your videos">
        {showLockable && (
          <LockControl
            value={config.video_gallery}
            role={config.role}
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
      </Card> */}



      {isSectionEnabled("contact") && (
        <Card title="Contact" desc="Customize contact buttons">
          {showLockable && (
            <LockControl
              value={config.contact}
              role={config.role}
              onChange={(v) =>
                update({ ...config, contact: { ...config.contact, ...v } })
              }
            />
          )}

          <div
            className={
              isReadOnly(config.contact)
                ? "opacity-60 pointer-events-none space-y-2"
                : "space-y-2"
            }
          >
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
      )}

      {isSectionEnabled("social_links") && (
        <Card title="Social Links" desc="Your public social profiles">
          {showLockable && (
            <LockControl
              value={config.social_links}
              role={config.role}
              onChange={(v) =>
                update({
                  ...config,
                  social_links: { ...config.social_links, ...v },
                })
              }
            />
          )}

          {/* ICON PREVIEW (enabled only) */}
          <div
            className={`flex items-center gap-3 mt-3 ${isReadOnly(config.social_links)
              ? "opacity-60 pointer-events-none"
              : ""
              }`}
          >
            {config.social_links.items?.filter((s: any) => s.enabled).length > 0 ? (
              config.social_links.items
                .filter((s: any) => s.enabled === true)
                .map((s: any) => {
                  const Icon = SOCIAL_ICONS[s.id] || SOCIAL_ICONS.website;

                  return (
                    <div
                      key={s.id}
                      className="w-10 h-10 rounded-full border bg-white flex items-center justify-center"
                      title={s.label}
                    >
                      <Icon size={18} />
                    </div>
                  );
                })
            ) : (
              <span className="text-sm text-gray-400">
                No social links added
              </span>
            )}
          </div>

          {/* OPEN MODAL BUTTON */}
          <div className="mt-4">
            <button
              type="button"
              disabled={isReadOnly(config.social_links)}
              onClick={() => {
                setDraftSocialLinks(
                  structuredClone(config.social_links)
                );
                setSocialModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:opacity-90 disabled:opacity-50"
            >
              Add / Manage Social Links
            </button>
          </div>

          {/* MODAL */}
          <CommonModal
            open={socialModalOpen}
            title="Social Links"
            onClose={() => setSocialModalOpen(false)}
            onConfirm={() => {
              if (!draftSocialLinks) return;

              if (hasInvalidSocialLinks(draftSocialLinks.items)) {
                setSocialError("Please fill all social links before saving.");
                return; // ❌ BLOCK SAVE
              }

              setSocialError(null);

              update({
                ...config,
                social_links: draftSocialLinks,
              });

              setSocialModalOpen(false);
            }}

          >
            {draftSocialLinks && (
              <SocialSection
                items={draftSocialLinks.items}
                onChange={(items: any[]) => {
                  setSocialError(null); // 👈 clear error on typing
                  setDraftSocialLinks({
                    ...draftSocialLinks,
                    items,
                  });
                }}

              />
            )}
            {socialError && (
              <p className="text-sm text-red-600 mb-2">
                {socialError}
              </p>
            )}

          </CommonModal>
        </Card>
      )}

      {isSectionEnabled("products") && (
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
                role={config.role}
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
          <div className="px-6 mt-4">
            <button
              type="button"
              disabled={isReadOnly(config.products)}
              onClick={() => {
                // clone current products into draft
                setDraftProducts(config.products.items);
                setProductModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:opacity-90 disabled:opacity-50"
            >
              Add / Manage Products
            </button>

          </div>
          {/* PRODUCTS PREVIEW (scaled-down carousel) */}
          {config.products.items?.length > 0 && (
            <div
              className={`px-6 mt-4 ${isReadOnly(config.products)
                ? "opacity-60 pointer-events-none"
                : ""
                }`}
            >
              <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar">
                {config.products.items
                  .filter((p) => p.enabled !== false)
                  .sort((a, b) => a.rank - b.rank)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="snap-start flex-shrink-0"
                    >
                      <div
                        className="relative w-[140px] h-[90px] rounded-xl overflow-hidden shadow-sm border"
                        style={{ backgroundColor: config.theme.card_background }}
                      >
                        {/* IMAGE */}
                        <img
                          src={p.image_url || p.image_url}
                          alt={p.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />

                        {/* OVERLAY */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                        {/* CONTENT */}
                        <div className="absolute bottom-1.5 left-2 right-2">
                          <p
                            className="text-[11px] font-semibold leading-tight line-clamp-2"
                            style={{ color: config.theme.card_text }}
                          >
                            {p.name}
                          </p>

                          {config.products.toggle_price && (
                            <p
                              className="text-[10px] mt-0.5 font-medium"
                              style={{ color: config.theme.card_text }}
                            >
                              ₹{p.price}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <CommonModal
            open={productModalOpen}
            title="Manage Products"
            description="Select and reorder products for your public card"
            onClose={() => setProductModalOpen(false)}
            onConfirm={() => {
              update({
                ...config,
                products: {
                  ...config.products,
                  items: draftProducts, // ✅ commit changes
                },
              });
              setProductModalOpen(false);
            }}
          >
            {/* === YOUR EXISTING UI (UNCHANGED) === */}
            <div className="px-1">

              <DynamicForm
                fields={productField}
                form={{
                  product_ids: draftProducts.map((p) => p.id),
                }}
                onChange={(_, ids: (string | number)[]) =>
                  setDraftProducts(
                    mergeSelectedProducts(
                      ids,
                      products,
                      draftProducts
                    )
                  )
                }
                errors={formErrors}
                setErrors={setFormErrors}
              />
            </div>

            <div className="px-1 pb-2 border-t mt-4">

              {draftProducts.length > 0 && (
                <div className="space-y-3">
                  <ProductsReorder
                    items={draftProducts}
                    onChange={setDraftProducts}
                  />
                </div>
              )}
            </div>
          </CommonModal>

        </div>
      )}

      {isSectionEnabled("photo_gallery") && (
        <Card title="Photo Gallery" desc="Manage your gallery images">
          {showLockable && (
            <LockControl
              value={config.photo_gallery}
              role={config.role}
              onChange={(v) =>
                update({
                  ...config,
                  photo_gallery: { ...config.photo_gallery, ...v },
                })
              }
            />
          )}

          {/* SECTION LABEL — stays OUTSIDE modal */}
          <div
            className={`space-y-1 ${isReadOnly(config.photo_gallery)
              ? "opacity-60 pointer-events-none"
              : ""
              }`}
          >
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Section label
            </p>
            <Input
              value={config.photo_gallery.section_title}
              disabled={isReadOnly(config.photo_gallery)}
              placeholder="Section title"
              onChange={(v) =>
                update({
                  ...config,
                  photo_gallery: {
                    ...config.photo_gallery,
                    section_title: v,
                  },
                })
              }
            />
          </div>

          {/* OPEN MODAL BUTTON */}
          <div className="mt-4">
            <button
              type="button"
              disabled={isReadOnly(config.photo_gallery)}
              onClick={() => {
                // ✅ clone to draft
                setDraftPhotoGallery(
                  structuredClone(config.photo_gallery)
                );
                setPhotoGalleryModalOpen(true);
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:opacity-90 disabled:opacity-50"
            >
              Add / Manage Photos
            </button>
          </div>

          {/* PREVIEW CAROUSEL */}
          {config.photo_gallery.items?.length > 0 && (
            <div
              className={`mt-4 ${isReadOnly(config.photo_gallery)
                ? "opacity-60 pointer-events-none"
                : ""
                }`}
            >
              <div className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar">
                {config.photo_gallery.items
                  .filter((i) => i.enabled)
                  .sort((a, b) => a.rank - b.rank)
                  .map((item, idx) => (
                    <div
                      key={idx}
                      className="snap-start flex-shrink-0"
                    >
                      <div className="relative w-[140px] h-[100px] rounded-xl overflow-hidden border shadow-sm bg-gray-100">
                        <img
                          src={item.img_url}
                          alt={item.title || "Photo"}
                          className="w-full h-full object-cover"
                        />

                        {/* gradient overlay */}
                        {item.title && (
                          <>
                            <div
                              className="absolute inset-0"
                              style={{
                                background:
                                  "linear-gradient(to top, rgba(0,0,0,.55), transparent)",
                              }}
                            />

                            {/* title */}
                            <div className="absolute bottom-1.5 left-2 right-2">
                              <p className="text-[11px] font-medium text-white leading-tight line-clamp-2">
                                {item.title}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* MODAL */}
          <CommonModal
            open={photoGalleryModalOpen}
            title="Photo Gallery"
            onClose={() => setPhotoGalleryModalOpen(false)}
            onConfirm={() => {
              if (!draftPhotoGallery) return;

              update({
                ...config,
                photo_gallery: draftPhotoGallery,
              });
              setPhotoGalleryModalOpen(false);
            }}
          >
            {draftPhotoGallery && (
              <PhotoGallerySection
                value={draftPhotoGallery}
                disabled={isReadOnly(config.photo_gallery)}
                onChange={(v: PhotoGalleryConfig) =>
                  setDraftPhotoGallery(v)
                }
              />
            )}
          </CommonModal>
        </Card>
      )}

      {isSectionEnabled("banner") && (
        <Card title="Banner" desc="Top banner CTA section">
          {showLockable && (
            <LockControl
              value={config.banner}
              role={config.role}
              currentUser={username}
              onChange={(v) =>
                update({
                  ...config,
                  banner: { ...config.banner, ...v },
                })
              }
            />
          )}

          {/* ENABLE BANNER */}
          <div
            className={`flex items-center gap-3 ${isReadOnly(config.banner)
              ? "opacity-60 pointer-events-none"
              : ""
              }`}
          >
            <p className="text-sm font-medium text-gray-700">
              Enable Banner
            </p>

            <Toggle
              label=""
              value={config.banner.enabled}
              disabled={isReadOnly(config.banner)}
              onChange={(v: boolean) =>
                update({
                  ...config,
                  banner: { ...config.banner, enabled: v },
                })
              }
            />
          </div>

          {/* BANNER IMAGE */}
          <div
            className={`space-y-2 mt-6 ${isReadOnly(config.banner)
              ? "opacity-60 pointer-events-none"
              : ""
              }`}
          >
            <p className="text-sm font-medium text-gray-700">
              Banner Image
            </p>

            <div className="relative h-40 w-full rounded-xl border overflow-hidden bg-gray-50">
              {config.banner.image_url ? (
                <img
                  src={config.banner.image_url}
                  alt="Banner"
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
                    e.target.files &&
                    uploadBannerImage(e.target.files[0])
                  }
                />
              </label>
            </div>
          </div>

          {/* CTA TEXT */}
          <div
            className={`mt-6 ${isReadOnly(config.banner)
              ? "opacity-60 pointer-events-none"
              : ""
              }`}
          >
            <p className="text-sm font-medium text-gray-700 mb-1">
              CTA Button Text
            </p>

            <Input
              value={config.banner.cta_text || ""}
              disabled={isReadOnly(config.banner)}
              onChange={(v) =>
                update({
                  ...config,
                  banner: { ...config.banner, cta_text: v },
                })
              }
              placeholder="e.g. Contact Me"
            />
          </div>

          {/* CTA LINK */}
          <div
            className={`mt-4 ${isReadOnly(config.banner)
              ? "opacity-60 pointer-events-none"
              : ""
              }`}
          >
            <p className="text-sm font-medium text-gray-700 mb-1">
              CTA Button Link
            </p>

            <Input
              value={config.banner.cta_url || ""}
              disabled={isReadOnly(config.banner)}
              onChange={(v) =>
                update({
                  ...config,
                  banner: { ...config.banner, cta_url: v },
                })
              }
              placeholder="https://example.com"
            />
          </div>
        </Card>
      )}

      {isSectionEnabled("youtube") && (
        <Card title="Videos" desc="Manage your YouTube / video links">
          {showLockable && (
            <LockControl
              value={config.youtube}
              role={config.role}
              onChange={(v) =>
                update({
                  ...config,
                  youtube: { ...config.youtube, ...v },
                })
              }
            />
          )}

          {/* SECTION LABEL — stays OUTSIDE modal */}
          <div
            className={`space-y-1 ${isReadOnly(config.youtube)
              ? "opacity-60 pointer-events-none"
              : ""
              }`}
          >
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Section label
            </p>
            <Input
              value={config.youtube.section_title || "Video Gallery"}
              disabled={isReadOnly(config.youtube)}
              placeholder="Section title"
              onChange={(v) =>
                update({
                  ...config,
                  youtube: {
                    ...config.youtube,
                    section_title: v.trim() === "" ? "Video Gallery" : v,
                  },
                })
              }
            />

          </div>

          {/* OPEN MODAL BUTTON — SAME STYLE */}
          <div className="mt-4">
            <button
              type="button"
              disabled={isReadOnly(config.youtube)}
              onClick={() => {
                // ✅ clone to draft
                setDraftYoutube(structuredClone(config.youtube));
                setYoutubeModalOpen(true);
              }}
              className="
        px-4 py-2 rounded-lg
        bg-purple-600 text-white text-sm
        hover:opacity-90
        disabled:opacity-50
      "
            >
              Add / Manage Videos
            </button>
          </div>

          {/* PREVIEW — EMBED LOOK, NON-PLAYABLE */}
          {config.youtube.items?.length > 0 && (
            <div
              className={`mt-4 ${isReadOnly(config.youtube)
                ? "opacity-60 pointer-events-none"
                : ""
                }`}
            >
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {config.youtube.items
                  .filter((v) => v.enabled)
                  .sort((a, b) => a.rank - b.rank)
                  .map((item, idx) => {
                    const videoId = extractYoutubeId(item.url);

                    return (
                      <div
                        key={idx}
                        className="flex-shrink-0 w-[220px]"
                      >
                        <div className="relative aspect-video rounded-lg overflow-hidden border bg-black">
                          {/* EMBED (non-interactive) */}
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}?controls=0&autoplay=0&mute=1&playsinline=1`}
                            className="absolute inset-0 w-full h-full pointer-events-none"
                            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                          />

                          {/* Optional overlay for polish */}
                          <div className="absolute inset-0 bg-black/10" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* MODAL — SAME DRAFT FLOW */}
          <CommonModal
            open={youtubeModalOpen}
            title="Videos"
            description="Add or manage your YouTube / video links"
            onClose={() => setYoutubeModalOpen(false)}
            onConfirm={() => {
              if (!draftYoutube) return;

              update({
                ...config,
                youtube: draftYoutube,
              });
              setYoutubeModalOpen(false);
            }}
          >
            {draftYoutube && (
              <YoutubeSection
                disabled={isReadOnly(config.youtube)}
                items={draftYoutube.items}
                onChange={(items) =>
                  setDraftYoutube({
                    ...draftYoutube,
                    items,
                  })
                }
              />
            )}
          </CommonModal>
        </Card>
      )}

      {isSectionEnabled("meeting") && (
        <Card title="Meeting Button" desc="Book a call / meeting link">
          {showLockable && (
            <LockControl
              value={config.meeting}
              role={config.role}
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
      )}

      {isSectionEnabled("links_files") && (
        <Card title="Links & Files" desc="Add external links or downloadable files">
          {showLockable && (
            <LockControl
              value={config.links_files}
              role={config.role}
              onChange={(v) =>
                update({
                  ...config,
                  links_files: { ...config.links_files, ...v },
                })
              }
            />
          )}

          {/* SECTION LABEL — stays OUTSIDE modal */}
          <div
            className={`space-y-1 ${isReadOnly(config.links_files)
              ? "opacity-60 pointer-events-none"
              : ""
              }`}
          >
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Section label
            </p>
            <Input
              value={config.links_files.section_title || "Links and Files"}
              disabled={isReadOnly(config.links_files)}
              placeholder="Section title"
              onChange={(v) =>
                update({
                  ...config,
                  links_files: {
                    ...config.links_files,
                    section_title: v.trim() === "" ? "Links and Files" : v,
                  },
                })
              }
            />
          </div>

          {/* OPEN MODAL BUTTON — SAME STYLE */}
          <div className="mt-4">
            <button
              type="button"
              disabled={isReadOnly(config.links_files)}
              onClick={() => {
                // ✅ clone current state into draft
                setDraftLinksFiles(structuredClone(config.links_files));
                setLinksFilesModalOpen(true);
              }}
              className="
        px-4 py-2 rounded-lg
        bg-purple-600 text-white text-sm
        hover:opacity-90
        disabled:opacity-50
      "
            >
              Add / Manage Links & Files
            </button>
          </div>

          {/* MODAL */}
          <CommonModal
            open={linksFilesModalOpen}
            title="Links & Files"
            description="Add or manage your external links and files"
            onClose={() => setLinksFilesModalOpen(false)}
            onConfirm={() => {
              if (!draftLinksFiles) return;

              update({
                ...config,
                links_files: draftLinksFiles,
              });
              setLinksFilesModalOpen(false);
            }}
          >
            {draftLinksFiles && (
              <LinksFilesSection
                disabled={isReadOnly(config.links_files)}
                value={draftLinksFiles}
                onChange={(v: any) => setDraftLinksFiles(v)}
              />
            )}
          </CommonModal>
        </Card>
      )}

      <div className="px-6">
        <button
          onClick={save}
          className="w-full py-3 rounded-xl font-semibold text-white bg-purple-600 shadow-lg hover:opacity-90 transition"
        >
          Save Public Profile
        </button>
      </div>

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

      <AddSectionModal
        open={addSectionOpen}
        sections={config.sections.items}
        onClose={() => setAddSectionOpen(false)}
        onAdd={(type: string) => {
          handleAddSection(type);
        }}
      />

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
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-gray-500">{desc}</p>

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

export function ColorPickerField({
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

  useEffect(() => () => setOpen(false), []);
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

    if (spaceBelow < PICKER_H && spaceAbove > PICKER_H) {
      top = r.top - PICKER_H - GAP;
    }

    if (left + PICKER_W > window.innerWidth) {
      left = window.innerWidth - PICKER_W - GAP;
    }

    if (left < GAP) left = GAP;

    setPos({ top, left });
    setOpen(true);
  };

  /* =========================
     DISABLED STATE (UPGRADED)
     ========================= */
  if (disabled) {
    return (
      <div className="w-full rounded-lg border p-4 bg-gray-100 text-gray-400 cursor-not-allowed">
        <div className="grid grid-cols-[1fr_32px] items-center">
          <span className="text-sm capitalize text-left">
            {label}
          </span>

          <span
            className="h-7 w-7 rounded-md border justify-self-end"
            style={{ backgroundColor: value }}
          />
        </div>
      </div>

    );
  }

  /* =========================
     NORMAL STATE (UPGRADED)
     ========================= */
  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={openPicker}
        className="
    w-full rounded-lg border px-4
    hover:bg-gray-50
    focus:outline-none focus:ring-2 focus:ring-blue-500 h-12
  "
      >
        <div className="grid grid-cols-[1fr_32px] items-center">
          {/* Label — locked to LEFT */}
          <span className="text-sm font-medium capitalize text-gray-700 text-left">
            {label}
          </span>

          {/* Color box — locked to RIGHT */}
          <span
            className="h-7 w-7 rounded-md border justify-self-end"
            style={{ backgroundColor: value }}
          />
        </div>
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

function ThemeColorRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const PRESET_COLORS = [
    "#000000",
    "#F87171",
    "#FB7185",
    "#FDBA74",
    "#FDE68A",
    "#6EE7B7",
    "#67E8F9",
    "#93C5FD",
    "#C4B5FD",
  ];

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  // 🔥 Close on scroll
  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    window.addEventListener("scroll", close, true);
    return () => window.removeEventListener("scroll", close, true);
  }, [open]);

  // 🔥 Close on outside click
  useEffect(() => {
    if (!open) return;

    const handleClick = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        pickerRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const openPicker = () => {
    if (!btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();

    const PICKER_W = 280;
    const PICKER_H = 300;
    const GAP = 8;

    let top = rect.bottom + GAP;
    let left = rect.left;

    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // 🔥 If not enough space below → open above
    if (rect.bottom + PICKER_H + GAP > viewportH) {
      top = rect.top - PICKER_H - GAP;
    }

    // 🔥 If still out of viewport (very small screens)
    if (top < GAP) {
      top = GAP;
    }

    // 🔥 Prevent right overflow
    if (rect.left + PICKER_W > viewportW - GAP) {
      left = viewportW - PICKER_W - GAP;
    }

    // 🔥 Prevent left overflow
    if (left < GAP) {
      left = GAP;
    }

    setPos({ top, left });
    setOpen(true);
  };

  return (
    <div className="space-y-2">
      {/* LABEL */}
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium text-gray-800">
          {label}
        </span>
      </div>

      {/* COLOR OPTIONS */}
      <div className="flex items-center gap-3 flex-wrap">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            disabled={disabled}
            onClick={() => onChange(c)}
            className={`
              h-6 w-6 rounded-full border transition
              ${value === c ? "ring-2 ring-black" : "border-gray-200"}
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            style={{ backgroundColor: c }}
          />
        ))}

        {/* CUSTOM PICKER BUTTON */}
        <button
          ref={btnRef}
          disabled={disabled}
          onClick={openPicker}
          className={`
            h-7 w-7 rounded-full border
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
          style={{
            background:
              "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
          }}
        />
      </div>

      {/* PORTAL PICKER */}
      {open &&
        createPortal(
          <div
            ref={pickerRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: 280,
              zIndex: 10000,
            }}
            className="bg-white rounded-xl shadow-xl p-3"
          >
            <ProColorPicker value={value} onChange={onChange} />
          </div>,
          document.body
        )}

    </div>
  );
}

export function LockControl({
  value,
  role,
  currentUser,   // 👈 add this
  onChange,
}: {
  value?: LockMeta & { locked_by?: string };
  role?: string;
  currentUser?: string;   // 👈 logged in username
  onChange: (v: LockMeta) => void;
}) {

  if (!value) return null;

  /* ================= STATE ================= */
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuW, setMenuW] = useState(0);

  /* 🔒 WAS LOCKED (INITIAL STATE ONLY) */
  const wasLockedRef = useRef<boolean>(
    value.lock_mode === "global" && Boolean(value.locked)
  );

  /* ================= MODES ================= */
  const modes: { id: LockMode; label: string }[] = [
    { id: "individual", label: "Individual" },
    { id: "global", label: "Global" },
  ];

  const currentMode: LockMode = value.lock_mode ?? "individual";
  const isIndividual = currentMode === "individual";
  const isGlobal = currentMode === "global";
  const locked = isGlobal && Boolean(value.locked);

  /* ================= HARD LOCK RULE =================
     - vendor_admin → never locked
     - manager → locked ONLY if it was already locked initially
     - vendor_vansh → locked if locked_by contains vendor_vansh
       BUT editable if locked_by === currentUser
  */

  const isVendorLock =
    value.locked &&
    value.locked_by?.includes("vendor");

  const isOwner =
    currentUser &&
    value.locked_by === currentUser;

  const isHardLocked =
    role !== "vendor_admin" &&     // 🔥 vendor_admin is always editable
    !isOwner &&
    (
      (role === "manager" && wasLockedRef.current) ||
      isVendorLock
    );


  const active =
    modes.find((m) => m.id === currentMode) ?? modes[0];

  /* ================= EFFECTS ================= */

  useEffect(() => {
    if (btnRef.current) {
      setMenuW(btnRef.current.offsetWidth);
    }
  }, [active.label]);

  useEffect(() => {
    if (!open || isHardLocked) return;

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
  }, [open, isHardLocked]);

  /* ================= RENDER ================= */

  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">

        {/* LABEL */}
        <span
          className={`text-xs transition
            ${isHardLocked
              ? "text-gray-300 cursor-not-allowed"
              : isIndividual
                ? "text-gray-400 cursor-not-allowed"
                : "text-gray-700"
            }`}
          title={
            isHardLocked
              ? "Locked by admin"
              : "Lock status"
          }
        >
          Locked
        </span>

        {/* TOGGLE */}
        <button
          type="button"
          disabled={isIndividual || isHardLocked}
          onClick={() => {
            if (!isGlobal || isHardLocked) return;

            onChange({
              ...value,
              locked: !locked,
            });

            setOpen(false);
          }}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition
            ${isIndividual || isHardLocked
              ? "bg-gray-200 cursor-not-allowed"
              : locked
                ? "bg-purple-600"
                : "bg-gray-300"
            }`}
        >
          <span
            className={`inline-block h-3 w-3 transform rounded-full bg-white transition
              ${locked ? "translate-x-5" : "translate-x-1"}
            `}
          />
        </button>

        {/* MODE DROPDOWN */}
        <div className="relative">
          <button
            ref={btnRef}
            type="button"
            disabled={isHardLocked}
            onClick={() => !isHardLocked && setOpen((v) => !v)}
            className={`flex items-center justify-between gap-2 border rounded-md px-3 py-1 text-xs min-w-[120px]
              ${isHardLocked
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white"
              }`}
          >
            {active.label}
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {open && !isHardLocked && (
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
                    onChange({
                      ...value,
                      lock_mode: m.id,
                      locked: m.id === "global" ? value.locked : false,
                    });
                    setOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 text-xs hover:bg-purple-50
                    ${active.id === m.id
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

export function Switch({
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

export function FontDropdown({
  value,
  useCustom,
  onChange,
}: {
  value: string;
  useCustom?: boolean;
  onChange: (font: string, isCustom: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuW, setMenuW] = useState(0);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const fonts = [
    "Inter",
    "Roboto",
    "Montserrat",
    "Merriweather",
    "Caveat",
    "Gloria Hallelujah",
    "custom",
  ];

  const activeLabel = useCustom ? "Custom font" : value;

  // sync width
  useEffect(() => {
    if (btnRef.current) setMenuW(btnRef.current.offsetWidth);
  }, [activeLabel]);

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

          // 🔁 close if already open
          if (open) {
            setOpen(false);
            return;
          }

          const r = btnRef.current.getBoundingClientRect();
          const width = btnRef.current.offsetWidth;

          const MENU_H = 220;
          const GAP = 6;

          let top = r.bottom + GAP;
          if (top + MENU_H > window.innerHeight) {
            top = r.top - MENU_H - GAP;
          }

          let left = r.left;
          if (left + width > window.innerWidth) {
            left = window.innerWidth - width - GAP;
          }
          if (left < GAP) left = GAP;

          setMenuW(width);
          setPos({ top, left });
          setOpen(true);
        }}

        className="
          flex w-full items-center justify-between
          rounded-xl border border-gray-300
          bg-white px-4 py-3 text-sm
          shadow-sm transition
          hover:border-gray-400
          focus:outline-none focus:ring-2 focus:ring-black/20
        "
      >
        <span
          className="truncate"
          style={{ fontFamily: !useCustom ? value : undefined }}
        >
          {activeLabel}
        </span>
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
            className="rounded-xl border bg-white shadow-xl overflow-hidden"
          >
            {fonts.map((font) => {
              const isActive =
                (font === "custom" && useCustom) ||
                (!useCustom && value === font);

              return (
                <button
                  key={font}
                  type="button"
                  onClick={() => {
                    onChange(font, font === "custom");
                    setOpen(false);
                  }}
                  style={{
                    fontFamily: font !== "custom" ? font : undefined,
                  }}
                  className={`block w-full text-left px-4 py-2.5 text-sm transition
                    hover:bg-gray-50
                    ${isActive ? "bg-gray-100 font-medium" : ""}
                  `}
                >
                  {font === "custom" ? "Custom font…" : font}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}
