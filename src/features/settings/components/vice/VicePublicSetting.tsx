import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { uploadImage } from "../../../publicProfile/services/publicProfile.api";
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
// import MeetingSection from "./sections/MeetingSections";
import ProfileSection from "./sections/ProfileSection";
import SocialSection, { ALL_SOCIALS } from "./sections/SocialSection";
import { fetchProducts } from "../../../products/slice";
import ResultModal from "../../../../common/ui/ResultModal";
import { AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import CoverCropModal from "../../../../common/ui/CoverCropModal";
// import VideoGallerySection from "./sections/VideoGallerySection";
// import { normalizeApiError } from "../../../../utils/normalizeApiError";
import ContactSection from "./sections/ContactSection";
import { fetchTeam } from "../../../teams/slice"; // adjust 
import AddSectionModal from "./sections/AddSectionModal";
import AppModal from "./ui/AppModal";
import { ShareCardSection } from "./sections/ShareCardSection";
import { Image, Video } from "lucide-react";
import AddSocialModal from "./sections/AddSocialModal";
import CommonItemsReorder from "./sections/CommonItemsReorder";
import CardButtonsSection from "./sections/CardButtonsSection";
import BrandLoader from "../../../../common/ui/BrandLoader";

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

export function isYoutubeRowComplete(item: any) {
  if (!item) return false;

  // required fields
  if (!item.url || item.url.trim() === "") return false;

  // must be a valid youtube link
  return Boolean(isValidUrl(item.url));
}

export function isPhotoRowComplete(item?: any) {
  if (!item) return true;
  if (!item.title || item.title.trim() === "") return false;

  // if link is provided, it must be a valid URL
  if (item.link && item.link.trim() !== "") {
    if (!isValidUrl(item.link.trim())) return false;
  }

  return true;
}

export function isLinkFileRowComplete(item?: any) {
  if (!item) return true;
  if (!item.title || !item.title.trim()) return false;

  if (item.type === "link") {
    if (!item.url || !item.url.trim()) return false;
    return isValidUrl(item.url.trim());
  }

  if (item.type === "file") {
    if (!item.file_url || !item.file_url.trim()) return false;
    return isValidUrl(item.file_url.trim());
  }

  return true;
}

function isValidUrl(url: string): boolean {
  if (!url || !url.trim()) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function isContactFieldComplete(field?: ContactField) {
  if (!field) return true;
  if (!field.label || field.label.trim() === "") return false;
  if (!field.type) return false;

  // if dropdown, must have at least one option and no empty options
  if (field.type === "dropdown") {
    if (!field.options || field.options.length === 0) return false;
    if (field.options.some((opt) => !opt || opt.trim() === "")) return false;
  }

  return true;
}

export function canAddContactField(fields: ContactField[]) {
  if (!fields.length) return true;
  return isContactFieldComplete(fields[fields.length - 1]);
}

// platforms that take a phone number
export const PHONE_PLATFORMS = ["whatsapp", "phone", "sms"];

// platforms that take an email
export const EMAIL_PLATFORMS = ["email"];

// platforms that take free text (no URL validation)
export const TEXT_PLATFORMS = ["address"];

export function getSocialInputType(platform: string): "phone" | "email" | "text" | "url" {
  if (PHONE_PLATFORMS.includes(platform)) return "phone";
  if (EMAIL_PLATFORMS.includes(platform)) return "email";
  return "url";
}

export function isValidPhone(val: string): boolean {
  // digits only after stripping spaces/dashes/parens, must be 10–15 digits
  const digits = val.trim().replace(/[\s\-()+]/g, "");
  return /^\d{10,15}$/.test(digits);
}

export function isValidEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

export function isValidSocialValue(platform: string, value: string): boolean {
  if (!value || !value.trim()) return false;
  const type = getSocialInputType(platform);
  if (type === "phone") return isValidPhone(value);
  if (type === "email") return isValidEmail(value);
  if (type === "text") return value.trim().length > 0;
  return isValidUrl(value); // url
}

export function hasInvalidSocialLinks(items: any[] = []) {
  return items.some(
    (i) =>
      i.enabled === true &&
      (!i.url || i.url.trim() === "" || !isValidSocialValue(i.platform || i.id, i.url))
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

export interface CardButtonItem {
  id: string;
  title: string;
  link: string;
  rank: number;
  enabled: boolean;
}

export interface CardButtonsConfig extends LockMeta {
  locked_by: string;
  items: CardButtonItem[];
}

export interface ContactField {
  id: string;
  type: "text" | "textarea" | "dropdown" | "checkbox";
  label: string;
  placeholder?: string;
  required: boolean;
  enabled: boolean;
  rank: number;

  options?: string[];   // ✅ ADD THIS
}

export interface ContactConfig extends LockMeta {
  connect_title: string;
  contact_title: string;
  form_title?: string;
  locked_by: string;
  fields: ContactField[];
}


export interface LayoutConfig extends LockMeta {
  profile_type: ProfileLayoutType;
  is_fade: boolean;
  font: string;
  card_alignment: "left" | "center" | "right";

  // NEW
  background_image?: string;
  background_color?: string;
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


// export interface MeetingConfig extends LockMeta {
//   enabled: boolean;
//   type: string;
//   meeting_url: string;
//   button_text: string;
//   locked_by: string;
// }
export interface CoverConfig extends LockMeta {
  cover_url?: string;
  locked_by: string;
}

export interface PhotoGalleryItem {
  id?: string;
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

export interface SocialLinkItem {
  id: string;
  platform: string;
  url: string;
  enabled: boolean;
  rank: number;        // ✅ ADD THIS
  country_code?: string;
}
const MAX_VIDEO_SIZE = 20 * 1024 * 1024; // 20MB
export interface SocialLinksConfig extends LockMeta {
  locked_by: string;
  items: SocialLinkItem[];
}

interface PublicProfileConfig {
  role: string;
  layout: LayoutConfig;
  profile: ProfileConfig;
  cover: CoverConfig;
  theme: ThemeConfig;
  contact: ContactConfig;
  banner: BannerConfig;

  // meeting: MeetingConfig;

  social_links: SocialLinksConfig;

  card_buttons: CardButtonsConfig;
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

function getChangedFields<T>(current: T, original: T): Partial<T> {
  // 🔥 If original missing → everything changed
  if (original === undefined || original === null) {
    return current as any;
  }

  // 🔥 If values are strictly equal → no change
  if (current === original) {
    return {} as any;
  }

  // 🔥 Handle primitive values (string, number, boolean, null)
  const isPrimitive = (val: any) =>
    val === null || typeof val !== "object";

  if (isPrimitive(current) || isPrimitive(original)) {
    return current !== original ? (current as any) : ({} as any);
  }

  // 🔥 Handle Arrays
  if (Array.isArray(current) && Array.isArray(original)) {
    if (current.length !== original.length) {
      return current as any;
    }

    for (let i = 0; i < current.length; i++) {
      const diff = getChangedFields(current[i], original[i]);

      const hasChange =
        typeof diff !== "object"        // primitive that changed
          ? true
          : Array.isArray(diff)         // array that changed
            ? diff.length > 0
            : Object.keys(diff).length > 0; // object that changed

      if (hasChange) {
        return current as any;
      }
    }

    return {} as any;
  }

  // 🔥 Handle Objects
  const result: any = {};

  const currentKeys = Object.keys(current as any);
  const originalKeys = Object.keys(original as any);

  // 🔥 Detect removed keys
  for (const key of originalKeys) {
    if (!(key in (current as any))) {
      result[key] = undefined;
    }
  }

  for (const key of currentKeys) {
    const currVal = (current as any)[key];
    const origVal = (original as any)[key];

    const diff = getChangedFields(currVal, origVal);

    if (Array.isArray(diff)) {
      // array returned as-is when changed
      result[key] = currVal;
    } else if (typeof diff !== "object") {
      // 🔥 primitive diff — assign regardless of truthiness
      // this fixes: false, 0, "" being skipped by a falsy check
      result[key] = currVal;
    } else if (Object.keys(diff).length > 0) {
      // nested object had changes
      result[key] = currVal;
    }
    // empty object {} means no change → skip
  }

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
  const [modalError, setModalError] = useState<string | null>(null);
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
  function CustomSelect({
    value,
    onChange,
  }: {
    value: "link" | "upload";
    onChange: (v: "link" | "upload") => void;
  }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [pos, setPos] = useState({ top: 0, left: 0 });
    const [menuW, setMenuW] = useState(0);

    const options = [
      { value: "link", label: "Video Link" },
      { value: "upload", label: "Upload Video" },
    ];

    const active = options.find((o) => o.value === value);

    /* close on outside click */
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

    const openDropdown = () => {
      if (!btnRef.current) return;

      if (open) {
        setOpen(false);
        return;
      }

      const r = btnRef.current.getBoundingClientRect();
      const width = btnRef.current.offsetWidth;

      const MENU_H = 120;
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
    };

    return (
      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          onClick={openDropdown}
          className="
          w-full flex items-center justify-between
          rounded-xl border border-gray-300
          bg-white px-4 py-3 text-sm
          shadow-sm transition
          hover:border-gray-400
          focus:outline-none focus:ring-2 focus:ring-purple-500
        "
        >
          <span>{active?.label}</span>

          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""
              }`}
          />
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
              className="bg-white border rounded-xl shadow-xl overflow-hidden"
            >
              {options.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    onChange(o.value as any);
                    setOpen(false);
                  }}
                  className={`
                  w-full text-left px-4 py-3 text-sm transition
                  hover:bg-purple-50
                  ${value === o.value
                      ? "bg-purple-100 text-purple-700 font-medium"
                      : ""
                    }
                `}
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
  const [config, setConfig] = useState<PublicProfileConfig | null>(null);

  /* ---------- Product search state ---------- */
  const [productSearch, setProductSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [hasNextProducts, setHasNextProducts] = useState(true);
  const [loadingMoreProducts, setLoadingMoreProducts] = useState(false);

  const [socialError, setSocialError] = useState<string | null>(null);
  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [cameFromAddModal, setCameFromAddModal] = useState(false);
  const [pendingSection, setPendingSection] = useState<string | null>(null);
  const [isAddSocialOpen, setIsAddSocialOpen] = useState(false);

  /* ---------- Team search state ---------- */
  const [teamSearch, setTeamSearch] = useState("");
  const [teamPage, setTeamPage] = useState(1);
  const [hasNextTeam, setHasNextTeam] = useState(true);
  const [loadingMoreTeam, setLoadingMoreTeam] = useState(false);
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);

  // Modal States
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [sectionDraft, setSectionDraft] = useState<any>(null);

  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

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

    if (hasInvalidSocialLinks(config?.social_links.items)) {
      setResultSuccess(false);
      setResultMessage(
        "One or more social links have an invalid URL. Make sure all links start with https:// or http:// "
      );
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

  // const uploadBannerImage = async (file: File) => {
  //   const res = await uploadImage(file);
  //   update({
  //     ...config!,
  //     banner: {
  //       ...config!.banner,
  //       image_url: res.data.url, // 👈 API response
  //     },
  //   });
  // };

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

  // const isSectionEnabled = (type: string) => {
  //   return config?.sections.items?.some(
  //     (s) => s.type === type && s.enabled
  //   );
  // };

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
    let changedPayload = getChangedFields(config, originalConfig);

    // 🔥 Remove UI-only ids from card_buttons
    if (changedPayload.card_buttons?.items) {
      changedPayload = {
        ...changedPayload,
        card_buttons: {
          ...changedPayload.card_buttons,
          items: changedPayload.card_buttons.items.map(
            ({ id, ...rest }: any) => rest
          ),
        },
      };
    }
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
  const role = useAppSelector((s) => s.auth.role);

  if (loading || !config)
    return <div className="text-gray-400">
      <BrandLoader />
    </div>;

  const isReadOnly = (meta?: { locked?: boolean }) =>
    meta?.locked === true && role !== "vendor_admin";

  const SECTION_COMPONENTS: Record<string, React.ReactNode> = {
    // meeting: sectionDraft && (
    //   <div className="space-y-6">

    //     {showLockable && (
    //       <LockControl
    //         value={sectionDraft}
    //         role={config.role}
    //         currentUser={username}
    //         onChange={(v) =>
    //           setSectionDraft({
    //             ...sectionDraft,
    //             ...v,
    //           })
    //         }
    //       />
    //     )}

    //     <MeetingSection
    //       disabled={isReadOnly(sectionDraft)}
    //       value={sectionDraft}
    //       onChange={(v) => setSectionDraft(v)}
    //     />
    //   </div>
    // ),

    youtube: sectionDraft && (
      <div className="space-y-6">

        {/* 🔒 LOCK CONTROL */}
        {showLockable && (
          <LockControl
            value={sectionDraft}
            role={config.role}
            currentUser={username}
            onChange={(v) =>
              setSectionDraft({
                ...sectionDraft,
                ...v,
              })
            }
          />
        )}

        {/* GALLERY TITLE */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Gallery Title
          </label>
          <input
            type="text"
            value={sectionDraft.section_title || ""}
            disabled={isReadOnly(sectionDraft)}
            onChange={(e) =>
              setSectionDraft({
                ...sectionDraft,
                section_title: e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Enter a section title"
          />
        </div>

        {/* VIDEO CARDS */}
        <div
          className={`space-y-4 ${isReadOnly(sectionDraft)
            ? "opacity-60 pointer-events-none"
            : ""
            }`}
        >
          <CommonItemsReorder
            items={sectionDraft.items}
            onChange={(items: any) =>
              setSectionDraft({
                ...sectionDraft,
                items,
              })
            }
            renderItem={(item: any, index: number) => (
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">
                    Video {index + 1}
                  </span>

                  <button
                    onClick={() => {
                      const next = sectionDraft.items
                        .filter((i: any) => i.id !== item.id)
                        .map((v: any, i: number) => ({
                          ...v,
                          rank: i + 1,
                        }));

                      setSectionDraft({
                        ...sectionDraft,
                        items: next,
                      });
                    }}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>

                {/* TYPE SELECT */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-500">Video Type</label>

                  <CustomSelect
                    value={item.type || "link"}
                    onChange={(val: "link" | "upload") => {
                      const next = [...sectionDraft.items];

                      next[index] = {
                        ...item,
                        type: val,
                        url: "",
                      };

                      setSectionDraft({
                        ...sectionDraft,
                        items: next,
                      });
                    }}
                  />
                </div>

                {/* LINK INPUT */}
                {item.type === "link" && (
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">
                      Video URL
                    </label>

                    <input
                      value={item.url || ""}
                      onChange={(e) => {
                        let url = e.target.value ?? "";

                        const looksLikeDomain =
                          /^[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}(\/.*)?$/.test(url.trim());

                        if (
                          url.trim() !== "" &&
                          !url.startsWith("http://") &&
                          !url.startsWith("https://") &&
                          looksLikeDomain
                        ) {
                          url = "https://" + url.trim();
                        }

                        const next = [...sectionDraft.items];
                        next[index] = {
                          ...item,
                          url,
                        };

                        setSectionDraft({
                          ...sectionDraft,
                          items: next,
                        });
                      }}
                      className="w-full rounded-xl border px-4 py-3"
                      placeholder="Enter a video link"
                    />
                  </div>
                )}

                {/* VIDEO UPLOAD */}
                {item.type === "upload" && (
                  <div className="space-y-1">
                    <label className="text-xs text-gray-500">
                      Upload Video
                    </label>

                    <div className="border-2 border-dashed rounded-xl p-4 text-center">
                      {item.url ? (
                        <div className="space-y-2">
                          <video
                            src={item.url}
                            controls
                            className="w-full rounded-lg"
                          />

                          <button
                            onClick={() => {
                              const next = [...sectionDraft.items];
                              next[index] = {
                                ...item,
                                url: "",
                              };

                              setSectionDraft({
                                ...sectionDraft,
                                items: next,
                              });
                            }}
                            className="text-red-500 text-sm"
                          >
                            Remove Video
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept="video/*"
                            id={`video-upload-${item.id}`}
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              if (file.size > MAX_VIDEO_SIZE) {
                                alert("Video must be less than 20MB");
                                return;
                              }

                              // Example upload API call
                              uploadImage(file).then((res: any) => {
                                const uploadedUrl = res?.data?.url;

                                const next = [...sectionDraft.items];
                                next[index] = {
                                  ...item,
                                  url: uploadedUrl,
                                };

                                setSectionDraft({
                                  ...sectionDraft,
                                  items: next,
                                });
                              });
                            }}
                          />

                          <label
                            htmlFor={`video-upload-${item.id}`}
                            className="cursor-pointer text-indigo-600 font-medium"
                          >
                            Click to upload video
                          </label>

                          <p className="text-xs text-gray-400 mt-1">
                            Max 20MB
                          </p>
                        </>
                      )}

                    </div>
                  </div>

                )}

              </div>
            )}
          />
        </div>

        {/* ADD BUTTON */}
        {!isReadOnly(sectionDraft) && (
          <>
            {youtubeError && (
              <p className="text-sm text-red-600 mt-2">
                {youtubeError}
              </p>
            )}
            <button
              onClick={() => {
                const last =
                  sectionDraft.items[sectionDraft.items.length - 1];

                if (!last || !last.url?.trim()) {
                  setYoutubeError(
                    "Please enter a valid Video link before adding another video."
                  );
                  return;
                }

                if (!isYoutubeRowComplete(last)) {
                  setYoutubeError(
                    "Please enter a valid Video URL."
                  );
                  return;
                }

                setYoutubeError(null);

                setSectionDraft({
                  ...sectionDraft,
                  items: [
                    ...sectionDraft.items,
                    {
                      id: crypto.randomUUID(),
                      type: "link",   // ✅ DEFAULT TYPE
                      url: "",
                      rank: sectionDraft.items.length + 1,
                      enabled: true,
                    },
                  ],
                });
              }}
              className="w-full border rounded-xl py-3 text-sm font-medium hover:bg-gray-50"
            >
              + Add Another Video
            </button>
          </>
        )}
      </div>
    ),

    links_files: sectionDraft && (
      <div className="space-y-6">

        {/* 🔒 LOCK CONTROL */}
        {showLockable && (
          <LockControl
            value={sectionDraft}
            role={config.role}
            currentUser={username}
            onChange={(v) =>
              setSectionDraft({
                ...sectionDraft,
                ...v,
              })
            }
          />
        )}

        <LinksFilesSection
          disabled={isReadOnly(sectionDraft)}
          value={sectionDraft}
          onChange={(v) => setSectionDraft(v)}
        />
      </div>
    ),

    photo_gallery: sectionDraft && (
      <div className="space-y-6">

        {/* 🔒 LOCK CONTROL */}
        {showLockable && (
          <LockControl
            value={sectionDraft}
            role={config.role}
            currentUser={username}
            onChange={(v) =>
              setSectionDraft({
                ...sectionDraft,
                ...v,
              })
            }
          />
        )}

        {/* GALLERY TITLE */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Gallery Title
          </label>
          <input
            type="text"
            value={sectionDraft.section_title || ""}
            disabled={isReadOnly(sectionDraft)}
            onChange={(e) =>
              setSectionDraft({
                ...sectionDraft,
                section_title: e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Enter a section title"
          />
        </div>

        {/* PHOTO ITEMS */}
        <div
          className={`space-y-6 ${isReadOnly(sectionDraft)
            ? "opacity-60 pointer-events-none"
            : ""
            }`}
        >
          <CommonItemsReorder
            items={sectionDraft.items}
            onChange={(items: any[]) =>
              setSectionDraft({
                ...sectionDraft,
                items,
              })
            }
            renderItem={(item: any, index: number) => (
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">

                {/* ACTION ROW */}
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      const next = sectionDraft.items
                        .filter((i: any) => i.id !== item.id)
                        .map((v: any, i: number) => ({
                          ...v,
                          rank: i + 1,
                        }));

                      setSectionDraft({
                        ...sectionDraft,
                        items: next,
                      });
                    }}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </div>

                {/* IMAGE UPLOAD PREVIEW */}
                <div className="relative border-2 border-dashed rounded-xl p-4 group cursor-pointer">

                  {/* HIDDEN FILE INPUT */}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer z-20"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      const res = await uploadImage(file);

                      const next = [...sectionDraft.items];
                      next[index] = {
                        ...item,
                        img_url: res.data.url,
                      };

                      setSectionDraft({
                        ...sectionDraft,
                        items: next,
                      });
                    }}
                  />

                  {item.img_url ? (
                    <>
                      <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                        <img
                          src={item.img_url}
                          className="absolute inset-0 w-full h-full object-cover"
                          alt="Preview"
                        />
                      </div>

                      {/* HOVER OVERLAY */}
                      <div className="
        absolute inset-0
        bg-black/40
        flex items-center justify-center
        opacity-0 group-hover:opacity-100
        transition
        rounded-xl
        z-10
      ">
                        <span className="px-4 py-2 bg-gray-100/40 text-sm font-medium rounded-full shadow">
                          Change Photo
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center aspect-video text-gray-500">
                      Click to add a photo
                    </div>
                  )}
                </div>

                {/* TITLE */}
                <div>
                  <label className="text-sm text-gray-500">
                    Title
                  </label>
                  <input
                    value={item.title || ""}
                    onChange={(e) => {
                      const next = [...sectionDraft.items];
                      next[index] = {
                        ...item,
                        title: e.target.value,
                      };
                      setSectionDraft({
                        ...sectionDraft,
                        items: next,
                      });
                    }}
                    className="w-full mt-1 rounded-xl border px-4 py-3"
                    placeholder="Enter a title"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-sm text-gray-500">
                    Description
                  </label>

                  <textarea
                    value={item.description || ""}
                    onChange={(e) => {
                      const next = [...sectionDraft.items];
                      next[index] = {
                        ...item,
                        description: e.target.value,
                      };

                      setSectionDraft({
                        ...sectionDraft,
                        items: next,
                      });
                    }}
                    className="w-full mt-1 rounded-xl border px-4 py-3 text-sm"
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                {/* URL */}
                <div>
                  <label className="text-sm text-gray-500">
                    URL
                  </label>

                  <input
                    value={item.link || ""}
                    onChange={(e) => {
                      let url = e.target.value ?? "";

                      const looksLikeDomain =
                        /^[^\s]+\.[a-zA-Z]{1,}(\/.*)?$/.test(url.trim());

                      if (
                        url.trim() !== "" &&
                        !url.startsWith("http://") &&
                        !url.startsWith("https://") &&
                        looksLikeDomain
                      ) {
                        url = "https://" + url.trim();
                      }

                      const next = [...sectionDraft.items];
                      next[index] = {
                        ...item,
                        link: url,
                      };

                      setSectionDraft({
                        ...sectionDraft,
                        items: next,
                      });
                    }}
                    className="w-full mt-1 rounded-xl border px-4 py-3"
                    placeholder="Enter an URL"
                  />
                </div>
              </div>
            )}
          />
        </div>
        {/* ADD PHOTO */}
        {!isReadOnly(sectionDraft) && (
          <>
            {photoError && (
              <p className="text-sm text-red-600">
                {photoError}
              </p>
            )}

            <button
              onClick={() => {
                const last =
                  sectionDraft.items[sectionDraft.items.length - 1];

                if (!isPhotoRowComplete(last)) {
                  setPhotoError(
                    "Please complete the previous photo before adding another."
                  );
                  return;
                }

                setPhotoError(null);

                setSectionDraft({
                  ...sectionDraft,
                  items: [
                    ...sectionDraft.items,
                    {
                      id: crypto.randomUUID(),
                      title: "",
                      description: "",
                      link: "",
                      img_url: "",
                      rank: sectionDraft.items.length + 1,
                      enabled: true,
                    },
                  ],
                });
              }}
              className="w-full border rounded-xl py-3 text-sm font-medium hover:bg-gray-50"
            >
              + Upload Photo File
            </button>
          </>
        )}

      </div>
    ),

    social_links: sectionDraft && (
      <div className="space-y-4">

        {showLockable && (
          <LockControl
            value={sectionDraft}
            role={config.role}
            currentUser={username}
            onChange={(v) =>
              setSectionDraft({
                ...sectionDraft,
                ...v,
              })
            }
          />
        )}

        <SocialSection
          items={sectionDraft.items}
          disabled={isReadOnly(sectionDraft)}
          onChange={(items: any[]) => {
            setSocialError(null);

            const normalized = items.map((item, index) => {
              const inputType = getSocialInputType(item.platform || item.id);
              let url = item.url ?? "";

              // Auto-prefix https:// or http:// for URL-type socials
              // Auto-prefix https:// or http:// only if value looks like a real domain (has a TLD)
              const looksLikeDomain = /^[^\s]+\.[a-zA-Z]{1,}(\/.*)?$/.test(url.trim());

              if (
                inputType === "url" &&
                url.trim() !== "" &&
                !url.startsWith("http://") &&
                !url.startsWith("https://") &&
                looksLikeDomain
              ) {
                url = "https://" + url.trim();
              }

              return {
                ...item,
                url,
                rank: index + 1,
                country_code: item.country_code || "+91",
              };
            });

            setSectionDraft({
              ...sectionDraft,
              items: normalized,
            });
          }}
          onAddClick={() => {
            setActiveSection(null);
            setIsAddSocialOpen(true);
          }}
        />
        {socialError && (
          <p className="text-sm text-red-600">
            {socialError}
          </p>
        )}

      </div>
    ),

    products: sectionDraft && (
      <div className="space-y-6">

        {/* 🔒 LOCK CONTROL */}
        {showLockable && (
          <LockControl
            value={sectionDraft}
            role={config.role}
            currentUser={username}
            onChange={(v) =>
              setSectionDraft({
                ...sectionDraft,
                ...v,
              })
            }
          />
        )}

        {/* TOGGLE PRICE */}
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 bg-white ${isReadOnly(sectionDraft)
            ? "opacity-60 pointer-events-none"
            : ""
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
            label=""
            value={sectionDraft.toggle_price}
            onChange={(v) =>
              !isReadOnly(sectionDraft) &&
              setSectionDraft({
                ...sectionDraft,
                toggle_price: v,
              })
            }
          />
        </div>

        {/* SECTION TITLE */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Section Title
          </label>

          <input
            type="text"
            value={sectionDraft.section_title}
            disabled={isReadOnly(sectionDraft)}
            onChange={(e) =>
              setSectionDraft({
                ...sectionDraft,
                section_title: e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3 focus:ring-2 focus:ring-purple-500"
            placeholder="Products"
          />
        </div>


        {/* PRODUCT SELECT */}
        <div
          className={`${isReadOnly(sectionDraft)
            ? "opacity-60 pointer-events-none"
            : ""
            }`}
        >
          <DynamicForm
            className="p-0"
            fields={productField}
            form={{
              product_ids: sectionDraft.items.map((p: any) => p.id),
            }}
            onChange={(_, ids) =>
              setSectionDraft({
                ...sectionDraft,
                items: mergeSelectedProducts(
                  ids,
                  products,
                  sectionDraft.items
                ),
              })
            }
            errors={formErrors}
            setErrors={setFormErrors}
          />

        </div>

        {/* REORDER */}
        {sectionDraft.items?.length > 0 && (
          <ProductsReorder
            disabled={isReadOnly(sectionDraft)}
            items={sectionDraft.items}
            onChange={(items) =>
              setSectionDraft({
                ...sectionDraft,
                items,
              })
            }
          />
        )}

      </div>
    ),

    contact: sectionDraft && (
      <div className="space-y-6">

        {showLockable && (
          <LockControl
            value={sectionDraft}
            role={config.role}
            currentUser={username}
            onChange={(v) =>
              setSectionDraft({
                ...sectionDraft,
                ...v,
              })
            }
          />
        )}

        <ContactSection
          value={sectionDraft}
          disabled={isReadOnly(sectionDraft)}
          onChange={(v) => setSectionDraft(v)}
        />
      </div>
    ),

    about: sectionDraft && (
      <div className="">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Bio
          </label>

          <textarea
            value={sectionDraft.description || ""}
            rows={4}
            onChange={(e) =>
              setSectionDraft({
                ...sectionDraft,
                description: e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Enter a description"
          />
        </div>
      </div>
    ),

    banner: sectionDraft && (
      <div className="space-y-6">

        {/* 🔒 LOCK CONTROL */}
        {showLockable && (
          <LockControl
            value={sectionDraft}
            role={config.role}
            currentUser={username}
            onChange={(v) =>
              setSectionDraft({
                ...sectionDraft,
                ...v,
              })
            }
          />
        )}

        {/* ENABLE TOGGLE */}
        <Switch
          label="Enable Banner"
          value={sectionDraft.enabled}
          disabled={isReadOnly(sectionDraft)}
          onChange={(v) =>
            setSectionDraft({
              ...sectionDraft,
              enabled: v,
            })
          }
        />

        {/* IMAGE UPLOAD */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Banner Image
          </p>

          <div
            className={`relative h-40 w-full rounded-xl border overflow-hidden bg-gray-50 transition
    ${isReadOnly(sectionDraft) ? "opacity-60 pointer-events-none" : "hover:bg-gray-100"}
  `}
          >
            {sectionDraft.image_url ? (
              <>
                <img
                  src={sectionDraft.image_url}
                  className="w-full h-full object-cover"
                />

                {/* REMOVE BUTTON */}
                {!isReadOnly(sectionDraft) && (
                  <button
                    type="button"
                    onClick={() =>
                      setSectionDraft({
                        ...sectionDraft,
                        image_url: "",
                      })
                    }
                    className="absolute top-2 right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-md hover:bg-red-600 z-20"
                  >
                    Remove
                  </button>
                )}
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                No banner image
              </div>
            )}

            {!isReadOnly(sectionDraft) && (
              <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 hover:opacity-100 cursor-pointer transition">
                Upload
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const res = await uploadImage(file);

                    setSectionDraft({
                      ...sectionDraft,
                      image_url: res.data.url,
                    });
                  }}
                />
              </label>
            )}
          </div>
        </div>

        {/* CTA TEXT */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            CTA Text
          </label>
          <input
            value={sectionDraft.cta_text || ""}
            disabled={isReadOnly(sectionDraft)}
            onChange={(e) =>
              setSectionDraft({
                ...sectionDraft,
                cta_text: e.target.value,
              })
            }
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Enter a text"
          />
        </div>

        {/* CTA URL */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            CTA URL
          </label>
          <input
            disabled={isReadOnly(sectionDraft)}
            value={sectionDraft.cta_url || ""}
            onChange={(e) => {
              let url = e.target.value ?? "";

              const looksLikeDomain =
                /^[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}(\/.*)?$/.test(url.trim());

              if (
                url.trim() !== "" &&
                !url.startsWith("http://") &&
                !url.startsWith("https://") &&
                looksLikeDomain
              ) {
                url = "https://" + url.trim();
              }

              setSectionDraft({
                ...sectionDraft,
                cta_url: url,
              });
            }}
            className="w-full rounded-xl border px-4 py-3"
            placeholder="Enter a URL"
          />
        </div>

      </div>
    ),

    card_buttons: sectionDraft && (
      <div className="space-y-6">
        {showLockable && (
          <LockControl
            value={sectionDraft}
            role={config.role}
            currentUser={username}
            onChange={(v) =>
              setSectionDraft({
                ...sectionDraft,
                ...v,
              })
            }
          />
        )}

        <CardButtonsSection
          value={sectionDraft}
          disabled={isReadOnly(sectionDraft)}
          onChange={(v) => setSectionDraft(v)}
        />
      </div>
    ),
  };

  const SECTION_LABELS: Record<string, string> = {
    // meeting: "Meeting Button",
    youtube: "Videos",
    links_files: "Links & Files",
    photo_gallery: "Photo Gallery",
    social_links: "Social Links",
    products: "Products",
    contact: "Lead Capture",
    banner: "Banner",
    about: "About",
    card_buttons: "Card Buttons",
  };

  const validateSectionDraft = (): boolean => {
    if (!activeSection || !sectionDraft) return false;

    if (activeSection === "card_buttons") {
      for (const btn of sectionDraft.items || []) {
        if (!btn.title?.trim()) {
          setModalError("Each button must have a title.");
          return false;
        }

        if (!btn.link?.trim()) {
          setModalError(`Button "${btn.title}" is missing a link.`);
          return false;
        }

        let link = btn.link.trim();

        // Normalize link (auto add https://)
        const looksLikeDomain =
          /^[a-zA-Z0-9.-]+\.[a-zA-Z]{1,}(\/.*)?$/.test(link);

        if (
          !link.startsWith("http://") &&
          !link.startsWith("https://") &&
          looksLikeDomain
        ) {
          link = "https://" + link;
        }

        if (!isValidUrl(link)) {
          setModalError(
            `Button "${btn.title}" has an invalid URL. Make sure it starts with https:// or http://`
          );
          return false;
        }
      }
    }

    if (activeSection === "banner") {

      if (sectionDraft.enabled) {

        // ✅ Require banner image
        if (!sectionDraft.image_url?.trim()) {
          setModalError("Please upload a banner image.");
          return false;
        }

        // CTA URL validation
        if (sectionDraft.cta_url?.trim()) {
          if (!isValidUrl(sectionDraft.cta_url.trim())) {
            setModalError(
              "CTA URL is invalid. Make sure it starts with https:// or http:// "
            );
            return false;
          }
        }

      }
    }
    // if (activeSection === "meeting") {
    //   if (sectionDraft.enabled) {
    //     if (!sectionDraft.meeting_url?.trim()) {
    //       setModalError("Please enter a meeting URL.");
    //       return false;
    //     }
    //     if (!isValidUrl(sectionDraft.meeting_url.trim())) {
    //       setModalError(
    //         "Meeting URL is invalid. Make sure it starts with https:// or http:// "
    //       );
    //       return false;
    //     }
    //   }
    // }
    // YouTube
    if (activeSection === "youtube") {
      for (let i = 0; i < sectionDraft.items.length; i++) {
        const item = sectionDraft.items[i];

        if (!item.url?.trim()) {
          setModalError(`Video ${i + 1} is missing a Video link.`);
          return false;
        }

        if (!isYoutubeRowComplete(item)) {
          setModalError(`Video ${i + 1} has an invalid Video link.`);
          return false;
        }
      }
    }

    // Photo Gallery
    if (activeSection === "photo_gallery") {
      for (const item of sectionDraft.items) {

        if (!item.title?.trim()) {
          setModalError("Each photo must have a title.");
          return false;
        }

        // Validate image URL
        if (!item.img_url?.trim()) {
          setModalError(`Photo "${item.title}" is missing an uploaded image.`);
          return false;
        }

        if (!isValidUrl(item.img_url.trim())) {
          setModalError(
            `Photo "${item.title}" has an invalid image URL. Make sure it starts with https:// or http://`
          );
          return false;
        }
      }
    }

    // Social Links
    if (activeSection === "social_links") {
      // Normalize URLs before validating (auto-prefix https:// or http://)
      const normalizedItems = (sectionDraft.items ?? []).map((item: any) => {
        const inputType = getSocialInputType(item.platform || item.id);
        let url = item.url ?? "";
        const looksLikeDomain = /^[^\s]+\.[a-zA-Z]{1,}(\/.*)?$/.test(url.trim());
        if (
          inputType === "url" &&
          url.trim() !== "" &&
          !url.startsWith("http://") &&
          !url.startsWith("https://") &&
          looksLikeDomain
        ) {
          url = "https://" + url.trim();
        }
        return { ...item, url };
      });

      // Update the draft with normalized URLs before saving
      setSectionDraft({ ...sectionDraft, items: normalizedItems });

      for (const item of normalizedItems) {
        if (!item.enabled) continue;
        if (!item.url?.trim()) {
          setModalError(`Please enter a value for ${item.platform || item.id}.`);
          return false;
        }
        if (!isValidSocialValue(item.platform || item.id, item.url)) {
          const type = getSocialInputType(item.platform || item.id);
          const hint =
            type === "phone" ? "Enter a valid phone number (e.g. 1234567890)." :
              type === "email" ? "Enter a valid email address." :
                "Make sure the URL starts with https:// or http://";
          setModalError(`Invalid value for ${item.platform || item.id}: ${hint}`);
          return false;
        }
      }
    }

    // Links & Files
    if (activeSection === "links_files") {
      for (const item of sectionDraft.items) {
        if (!item.title?.trim()) {
          setModalError("Each link/file must have a title.");
          return false;
        }
        if (item.type === "link") {
          if (!item.url?.trim()) {
            setModalError(`"${item.title}" is missing a URL.`);
            return false;
          }
          if (!isValidUrl(item.url.trim())) {
            setModalError(
              `"${item.title}" has an invalid URL. Make sure it starts with https:// or http:// `
            );
            return false;
          }
        }
        if (item.type === "file") {
          if (!item.file_url?.trim()) {
            setModalError(`"${item.title}" is missing an uploaded file.`);
            return false;
          }
          if (!isValidUrl(item.file_url.trim())) {
            setModalError(
              `"${item.title}" has an invalid file URL. Make sure it starts with https:// or http:// `
            );
            return false;
          }
        }
      }
    }

    // Contact
    if (activeSection === "contact") {

      if (!sectionDraft.form_title?.trim()) {
        setModalError("Form title is required.");
        return false;
      }

      if (!sectionDraft.connect_title?.trim()) {
        setModalError("Connect button text is required.");
        return false;
      }

      if (!sectionDraft.contact_title?.trim()) {
        setModalError("Save contact button text is required.");
        return false;
      }

      for (const field of sectionDraft.fields || []) {
        if (!isContactFieldComplete(field)) {
          setModalError("Please complete all contact fields.");
          return false;
        }
      }
    }

    setModalError(null); // 🔥 clear error if valid
    return true;
  };

  const handleSectionSave = () => {
    if (!activeSection || !sectionDraft || !config) return;
    const isValid = validateSectionDraft();
    if (!isValid) return;

    setModalError(null); // clear before saving
    let nextConfig = { ...config };

    /* ================= ENABLE SECTION (ONLY IF FROM ADD FLOW) ================= */
    if (pendingSection) {
      const exists = nextConfig.sections.items.find(
        (s) => s.type === pendingSection
      );

      let updated;

      if (exists) {
        updated = nextConfig.sections.items.map((s) =>
          s.type === pendingSection
            ? { ...s, enabled: true }
            : s
        );
      } else {
        updated = [
          ...nextConfig.sections.items,
          {
            id: pendingSection,
            type: pendingSection,
            rank: nextConfig.sections.items.length + 1,
            enabled: true,
          },
        ];
      }

      nextConfig = {
        ...nextConfig,
        sections: {
          ...nextConfig.sections,
          items: updated,
        },
      };

      setPendingSection(null);
    }

    /* ================= SAVE SECTION CONTENT ================= */

    if (activeSection === "products") {
      nextConfig = { ...nextConfig, products: sectionDraft };
    }

    if (activeSection === "youtube") {
      const normalizedItems = sectionDraft.items.map((v: any, index: number) => ({
        ...v,
        type: v.type || "link",   // ✅ guarantee type
        rank: index + 1,
      }));

      nextConfig = {
        ...nextConfig,
        youtube: {
          ...sectionDraft,
          items: normalizedItems,
        },
      };
    }
    if (activeSection === "links_files") {
      nextConfig = { ...nextConfig, links_files: sectionDraft };
    }

    if (activeSection === "photo_gallery") {
      nextConfig = { ...nextConfig, photo_gallery: sectionDraft };
    }

    if (activeSection === "social_links") {
      if (hasInvalidSocialLinks(sectionDraft.items)) {
        setSocialError(
          "One or more social links have an invalid URL. Make sure all links start with https:// or http:// "
        );
        return;
      }

      const normalizedItems = sectionDraft.items
        .sort((a: any, b: any) => a.rank - b.rank)
        .map((item: any, index: number) => ({
          ...item,
          rank: index + 1,
          country_code: item.country_code || "+91", // ✅ ensure saved
        }));

      nextConfig = {
        ...nextConfig,
        social_links: {
          ...sectionDraft,
          items: normalizedItems,
        },
      };
    }

    // if (activeSection === "meeting") {
    //   nextConfig = { ...nextConfig, meeting: sectionDraft };
    // }

    if (activeSection === "contact") {
      nextConfig = { ...nextConfig, contact: sectionDraft };
    }

    if (activeSection === "banner") {
      nextConfig = { ...nextConfig, banner: sectionDraft };
    }

    if (activeSection === "about") {
      nextConfig = {
        ...nextConfig,
        profile: sectionDraft,
      };
    }

    if (activeSection === "card_buttons") {
      nextConfig = {
        ...structuredClone(nextConfig),
        card_buttons: structuredClone(sectionDraft),
      };
    }
    /* ================= APPLY UPDATE ================= */
    update(nextConfig);

    setActiveSection(null);
    setSectionDraft(null);
    setCameFromAddModal(false);
  };

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

  // const handleAddSection = (type: string) => {
  //   const exists = config.sections.items.find(
  //     (s) => s.type === type
  //   );

  //   let updated;

  //   if (exists) {
  //     // toggle enable state
  //     updated = config.sections.items.map((s) =>
  //       s.type === type
  //         ? { ...s, enabled: !s.enabled }
  //         : s
  //     );
  //   } else {
  //     // add new section
  //     updated = [
  //       ...config.sections.items,
  //       {
  //         id: type,
  //         type,
  //         rank: config.sections.items.length + 1,
  //         enabled: true,
  //       },
  //     ];
  //   }

  //   update({
  //     ...config,
  //     sections: {
  //       ...config.sections,
  //       items: updated,
  //     },
  //   });
  // };

  /* ================= UI ================= */
  const isLayoutLocked = isReadOnly(config.layout);
  const loadMoreTeams = () => {
    if (!hasNextTeam || loadingMoreTeam) return;

    setLoadingMoreTeam(true);
    setTeamPage((prev) => prev + 1);
  };

  const openSectionEditor = (type: string) => {
    setActiveSection(type);

    const sectionMap: Record<string, any> = {
      // meeting: config.meeting,
      youtube: config.youtube,
      products: config.products,
      links_files: config.links_files,
      photo_gallery: config.photo_gallery,
      social_links: config.social_links,
      contact: config.contact,
      banner: config.banner,
      about: config.profile,
      card_buttons: config.card_buttons,
    };

    const base = sectionMap[type];
    if (!base) return;

    setSectionDraft({
      ...structuredClone(base),
      items: base?.items ?? [],
    });
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
                  className={`
                    border rounded-xl p-2 transition-all duration-200
                    ${config.layout.profile_type === t
                      ? "border-black ring-2 ring-gray-300 opacity-100"
                      : "border-gray-200 opacity-40 hover:opacity-70"
                    }
                  `}
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
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 items-start">
            {/* PROFILE PHOTO */}
            <div className="max-w-[140px]">
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

            {/* COVER BACKGROUND */}
            {config.layout.profile_type === 3 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <p className="text-sm font-semibold text-gray-800">
                    Cover Background
                  </p>
                </div>

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
                  className={`group relative h-40 w-full rounded-xl border border-dashed border-gray-300 bg-gray-50 transition ${isReadOnly(config.cover)
                    ? "opacity-60 pointer-events-none"
                    : "hover:bg-gray-100"
                    }`}
                >
                  {/* IMAGE */}
                  {config.cover.cover_url ? (
                    <>
                      <img
                        src={config.cover.cover_url}
                        className="absolute inset-0 w-full h-full object-cover rounded-xl"
                      />

                      {/* HOVER OVERLAY */}
                      <div className="absolute inset-0 flex items-center justify-center 
                  bg-black/35 backdrop-blur-[2px]
                  opacity-0 group-hover:opacity-100 transition rounded-xl">

                        <span className="px-5 py-1.5 text-sm text-white border border-white/70
                     rounded-full bg-white/10 backdrop-blur-md
                     hover:bg-white/20 transition">
                          Change
                        </span>

                      </div>
                    </>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-sm text-gray-500 text-center px-4">
                      <p>Drag file here for upload or</p>
                      <span className="mt-2 inline-block bg-gray-200 px-4 py-1.5 rounded-full text-xs font-medium">
                        Select Files
                      </span>
                    </div>
                  )}

                  {/* FILE INPUT */}
                  {!isReadOnly(config.cover) && (
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        coverFileRef.current = file;
                        setIsCropping(true);

                        // allow same image upload again
                        e.target.value = "";
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
                    max={40}
                    step={1}
                    value={
                      config.layout.profile_width === 0
                        ? ""
                        : config.layout.profile_width
                    }
                    onKeyDown={(e) => {
                      // Block minus key
                      if (e.key === "-" || e.key === "e") {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const paste = e.clipboardData.getData("text");
                      if (paste.includes("-")) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;

                      if (val === "") {
                        update({
                          ...config,
                          layout: { ...config.layout, profile_width: 0 },
                        });
                        return;
                      }

                      const num = Number(val);

                      update({
                        ...config,
                        layout: {
                          ...config.layout,
                          profile_width: num,
                        },
                      });
                    }}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter thickness"
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
                    placeholder="Enter size"
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

            {/* TITLE + LOCK */}
            <div className="mb-4 space-y-3">

              <h3 className="text-sm font-semibold text-gray-900">
                Add Sections to Your Card
              </h3>

              {showLockable && (
                <LockControl
                  value={config.sections}
                  role={config.role}
                  currentUser={username}
                  onChange={(v) =>
                    update({
                      ...config,
                      sections: { ...config.sections, ...v },
                    })
                  }
                />
              )}

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

              const sectionsLocked = isReadOnly(config.sections);

              return showEmptyState ? (
                /* EMPTY STATE */
                <div
                  className={`border-2 border-dashed border-gray-300 rounded-xl p-16 text-center bg-white transition ${sectionsLocked ? "opacity-60 pointer-events-none" : ""
                    }`}
                >
                  <h4 className="text-sm font-semibold text-gray-800">
                    Customize Your Card With Sections
                  </h4>

                  <p className="text-sm text-gray-500 mt-2">
                    Click "+ Add Section" to add contact details, social media, videos, and more.
                  </p>

                  <button
                    type="button"
                    disabled={sectionsLocked}
                    onClick={() => setAddSectionOpen(true)}
                    className="mt-5 px-5 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-sm font-medium transition disabled:opacity-50"
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
                      disabled={sectionsLocked}
                      onClick={() => setAddSectionOpen(true)}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm hover:opacity-90 disabled:opacity-50"
                    >
                      + Add Section
                    </button>
                  </div>

                  {/* REORDER */}
                  <div className={""}>
                    <SectionsReorder
                      sections={config.sections.items}
                      groupLocked={config.sections.locked}
                      role={role}
                      onChange={(items) => {
                        update({
                          ...config,
                          sections: { ...config.sections, items },
                        });
                      }}

                      onToggle={(id, enabled) => {
                        let updated = config.sections.items.map((s) =>
                          s.id === id ? { ...s, enabled } : s
                        );

                        const enabledSections = updated
                          .filter(s => s.enabled)
                          .map((s, index) => ({
                            ...s,
                            rank: index + 1,
                          }));

                        const disabledSections = updated.filter(s => !s.enabled);

                        update({
                          ...config,
                          sections: {
                            ...config.sections,
                            items: [...enabledSections, ...disabledSections],
                          },
                        });
                      }}

                      onSectionClick={(type) => {
                        // if (config.sections.locked && role !== "vendor_admin") return;
                        setCameFromAddModal(false);
                        setPendingSection(null);
                        setActiveSection(type);

                        const sectionMap: Record<string, any> = {
                          // meeting: config.meeting,
                          youtube: config.youtube,
                          products: config.products,
                          links_files: config.links_files,
                          photo_gallery: config.photo_gallery,
                          social_links: config.social_links,
                          contact: config.contact,
                          banner: config.banner,
                          about: config.profile,
                          card_buttons: config.card_buttons,
                        };

                        const base = sectionMap[type];
                        if (!base) return;

                        setSectionDraft({
                          ...structuredClone(base),
                          items: base?.items ?? [],
                        });
                      }}
                    />
                  </div>
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
                            <Image size={28} strokeWidth={1.5} />
                          </div>
                        )}

                        {item.id === "video" && (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Video size={28} strokeWidth={1.5} />
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
                    value={config.layout.background_color || "#000000"}
                    disabled={isLayoutLocked}
                    onChange={(val: string) =>
                      update({
                        ...config,
                        layout: { ...config.layout, background_color: val },
                      })
                    }
                  />

                </div>
              </div>
            )}

            {config.layout.use_background === "video" && (
              <div className="mt-6 space-y-3">
                <p className="text-sm font-medium">Background Video</p>

                {config.layout.background_video ? (
                  /* ================= VIDEO EXISTS ================= */
                  <div className="relative group w-full h-40 rounded-2xl overflow-hidden bg-gray-300">

                    {/* VIDEO */}
                    <video
                      src={config.layout.background_video}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />

                    {/* HOVER OVERLAY */}
                    <div className="
          absolute inset-0
          bg-black/50
          flex items-center justify-center
          opacity-0
          group-hover:opacity-100
          transition
        ">
                      <span className="text-white font-medium">
                        Change Video
                      </span>
                    </div>

                    {/* INPUT */}
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const res = await uploadImage(file);
                        const url = res.data.url;

                        update({
                          ...config,
                          layout: { ...config.layout, background_video: url },
                        });
                      }}
                    />
                  </div>
                ) : (
                  /* ================= NO VIDEO ================= */
                  <label
                    className="
    w-full h-40
    flex flex-col items-center justify-center gap-2
    rounded-2xl
    bg-gray-100
    border-2 border-dashed border-gray-300
    cursor-pointer
    text-gray-600
    font-medium
    hover:bg-gray-200
    transition
  "
                  >
                    <span className="text-sm">Upload Video</span>
                    <span className="text-xs text-gray-400">
                      MP4 or WebM
                    </span>

                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      hidden
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        const res = await uploadImage(file);
                        const url = res.data.url;

                        update({
                          ...config,
                          layout: { ...config.layout, background_video: url },
                        });
                      }}
                    />
                  </label>
                )}
              </div>
            )}

            {["polka", "waves", "stripes", "zigzag"].includes(
              config.layout.use_background || ""
            ) && (
                <div className="mt-6">
                  <p className="text-sm font-medium">Pattern Background Color</p>

                  <div className="mt-2">
                    <ThemeColorRow
                      label="Color"
                      value={config.layout.background_color || "#000000"}
                      disabled={isLayoutLocked}
                      onChange={(val: string) =>
                        update({
                          ...config,
                          layout: { ...config.layout, background_color: val },
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

                <div className="relative h-32 w-full rounded-xl border border-gray-200 overflow-hidden bg-gray-50 group">

                  {/* IMAGE OR PLACEHOLDER */}
                  {config.layout.background_image ? (
                    <img
                      src={config.layout.background_image}
                      className="w-full h-full object-cover"
                      alt="Background"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-xs text-gray-400">
                      No background image
                    </div>
                  )}

                  {/* HOVER OVERLAY */}
                  <label className="
    absolute inset-0
    bg-black/40
    text-white
    flex items-center justify-center
    opacity-0
    group-hover:opacity-100
    cursor-pointer
    transition
  ">
                    {config.layout.background_image ? "Change Image" : "Upload Image"}

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
            currentUser={username}
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


      <Card
        title="Share Your Digital Card"
        desc="Share your digital card in multiple ways, including links, QR codes, and wallet passes."
      >
        <ShareCardSection username={publicProfile?.username} vendor={publicProfile?.vendor_name} />
      </Card>


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
          setCameFromAddModal(true);
          setPendingSection(type);  // 🔥 IMPORTANT
          setAddSectionOpen(false);
          openSectionEditor(type);
        }}
        onToggle={(type: string) => {
          const exists = config.sections.items.find((s) => s.type === type);

          let updated;

          if (exists) {
            updated = config.sections.items.map((s) =>
              s.type === type ? { ...s, enabled: !s.enabled } : s
            );
          } else {
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
        }}
      />
      <AppModal
        open={!!activeSection}
        errorMessage={modalError}
        title={
          activeSection
            ? SECTION_LABELS[activeSection] ||
            activeSection.replace(/_/g, " ")
            : ""
        }
        description="Manage section content"
        size="xl"
        onClose={() => {
          // Close modal
          setActiveSection(null);
          setSectionDraft(null);

          // 🔥 Clear ALL validation errors
          setModalError(null);
          setSocialError(null);
          setYoutubeError(null);
          setPhotoError(null);
          setFormErrors({});

          // Reset add flow
          if (cameFromAddModal) {
            setCameFromAddModal(false);
            setPendingSection(null);
          }
        }}
        showBack={cameFromAddModal}
        onBack={() => {
          setActiveSection(null);
          setSectionDraft(null);

          // 🔥 clear errors here too
          setModalError(null);
          setSocialError(null);
          setYoutubeError(null);
          setPhotoError(null);
          setFormErrors({});

          setAddSectionOpen(true);
        }}
        onConfirm={handleSectionSave}
        confirmText="Save Changes"

      >
        {activeSection && SECTION_COMPONENTS[activeSection]}
      </AppModal>

      <AddSocialModal
        open={isAddSocialOpen}
        all={ALL_SOCIALS}
        selected={sectionDraft?.items || []}
        onToggle={(s: any) => {
          const index = sectionDraft.items.findIndex((i: any) => i.id === s.id);

          let updated;

          if (index !== -1) {
            updated = sectionDraft.items.map((i: any, idx: number) =>
              idx === index ? { ...i, enabled: !i.enabled } : i
            );
          } else {
            updated = [...sectionDraft.items, { ...s, url: "", enabled: true }];
          }

          setSectionDraft({
            ...sectionDraft,
            items: updated,
          });
        }}
        onClose={() => {
          setIsAddSocialOpen(false);
          setActiveSection("social_links"); // 🔥 reopen section editor
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
  disabled = false,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <span
        className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700"
          }`}
      >
        {label}
      </span>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition
          ${disabled
            ? "bg-gray-200 cursor-not-allowed"
            : value
              ? "bg-purple-600"
              : "bg-gray-300"
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition
            ${value ? "translate-x-6" : "translate-x-1"}
          `}
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
