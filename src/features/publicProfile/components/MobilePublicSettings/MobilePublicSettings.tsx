import SocialSection from "./sections/SocialSection";
import Links from "./Links/Links";
import { Pencil } from "lucide-react";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
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
import {
  SiTelegram,
  SiPinterest,
  SiThreads,
  SiGithub,
  SiDiscord,
  SiCalendly,
  SiAppstore,
  SiGoogleplay,
} from "react-icons/si";

import { FiMail, FiMapPin, FiMessageSquare } from "react-icons/fi";
import { ProfileLayoutModal } from "./Profile/ProfileLayoutModal";
import { ProfileLayoutEditor } from "./Profile/ProfileLayoutEditor";
import { uploadImage } from "../../services/publicProfile.api";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { savePublicProfile } from "../../slice";
import { FiPhone, FiGlobe } from "react-icons/fi";
import React from "react";
import { useState, useEffect } from "react";
import { ConnectModal } from "../ConnectModal";
import { ProfileActions } from "../../components/MobilePublicSettings/Profile/WebsiteLayout/ProfileActions";
import { ProfileWrapper } from "../../components/MobilePublicSettings/Profile/WebsiteLayout/ProfileWrapper";
import { Banner } from "./Banner/Banner";
import { EditableMeetingCTA } from "./Meeting/EditableMeetingCTA";
import PhotoGallerySection from "./sections/PhotoGallerySection";
import { ProductsEditModal } from "./sections/ProductsEditModal";

import { ZigzagBackground } from "../patterns/ZigzagBackground";
import { StripeBackground } from "../patterns/StripeBackground";
import { PolkaBackground } from "../patterns/PolkaBackground";
import { WaveBackground } from "../patterns/WaveBackground";
import SectionsReorder from "../../../settings/components/vice/sections/SectionsReorder";
import AddSectionModal from "../../../settings/components/vice/sections/AddSectionModal";
import ContactSection from "../../../settings/components/vice/sections/ContactSection";
import CardButtonsSection from "../../../settings/components/vice/sections/CardButtonsSection";
import CommonItemsReorder from "../../../settings/components/vice/sections/CommonItemsReorder";

/* ================= HELPERS ================= */

export const resolveTheme = (theme: any) => ({
  cardBg: theme.card_background || "#6B6E93",
  buttonBg: theme.button_color || "#A5A6AB",
  text: theme.card_text || "#EA3636",
  buttonText: theme.button_text || "#5F29F5",
});



const getYouTubeId = (url?: string) => {
  if (!url) return null;

  try {
    const u = new URL(url);

    if (u.hostname.includes("youtu.be")) {
      return u.pathname.slice(1);
    }

    if (u.searchParams.has("v")) {
      return u.searchParams.get("v");
    }

    const match = u.pathname.match(/\/embed\/([^/]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

const sortByRank = (arr: any[]) => {
  if (!Array.isArray(arr)) return [];
  return [...arr].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
};


export const resolveShape = (style?: number) => {
  switch (style) {
    case 2:
      return "rounded-md";
    case 3:
      return "rounded-full";
    default:
      return "";
  }
};

/* ================= BACKGROUND LAYER (exported for desktop sibling use) ================= */
export function resolveBackgroundStyleFromLayout(layout: any, theme: any) {
  if (layout?.use_background === "image" && layout?.background_image) {
    return {
      backgroundImage: `url(${layout.background_image})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }
  if (["waves", "polka", "stripes", "zigzag", "video"].includes(layout?.use_background || "")) {
    return {};
  }
  if (layout?.use_background === "gradient") {
    const from = layout?.color1 || "#7c3aed";
    const to = layout?.color2 || "#6366f1";
    const validDirections: Record<string, string> = {
      "to-r": "to right",
      "to-l": "to left",
      "to-b": "to bottom",
      "to-t": "to top",
    };
    const dir = validDirections[layout?.direction] || "to right";
    return { backgroundImage: `linear-gradient(${dir}, ${from}, ${to})` };
  }
  return { backgroundColor: layout?.background_color || theme?.background_color || "#000" };
}

/**
 * Renders the decorative background.
 * positionClass = "fixed" on real mobile, "absolute" when used as a sibling
 * inside the phone mockup (which has overflow-hidden to clip it).
 */
export function BackgroundLayer({
  layout,
  theme,
  positionClass = "fixed",
}: {
  layout: any;
  theme: any;
  positionClass?: "fixed" | "absolute";
}) {
  const bg = layout?.use_background || "";
  const isPattern = ["stripes", "waves", "polka", "zigzag", "video"].includes(bg);

  return (
    <div
      className={`${positionClass} inset-0 z-0 pointer-events-none`}
      style={!isPattern ? resolveBackgroundStyleFromLayout(layout, theme) : {}}
    >
      {bg === "zigzag" && <ZigzagBackground color={layout?.background_color || "#65696F"} />}
      {bg === "waves" && <WaveBackground color={layout?.background_color || "#40474D"} />}
      {bg === "stripes" && <StripeBackground color={layout?.background_color || "#65696F"} />}
      {bg === "polka" && <PolkaBackground color={layout?.background_color || "#3d444b"} />}
      {bg === "video" && <BackgroundVideo src={layout?.background_video} isPreview={positionClass === "absolute"} />}
    </div>
  );
}

/* ================= COMPONENT ================= */
export default function MobilePublicSettings({
  data,
  scrollRef,
  onLogout,
  isPreview = false, // 👈 NEW: true when rendered inside desktop phone mockup
}: {
  data: any;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onLogout?: () => void;
  isPreview?: boolean;
}) {

  const config = data?.configuration ?? {};

  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  const [open, setOpen] = useState(false);
  const [editProducts, setEditProducts] = useState(false);

  const {
    banner = {},
    meeting = {},
    // sections = { items: [] },
  } = config;

  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.publicProfile.saving);
  const [editSection, setEditSection] = useState<any>(null);

  const [draft, setDraft] = useState<any>(config);

  const handleSave = async () => {
    try {
      await dispatch(savePublicProfile({ config: draft })).unwrap();

      setResultModal({
        type: "success",
        message: "Profile updated successfully",
      });
    } catch (err: any) {
      setResultModal({
        type: "error",
        message: err?.message || "Something went wrong. Please try again.",
      });
    }
  };

  useEffect(() => {
    if (!config || !Object.keys(config).length) return;

    setDraft((prev: any) => ({
      ...prev,
      ...config,
      contact: { ...prev.contact, ...config.contact },
      youtube: config.youtube || prev.youtube || { items: [] },
      links_files: config.links_files || prev.links_files || { items: [] },
      social_links: config.social_links || prev.social_links || { items: [] },
    }));
  }, [config]);

  const [openLayoutEditor, setOpenLayoutEditor] = useState(false);
  const [openSectionsEditor, setOpenSectionsEditor] = useState(false);
  const [openAddSection, setOpenAddSection] = useState(false);
  const [photoGalleryDraft, setPhotoGalleryDraft] = useState<any | null>(null);
  const [productsDraft, setProductsDraft] = useState<any | null>(null);
  const [autoEditSection, setAutoEditSection] = useState<string | null>(null);
  const [editCardButtons, setEditCardButtons] = useState(false);
  const [cardButtonsDraft, setCardButtonsDraft] = useState<any | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [layoutDraft, setLayoutDraft] = useState<{
    layout: any;
    theme: any;
  } | null>(null);
  const [resultModal, setResultModal] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [editContact, setEditContact] = useState(false);
  const [contactDraft, setContactDraft] = useState<any | null>(null);


  const orderedSections = sortByRank(draft.sections?.items || []);
  const shapeClass = resolveShape(draft.layout?.button_style);

  useEffect(() => {
    if (!scrollRef?.current) return;
    const el = scrollRef.current;

    if (open || activePhoto) {
      el.style.overflow = "hidden";
      el.style.touchAction = "none";
    } else {
      el.style.overflow = "auto";
      el.style.touchAction = "auto";
    }
  }, [open, activePhoto, scrollRef]);

  const resolveFontClass = (font?: string) => {
    if (font === "custom") return "font-[var(--custom-font)]";

    switch ((font || "").toLowerCase()) {
      case "inter":
        return "font-inter";
      case "roboto":
        return "font-roboto";
      case "montserrat":
        return "font-montserrat";
      case "merriweather":
        return "font-merriweather";
      case "caveat":
        return "font-caveat";
      case "gloria hallelujah":
      case "gloria":
        return "font-gloria";
      default:
        return "font-inter";
    }
  };
  function isValidUrl(url: string): boolean {
    if (!url || !url.trim()) return false;
    try {
      const parsed = new URL(url.trim());
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }
  type ValidatorFn = (draft: any) => string | null;

  const isYoutubeRowComplete = (item: any) =>
    item.url?.trim() && getYouTubeId(item.url);

  const hasInvalidSocialLinks = (items: any[]) =>
    items.some(
      (i) => i.enabled === true && (!i.url || i.url.trim() === "" || !isValidUrl(i.url.trim()))
    );

  const sectionValidators: Record<string, ValidatorFn> = {
    youtube: (draft) => {
      for (const item of draft.items || []) {
        if (!item.url?.trim()) return "Please enter a YouTube URL for all videos.";
        if (!isYoutubeRowComplete(item))
          return `"${item.url}" is not a valid URL`;
      }
      return null;
    },

    photo_gallery: (draft) => {
      const items = draft?.items || [];
      if (items.length === 0) return "Please add at least one photo.";
      for (const item of items) {
        if (!item.title?.trim()) return "Each photo must have a title.";
        if (item.link?.trim() && !isValidUrl(item.link.trim()))
          return `Photo "${item.title}" has an invalid URL. Make sure it starts with https:// or http://`;
      }
      return null;
    },

    social_links: (draft) => {
      return hasInvalidSocialLinks(draft.items || [])
        ? "One or more social links have an invalid URL. Make sure all links start with https:// or http://"
        : null;
    },

    links_files: (draft) => {
      const items = draft?.items || [];
      if (items.length === 0) return "Please add at least one link or file.";
      for (const item of items) {
        if (!item.title?.trim()) return "Each link/file must have a title.";
        if (item.type === "link") {
          if (!item.url?.trim()) return `"${item.title}" is missing a URL.`;
          if (!isValidUrl(item.url.trim()))
            return `"${item.title}" has an invalid URL. Make sure it starts with https:// or http://`;
        }
        if (item.type === "file") {
          if (!item.file_url?.trim()) return `"${item.title}" is missing an uploaded file.`;
          if (!isValidUrl(item.file_url.trim()))
            return `"${item.title}" has an invalid file URL. Make sure it starts with https:// or http://`;
        }
      }
      return null;
    },

    contact: (draft) => {
      for (const field of draft.fields || []) {
        if (!field.label?.trim()) return "Each contact field must have a label.";
        if (field.type === "dropdown") {
          if (!field.options || field.options.length === 0)
            return `Dropdown field "${field.label}" must have at least one option.`;
          if (field.options.some((opt: string) => !opt || !opt.trim()))
            return `Dropdown field "${field.label}" has an empty option. Please fill it in or remove it.`;
        }
      }
      return null;
    },

    meeting: (draft) => {
      if (!draft.enabled) return null;
      if (!draft.meeting_url?.trim()) return "Please enter a meeting URL.";
      if (!isValidUrl(draft.meeting_url.trim()))
        return "Meeting URL is invalid. Make sure it starts with https:// or http://";
      return null;
    },

    banner: (draft) => {
      if (!draft.enabled) return null;
      if (draft.cta_url?.trim() && !isValidUrl(draft.cta_url.trim()))
        return "CTA URL is invalid. Make sure it starts with https:// or http://";
      return null;
    },

    card_buttons: (draft) => {
      for (const btn of draft.items || []) {
        if (!btn.title?.trim()) return "Each card button must have a title.";
        if (!btn.link?.trim()) return `Button "${btn.title}" is missing a link.`;
        if (!isValidUrl(btn.link.trim()))
          return `Button "${btn.title}" has an invalid URL. Make sure it starts with https:// or http://`;
      }
      return null;
    },
  };

  const validateSectionDraft = (
    sectionKey: string,
    sectionDraft: any
  ): boolean => {
    const validator = sectionValidators[sectionKey];

    if (!validator) return true;

    const error = validator(sectionDraft);

    if (error) {
      setModalError(error);
      return false;
    }

    setModalError(null);
    return true;
  };

  const isMobile = useIsMobile();
  const updateDraft = (updater: any) => {
    setDraft((prev: any) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  };

  const fontClass = resolveFontClass(draft.layout?.font);

  const renderSection = (type: string) => {
    switch (type) {
      case "profile":
        return (
          <div className="space-y-3">
            <ProfileWrapper
              profile={draft.profile}
              cover={draft.cover}
              theme={draft.theme}
              user={data}
              layout={draft.layout}
              onConnect={() => isMobile && setOpen(true)}
              onEdit={() => {
                setLayoutDraft({
                  layout: { ...(draft.layout || {}) },
                  theme: { ...(draft.theme || {}) },
                });
                setOpenLayoutEditor(true);
              }}

              onProfileChange={updateDraft}

            />
          </div>
        );

      case "about":
        return (
          <Section title="About" theme={draft.theme}>
            <EditableAbout
              value={draft.profile?.description || ""}
              theme={draft.theme}
              editable={!draft.profile?.locked}
              autoOpen={autoEditSection === "about"}   // ✅ REQUIRED
              onChange={(val: string) =>
                setDraft((prev: any) => ({
                  ...prev,
                  profile: {
                    ...prev.profile,
                    description: val,
                  },
                }))
              }
            />
          </Section>
        );

      case "social_links":
        return (
          <Section title="Social" theme={draft.theme}>
            <Social
              items={sortByRank(draft.social_links.items)}
              theme={draft.theme}
              shapeClass={shapeClass}
            />

            <SocialSection
              locked={draft.social_links?.locked}
              items={draft.social_links?.items || []}
              autoOpen={autoEditSection === "social_links"}
              onChange={(updater: any) =>
                setDraft((prev: any) => {
                  const nextItems =
                    typeof updater === "function"
                      ? updater(prev.social_links?.items || [])
                      : updater;

                  return {
                    ...prev,
                    social_links: {
                      ...(prev.social_links || {}),
                      items: nextItems.map((i: any, idx: number) => ({
                        ...i,
                        rank: i.rank ?? idx + 1,
                        enabled: i.enabled ?? true,
                      })),
                    },
                  };
                })
              }
            />

          </Section>
        );

      case "products": {
        const p = draft.products;
        return (
          <Products
            title={p.section_title}
            items={sortByRank(p.items)}
            theme={draft.theme}
            showPrice={p.toggle_price}
            editable={!p.locked}
            onEdit={() => {
              setProductsDraft(structuredClone(draft.products));
              setEditProducts(true);
            }}

          />
        );
      }

      case "youtube":
        return (
          <YouTube
            title={draft.youtube?.section_title}
            items={sortByRank(draft.youtube?.items || [])}
            theme={draft.theme}
            editable={!draft.youtube?.locked}
            onEdit={(item) => setEditSection({ type: "youtube", item })}
          />
        );

      case "contact":
        return (
          <ProfileActions
            user={data}
            theme={draft.theme}
            contact={draft.contact}
            layout={draft.layout}
            editable={!draft.contact?.locked}
            onEdit={() => openSectionEditor("contact")} // 🔥 REQUIRED
            onConnect={() => isMobile && setOpen(true)}
          />
        );

      case "links_files":
        return (
          <Links
            title={draft.links_files?.section_title}
            items={draft.links_files?.items || []}
            theme={draft.theme}
            autoOpen={autoEditSection === "links_files"}
            editable={!draft.links_files?.locked}
            onChange={(next: { section_title: string; items: any[] }) => {
              // validate before saving to draft
              for (const item of next.items || []) {
                if (!item.title?.trim()) return;

                if (item.type === "link") {
                  if (item.url?.trim() && !isValidUrl(item.url.trim())) return;
                }

                if (item.type === "file") {
                  if (item.file_url?.trim() && !isValidUrl(item.file_url.trim())) return;
                }
              }

              setDraft((prev: any) => ({
                ...prev,
                links_files: {
                  ...prev.links_files,
                  section_title: next.section_title,
                  items: next.items,
                },
              }));
            }}
          />
        );

      case "meeting":
        return meeting?.enabled ? (
          <EditableMeetingCTA
            meeting={draft.meeting}
            theme={draft.theme}
            shapeClass={shapeClass}
            autoOpen={autoEditSection === "meeting"}
            editable={!draft.meeting?.locked}
            onMeetingChange={(updater: any) =>
              setDraft((prev: any) =>
                typeof updater === "function" ? updater(prev) : updater
              )
            }
          />
        ) : null;

      case "banner":
        return banner?.enabled && banner?.image_url ? (
          <Banner
            image={draft.banner.image_url}
            ctaText={draft.banner.cta_text}
            ctaUrl={draft.banner.cta_url}
            theme={draft.theme}
            autoOpen={autoEditSection === "banner"}
            editable={!draft.banner?.locked}
            onBannerChange={(updater: any) =>
              setDraft((prev: any) =>
                typeof updater === "function" ? updater(prev) : updater
              )
            }
          />


        ) : null;

      case "photo_gallery": {
        const pg = draft.photo_gallery;

        return (
          <PhotoGallery
            title={pg?.section_title}
            items={sortByRank(pg?.items || [])}
            theme={draft.theme}
            editable={!pg?.locked}
            onEdit={() => {
              setModalError(null); // 🔥 clear old error
              setPhotoGalleryDraft(structuredClone(draft.photo_gallery));
              setEditPhotoGallery(true);
            }}

            onOpen={setActivePhoto}
          />
        );
      }

      case "card_buttons":
        return (
          <CardButtonsPreview
            title={draft.card_buttons?.section_title}
            items={sortByRank(draft.card_buttons?.items || [])}
            theme={draft.theme}
            layout={draft.layout}
            editable={!draft.card_buttons?.locked}
            onEdit={() => openSectionEditor("card_buttons")}
          />
        );

      default:
        return null;
    }
  };

  const [editPhotoGallery, setEditPhotoGallery] = useState(false);
  const [youtubeDraft, setYoutubeDraft] = useState<any | null>(null);
  useEffect(() => {
    if (editSection?.type !== "youtube") return;

    setYoutubeDraft({
      ...(draft.youtube || {}),
      items: safeSort(draft.youtube?.items || []),
    });
  }, [editSection?.type]);

  const safeSort = (arr: any[]) =>
    Array.isArray(arr)
      ? [...arr].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      : [];

  useEffect(() => {
    if (!draft.layout?.use_custom_font || !draft.layout?.custom_font) return;

    const fontUrl = draft.layout.custom_font;

    const font = new FontFace("UserCustomFont", `url(${fontUrl})`);

    font
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);

        document.documentElement.style.setProperty(
          "--custom-font",
          "'UserCustomFont', system-ui, sans-serif"
        );

        console.log("✅ Custom font loaded:", fontUrl);
      })
      .catch((err) => {
        console.error("❌ Custom font failed", err);
      });
  }, [draft.layout?.custom_font, draft.layout?.use_custom_font]);

  const isAnyModalOpen =
    open ||
    !!activePhoto ||
    editProducts ||
    editPhotoGallery ||
    openLayoutEditor ||
    editSection?.type === "youtube" ||
    editContact;

  useEffect(() => {
    // On desktop preview (isPreview=true), we don't lock body scroll
    // since the background is contained; only lock on true mobile
    if (isPreview) return;

    if (!isAnyModalOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      return;
    }

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      const y = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(y || "0") * -1);
    };
  }, [isAnyModalOpen, isPreview]);
  useEffect(() => {
    if (!autoEditSection) return;

    const timer = setTimeout(() => {
      setAutoEditSection(null);
    }, 400);

    return () => clearTimeout(timer);
  }, [autoEditSection]);
  const openSectionEditor = (type: string) => {
    switch (type) {
      case "products":
        setProductsDraft(structuredClone(draft.products));
        setEditProducts(true);
        break;

      case "photo_gallery":
        setPhotoGalleryDraft(structuredClone(draft.photo_gallery));
        setEditPhotoGallery(true);
        break;

      case "youtube":
        setEditSection({ type: "youtube" });
        break;
      case "about":
      case "social_links":
      case "links_files":
      case "meeting":
      case "banner":
        setAutoEditSection(type);
        break;
      case "card_buttons":
        setCardButtonsDraft(
          structuredClone(
            draft.card_buttons ?? {
              section_title: "Card Buttons",
              items: [],
            }
          )
        );
        setEditCardButtons(true);
        break;
      case "contact":
        setContactDraft(structuredClone(draft.contact));
        setEditContact(true);
        break;

      default:
        break;
    }
  };
  // bgPositionClass no longer used here; background is handled by BackgroundLayer
  const sectionsLocked = draft.sections?.locked;
  return (
    <div className={`relative w-full min-h-full overflow-x-hidden p-4 pb-24 ${fontClass}`}>

      {/* BACKGROUND: only here on real mobile. On desktop preview,
          BackgroundLayer is a sibling outside the scroll container. */}
      {!isPreview && (
        <BackgroundLayer layout={draft.layout} theme={draft.theme} positionClass="fixed" />
      )}

      <ConnectModal
        open={open}
        onClose={() => setOpen(false)}
        handle={data?.username}
        theme={draft.theme}
        config={config.contact}
      />

      {/* MODAL */}
      <PhotoModal
        open={!!activePhoto}
        item={activePhoto}
        theme={draft.theme}
        onClose={() => setActivePhoto(null)}
      />

      {/* Youtube */}
      <EditModal
        open={editSection?.type === "youtube"}
        errorMessage={modalError}
        onClose={() => {
          setModalError(null);
          setYoutubeDraft(null);
          setEditSection(null);
        }}
        onSave={() => {
          if (!validateSectionDraft("youtube", youtubeDraft)) return;

          setDraft((prev: any) => ({
            ...prev,
            youtube: youtubeDraft,
          }));

          setModalError(null);
          setYoutubeDraft(null);
          setEditSection(null);
        }}
      >
        <h3 className="text-lg font-semibold">
          Manage YouTube Videos
        </h3>

        {youtubeDraft && (
          <div className="space-y-6">

            {/* GALLERY TITLE */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Gallery Title
              </label>
              <input
                type="text"
                value={youtubeDraft.section_title || ""}
                onChange={(e) =>
                  setYoutubeDraft((prev: any) => ({
                    ...prev,
                    section_title: e.target.value,
                  }))
                }
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Videos Gallery"
              />
            </div>

            {/* VIDEO CARDS */}
            <div className="space-y-4">
              <CommonItemsReorder
                items={youtubeDraft.items || []}
                onChange={(updatedItems: any[]) =>
                  setYoutubeDraft((prev: any) => ({
                    ...prev,
                    items: updatedItems.map((i, idx) => ({
                      ...i,
                      rank: idx + 1,
                    })),
                  }))
                }
                renderItem={(item: any, index: number) => (
                  <div className="bg-gray-50 rounded-2xl p-5 space-y-4">

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">
                        Video {index + 1}
                      </span>

                      <button
                        onClick={() => {
                          const next = youtubeDraft.items
                            .filter((i: any) => i.id !== item.id)
                            .map((v: any, i: number) => ({
                              ...v,
                              rank: i + 1,
                            }));

                          setYoutubeDraft({
                            ...youtubeDraft,
                            items: next,
                          });
                        }}
                        className="text-red-500 text-sm"
                      >
                        Delete
                      </button>
                    </div>

                    <input
                      value={item.url || ""}
                      onChange={(e) => {
                        const next = [...youtubeDraft.items];
                        next[index] = {
                          ...item,
                          url: e.target.value,
                        };

                        setYoutubeDraft({
                          ...youtubeDraft,
                          items: next,
                        });
                      }}
                      className="w-full rounded-xl border px-4 py-3"
                      placeholder="https://youtube.com/..."
                    />
                  </div>
                )}
              />
            </div>

            {/* ADD BUTTON */}
            <button
              onClick={() => {
                const items = youtubeDraft?.items || [];

                // 🚨 Check incomplete rows
                const hasInvalid = items.some(
                  (item: any) => !isYoutubeRowComplete(item)
                );

                if (hasInvalid) {
                  setModalError("Please complete existing video URLs before adding a new one.");
                  return;
                }

                // ✅ Clear old error
                setModalError(null);

                // ✅ Add new row
                setYoutubeDraft((prev: any) => ({
                  ...prev,
                  items: [
                    ...(prev.items || []),
                    {
                      id: crypto.randomUUID(),
                      url: "",
                      rank: (prev.items?.length || 0) + 1,
                      enabled: true,
                    },
                  ],
                }));
              }}
              className="w-full border rounded-xl py-3 text-sm font-medium hover:bg-gray-50"
            >
              + Add Another Video
            </button>

          </div>
        )}
      </EditModal>

      {/* Photo gallery */}
      <EditModal
        open={editPhotoGallery}
        errorMessage={modalError}
        onClose={() => {
          setModalError(null);
          setEditPhotoGallery(false);
        }}
        onSave={() => {
          if (!validateSectionDraft("photo_gallery", photoGalleryDraft)) return;

          setDraft((prev: any) => ({
            ...prev,
            photo_gallery: photoGalleryDraft,
          }));

          setModalError(null);
          setEditPhotoGallery(false);
        }}
      >
        <h3 className="text-lg font-semibold">Manage Photo Gallery</h3>

        {photoGalleryDraft && (
          <PhotoGallerySection
            value={photoGalleryDraft}
            disabled={draft.photo_gallery?.locked}
            onChange={setPhotoGalleryDraft}
          />
        )}
      </EditModal>

      {/* Contact */}
      <EditModal
        open={editContact}
        errorMessage={modalError}
        onClose={() => {
          setModalError(null);
          setContactDraft(null);
          setEditContact(false);
        }}
        onSave={() => {
          if (!validateSectionDraft("contact", contactDraft)) return;

          setDraft((prev: any) => ({
            ...prev,
            contact: contactDraft,
          }));

          setModalError(null);
          setContactDraft(null);
          setEditContact(false);
        }}
      >
        <h3 className="text-lg font-semibold">
          Manage Contact Form
        </h3>

        {contactDraft && (
          <ContactSection
            value={contactDraft}
            disabled={draft.contact?.locked}
            onChange={setContactDraft}
          />
        )}
      </EditModal>

      {/* Section */}
      <EditModal
        open={openSectionsEditor}
        onClose={() => setOpenSectionsEditor(false)}
        onSave={() => {
          setOpenSectionsEditor(false);
        }}
      >
        <h3 className="text-lg font-semibold">
          Reorder Sections
        </h3>
        <SectionsReorder
          sections={draft.sections?.items || []}
          groupLocked={false}
          onChange={(items: any) =>
            setDraft((prev: any) => ({
              ...prev,
              sections: {
                ...prev.sections,
                items,
              },
            }))
          }
          onSectionClick={() => {
            setOpenSectionsEditor(false);
            // optionally open section editor here
          }}
          onToggle={(id, enabled) => {
            setDraft((prev: any) => ({
              ...prev,
              sections: {
                ...prev.sections,
                items: prev.sections.items.map((s: any) =>
                  s.id === id ? { ...s, enabled } : s
                ),
              },
            }));
          }}
        />
      </EditModal>

      {/* Card Buttons */}
      <EditModal
        open={editCardButtons}
        errorMessage={modalError}
        onClose={() => {
          setModalError(null);
          setCardButtonsDraft(null);
          setEditCardButtons(false);
        }}
        onSave={() => {
          if (!validateSectionDraft("card_buttons", cardButtonsDraft)) return;

          setDraft((prev: any) => ({
            ...prev,
            card_buttons: cardButtonsDraft,
          }));

          setModalError(null);
          setCardButtonsDraft(null);
          setEditCardButtons(false);
        }}
      >
        <h3 className="text-lg font-semibold">
          Manage Card Buttons
        </h3>

        {cardButtonsDraft && (
          <CardButtonsSection
            value={cardButtonsDraft}
            disabled={draft.card_buttons?.locked}
            onChange={setCardButtonsDraft}
          />
        )}
      </EditModal>

      <AddSectionModal
        open={openAddSection}
        sections={draft.sections?.items || []}
        onClose={() => setOpenAddSection(false)}

        onAdd={(type: string) => {
          setOpenAddSection(false);

          const exists = draft.sections.items.find((s: any) => s.type === type);

          if (!exists) {
            setDraft((prev: any) => ({
              ...prev,
              sections: {
                ...prev.sections,
                items: [
                  ...prev.sections.items,
                  {
                    id: type,
                    type,
                    rank: prev.sections.items.length + 1,
                    enabled: true,
                  },
                ],
              },
            }));
          }

          // 🔥 THIS IS WHAT WAS MISSING
          openSectionEditor(type);
        }}

        onToggle={(type: string) => {
          const items = draft.sections.items;
          const existing = items.find((s: any) => s.type === type);

          let updated;

          if (existing) {
            updated = items.map((s: any) =>
              s.type === type ? { ...s, enabled: !s.enabled } : s
            );
          } else {
            updated = [
              ...items,
              {
                id: type,
                type,
                rank: items.length + 1,
                enabled: true,
              },
            ];
          }

          // 🔥 re-rank enabled
          const enabled = updated.filter((s: any) => s.enabled);
          const disabled = updated.filter((s: any) => !s.enabled);

          const reRanked = enabled.map((s: any, idx: number) => ({
            ...s,
            rank: idx + 1,
          }));

          setDraft((prev: any) => ({
            ...prev,
            sections: {
              ...prev.sections,
              items: [...reRanked, ...disabled],
            },
          }));
        }}
      />
      <ProductsEditModal
        open={editProducts}
        value={productsDraft}
        onClose={() => {
          setProductsDraft(null);
          setEditProducts(false);
        }}
        onChange={setProductsDraft}
        onSave={() => {
          setDraft((prev: any) => ({
            ...prev,
            products: productsDraft,
          }));
          setProductsDraft(null);
          setEditProducts(false);
        }}
      />
      <ResultModal
        open={!!resultModal}
        type={resultModal?.type || "success"}
        message={resultModal?.message || ""}
        onClose={() => setResultModal(null)}
      />
      {/* BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t shadow px-4 py-3 flex gap-3 justify-center">
        <button
          onClick={onLogout}
          className="flex-1 py-3 rounded-xl font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition"
        >
          Sign out
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl font-semibold text-white bg-purple-600 shadow disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <ProfileLayoutModal
          open={openLayoutEditor}
          onClose={() => {
            setLayoutDraft({
              layout: { ...(draft.layout || {}) },
              theme: { ...(draft.theme || {}) },
            });
            setOpenLayoutEditor(false);
          }}
          onSave={() => {
            setDraft((prev: any) => ({
              ...prev,
              layout: layoutDraft?.layout,
              theme: layoutDraft?.theme,
            }));

            setOpenLayoutEditor(false);
          }}
        >
          <ProfileLayoutEditor
            config={layoutDraft}
            update={setLayoutDraft}
            uploadImage={uploadImage}
          />
        </ProfileLayoutModal>

      </div>


      <span className="wave-3 absolute inset-0" />
      <span className="wave-fade" />
      <div className="relative z-10 space-y-6">

        {orderedSections.map((s: any) =>
          s?.enabled ? (
            <div key={s.id}>{renderSection(s.type)}</div>
          ) : null
        )}

        {/* 👇 SECTION ACTION BUTTONS */}
        <div className="flex gap-3 pt-6">
          <button
            onClick={() => setOpenSectionsEditor(true)}
            disabled={sectionsLocked}
            className={`flex-1 py-3 rounded-xl border font-semibold
    bg-white/90 backdrop-blur shadow-sm
    transition
    ${sectionsLocked
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
              }`}
          >
            Edit Sections
          </button>

          <button
            onClick={() => setOpenAddSection(true)}
            disabled={sectionsLocked}
            className={`flex-1 py-3 rounded-xl font-semibold text-white shadow transition
    ${sectionsLocked
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
              }`}
          >
            Add Section
          </button>
        </div>

      </div>
    </div>
  );
}

/* ================= UI BLOCKS ================= */
// function YouTubeRow({
//   v,
//   setDraft,
// }: {
//   v: any;
//   setDraft: any;
// }) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: v.id });

//   return (
//     <div
//       ref={setNodeRef}
//       style={{
//         transform: CSS.Transform.toString(transform),
//         transition,
//       }}
//       className={`flex items-center gap-2 bg-gray-50 p-2 rounded-lg border
//         ${isDragging ? "opacity-50 scale-[1.02] z-50" : ""}
//       `}
//     >
//       <span
//         {...attributes}
//         {...listeners}
//         className="cursor-grab active:cursor-grabbing select-none
//                    touch-none text-gray-500 px-2 py-1"
//       >
//         ☰
//       </span>

//       <input
//         value={v.url}
//         onChange={(e) =>
//           setDraft((prev: any) => ({
//             ...prev,
//             youtube: {
//               ...prev.youtube,
//               items: prev.youtube.items.map((i: any) =>
//                 i.id === v.id ? { ...i, url: e.target.value } : i
//               ),
//             },
//           }))
//         }
//         placeholder="YouTube link"
//         className="flex-1 border rounded-md p-2 text-sm"
//       />

//       <button
//         onClick={() =>
//           setDraft((prev: any) => ({
//             ...prev,
//             youtube: {
//               ...prev.youtube,
//               items: prev.youtube.items
//                 .filter((i: any) => i.id !== v.id)
//                 .map((i: any, r: number) => ({ ...i, rank: r + 1 })),
//             },
//           }))
//         }
//         className="text-red-500 text-sm px-2"
//       >
//         ✕
//       </button>
//     </div>
//   );
// }


export function Section({ title, children, theme }: any) {
  const t = resolveTheme(theme);

  return (
    <div>
      <h3
        className="text-sm font-semibold mb-2"
        style={{ color: t.text }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}


/* ================= PROFILE ================= */

export const formatRole = (role?: string) => {
  switch (role) {
    case "vendor_admin":
      return "Vendor Admin";
    case "sales_rep":
      return "Sales Person";
    case "manager":
      return "Manager";
    default:
      return role || "";
  }
};

/* ================= PRODUCTS ================= */
function Products({
  title,
  items,
  theme,
  showPrice,
  editable = false,
  onEdit,
}: any) {
  if (!items?.length) return null;

  return (
    <Section title={title || "Products"} theme={theme}>
      <div className="relative">
        {editable && (
          <button
            onClick={onEdit}
            className="absolute -top-4 -right-0 z-20 h-9 w-9 rounded-full
              shadow-lg flex items-center justify-center bg-orange-500 text-white
              hover:scale-110 active:scale-95"
          >
            <Pencil size={14} />
          </button>
        )}

        <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
          {items.map((p: any) => (
            <div
              key={p.id}
              className="relative min-w-[220px] h-48 rounded-2xl overflow-hidden snap-start shadow-lg"
              style={{ backgroundColor: theme.card_background }}
            >
              <img
                src={p.image_url || p.product_img_url}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

              <div className="absolute bottom-3 left-3 right-3">
                <h3
                  className="text-sm font-semibold line-clamp-2"
                  style={{ color: theme.card_text }}
                >
                  {p.name}
                </h3>

                {showPrice && (
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme.card_text }}
                  >
                    ₹{p.price}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ================= YOUTUBE ================= */
const YoutubeEmbed = React.memo(({ id }: { id: string }) => (
  <iframe
    src={`https://www.youtube-nocookie.com/embed/${id}`}
    className="w-full h-full"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
));

function YouTube({
  title,
  items,
  theme,
  onEdit,
  editable = true,
}: {
  title: string;
  items: any[];
  theme: any;
  onEdit: (item: any) => void;
  editable?: boolean;
}) {
  const valid = (items || []).filter((v) => getYouTubeId(v.url));
  const [active, setActive] = React.useState(0);
  const ref = React.useRef<HTMLDivElement>(null);

  const isDown = React.useRef(false);
  const startX = React.useRef(0);
  const scrollLeft = React.useRef(0);

  if (!valid.length) return null;

  const onScroll = () => {
    if (!ref.current) return;

    const index = Math.round(
      ref.current.scrollLeft / ref.current.clientWidth
    );

    setActive((prev) => (prev === index ? prev : index));
  };

  return (
    <Section title={title} theme={theme}>
      <div
        ref={ref}
        onScroll={onScroll}
        onMouseDown={(e) => {
          isDown.current = true;
          startX.current = e.pageX - (ref.current?.offsetLeft || 0);
          scrollLeft.current = ref.current?.scrollLeft || 0;
        }}
        onMouseLeave={() => (isDown.current = false)}
        onMouseUp={() => (isDown.current = false)}
        onMouseMove={(e) => {
          if (!isDown.current || !ref.current) return;
          e.preventDefault();
          const x = e.pageX - ref.current.offsetLeft;
          const walk = (x - startX.current) * 1.5;
          ref.current.scrollLeft = scrollLeft.current - walk;
        }}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing select-none"
      >
        {valid.map((v, i) => {
          const id = getYouTubeId(v.url);

          return (
            <div
              key={v.id}
              className="relative min-w-full h-48 snap-center px-1"
            >
              {editable && (
                <button
                  onClick={() => onEdit(v)}
                  className="absolute top-2 right-0 z-20 h-8 w-8 rounded-full shadow
            flex items-center justify-center transition hover:scale-105
            bg-orange-500 text-white"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
              )}

              <div className="w-full h-full rounded-2xl overflow-hidden shadow-md bg-black/5">
                {i === active && id ? (
                  <YoutubeEmbed id={id} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Video {i + 1}
                  </div>
                )}
              </div>
            </div>
          );
        })}

      </div>

      <div className="flex justify-center gap-2 mt-3">
        {valid.map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full transition ${i === active ? "bg-indigo-500 scale-125" : "bg-gray-300"
              }`}
          />
        ))}
      </div>
    </Section>
  );
}

/* ================= SOCIAL ================= */
function Social({ items, theme, shapeClass }: any) {
  if (!items?.length) return null;
  const t = resolveTheme(theme);

  const visible = items.filter((i: any) => i.enabled);

  if (!visible.length) return null;

  const rows: any[][] = [];
  for (let i = 0; i < visible.length; i += 3) {
    rows.push(visible.slice(i, i + 3));
  }

  return (
    <div className="flex flex-col items-center gap-4 pb-5">
      {rows.map((row, rIdx) => (
        <div
          key={rIdx}
          className={`flex gap-4 ${row.length < 3 ? "justify-center" : "justify-between"
            } w-full`}
        >
          {row.map((s: any) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`h-20 w-20 flex items-center justify-center shadow-md transition hover:scale-105 overflow-hidden ${shapeClass}`}
              style={{
                backgroundColor: t.buttonBg,
                color: t.buttonText,
              }}
            >
              {s.id === "instagram" && <SiInstagram size={30} />}
              {s.id === "linkedin" && <SiLinkedin size={30} />}
              {s.id === "youtube" && <SiYoutube size={30} />}
              {s.id === "twitter" && <SiX size={30} />}
              {s.id === "facebook" && <SiFacebook size={30} />}
              {s.id === "whatsapp" && <SiWhatsapp size={30} />}
              {s.id === "phone" && <FiPhone size={30} />}
              {s.id === "website" && <FiGlobe size={30} />}
              {s.id === "snapchat" && <SiSnapchat size={30} />}
              {s.id === "tiktok" && <SiTiktok size={30} />}
              {s.id === "address" && <FiMapPin size={30} />}
              {s.id === "email" && <FiMail size={30} />}
              {s.id === "telegram" && <SiTelegram size={30} />}
              {s.id === "pinterest" && <SiPinterest size={30} />}
              {s.id === "threads" && <SiThreads size={30} />}
              {s.id === "github" && <SiGithub size={30} />}
              {s.id === "discord" && <SiDiscord size={30} />}
              {s.id === "calendly" && <SiCalendly size={30} />}
              {s.id === "appstore" && <SiAppstore size={30} />}
              {s.id === "playstore" && <SiGoogleplay size={30} />}
              {s.id === "sms" && <FiMessageSquare size={30} />}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}

export function EditModal({
  open,
  onClose,
  onSave,
  children,
  showFooter = true,
  disableSave = false, // 👈 NEW
  errorMessage,
}: {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
  children: React.ReactNode;
  showFooter?: boolean;
  disableSave?: boolean; // 👈 NEW
  errorMessage?: string | null;
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 z-[9999]
        bg-black/60 backdrop-blur-sm
        flex items-center justify-center px-4
        animate-fade-in
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
  w-full max-w-md
  bg-white rounded-2xl shadow-xl
  max-h-[85vh]
  flex flex-col
  overflow-hidden
  animate-slide-from-bottom
"
      >
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 h-8 w-8
                       rounded-full flex items-center justify-center
                       text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>


        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {children}
        </div>


        {showFooter && (
          <div className="sticky bottom-0 bg-white border-t">            {/* Error ABOVE buttons */}
            {errorMessage && (
              <div className="px-4 pt-3">
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
                  {errorMessage}
                </div>
              </div>
            )}

            {/* 🔘 Buttons row */}
            <div className="p-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg border font-semibold"
              >
                Cancel
              </button>

              {onSave && (
                <button
                  onClick={onSave}
                  disabled={disableSave}
                  className={`flex-1 py-2 rounded-lg font-semibold
            ${disableSave
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-purple-600 text-white"
                    }`}
                >
                  Save
                </button>
              )}
            </div>

          </div>
        )}
      </div>
    </div >,
    document.body
  );
}

/* ================= VCARD ================= */
export function saveContact(user: any) {
  if (!user) return;

  const vcard = `
BEGIN:VCARD
VERSION:3.0
N:${user.name};${user.name};;;
FN:${user.name}
ORG:${user.vendor_name || ""}
TITLE:${user.job_title || user.role || ""}
TEL;TYPE=CELL:${user.phone || ""}
EMAIL:${user.email || ""}
URL:https://theacecard.co/${user.username}
END:VCARD
`.trim();

  const blob = new Blob([vcard], {
    type: "text/vcard;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${user.name || "contact"}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Photo Gallery
export function PhotoGallery({
  title,
  items,
  theme,
  onOpen,
  editable = false,
  onEdit,
}: any) {
  const t = resolveTheme(theme);

  return (
    <Section title={title || "Photo Gallery"} theme={theme}>
      <div className="relative">
        {editable && (
          <button
            onClick={onEdit}
            className="absolute -top-4 -right-1 z-20 h-9 w-9 rounded-full shadow-lg
              flex items-center justify-center bg-orange-500 text-white
              hover:scale-110 active:scale-95"
          >
            <Pencil size={14} />
          </button>
        )}

        {!items?.length ? (
          <div className="w-full py-10 text-center opacity-70">
            No photos added yet
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar">
            {items.map((p: any, i: number) => (
              <button
                key={i}
                onClick={() => onOpen(p)}
                className="group block text-left snap-start"
              >
                <div className="relative min-w-[220px] h-48 rounded-2xl overflow-hidden shadow-md">
                  <img
                    src={p.img_url}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,.55), transparent)",
                    }}
                  />

                  {p.title && (
                    <div className="absolute bottom-2 left-2 right-2">
                      <p
                        className="text-xs font-semibold leading-tight line-clamp-2"
                        style={{ color: t.text }}
                      >
                        {p.title}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

function PhotoModal({
  open,
  onClose,
  item,
  theme,
}: {
  open: boolean;
  onClose: () => void;
  item: any;
  theme: any;
}) {
  if (!open || !item) return null;

  const t = resolveTheme(theme);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[390px] rounded-2xl overflow-hidden
          animate-fadeIn max-h-[85vh]"
        style={{
          backgroundColor: t.cardBg,
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full
            flex items-center justify-center transition-opacity hover:opacity-80"
          style={{
            color: t.text,
            backgroundColor: t.cardBg,
            opacity: 0.8,
          }}
        >
          ✕
        </button>

        <div className="relative">
          <img
            src={item.img_url}
            alt={item.title}
            className="w-full h-64 object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.45))",
            }}
          />
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <h3
            className="text-lg font-semibold tracking-tight"
            style={{ color: t.text }}
          >
            {item.title}
          </h3>

          {item.description && (
            <p
              className="text-sm leading-relaxed"
              style={{ color: t.text, opacity: 0.7 }}
            >
              {item.description}
            </p>
          )}

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 rounded-xl text-sm font-semibold
                transition-all active:scale-95 hover:opacity-90"
              style={{
                backgroundColor: t.buttonBg,
                color: t.buttonText,
              }}
            >
              Open Link
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function BackgroundVideo({ src, isPreview = false }: { src?: string; isPreview?: boolean }) {
  if (!src) return null;

  const posClass = isPreview ? "absolute" : "fixed";

  return (
    <div className={`${posClass} inset-0 z-0 overflow-hidden`}>
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function EditableAbout({
  value,
  onChange,
  theme,
  editable = true,
  autoOpen = false,
}: any) {
  const [open, setOpen] = useState(false);
  const t = resolveTheme(theme);
  useEffect(() => {
    if (autoOpen) {
      setOpen(true);
    }
  }, [autoOpen]);
  useEffect(() => {
    if (!open) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      return;
    }

    const scrollY = window.scrollY;

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      const y = document.body.style.top;

      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";

      window.scrollTo(0, parseInt(y || "0") * -1);
    };
  }, [open]);

  return (
    <div
      className="relative rounded-2xl"
    >
      {editable && (
        <button
          onClick={() => setOpen(true)}
          className="absolute -top-4 right-0 z-20 h-9 w-9 rounded-full shadow-lg
                     flex items-center justify-center
                     bg-orange-500
                     text-white transition hover:scale-110 active:scale-95"
        >
          <Pencil size={14} />
        </button>
      )}

      <p
        className={`text-sm leading-relaxed ${!value ? "opacity-60 italic" : ""
          }`}
        style={{ color: t.text }}
      >
        {value || "Tap the pencil to add your story ✨"}
      </p>

      <AboutEditModal
        open={open}
        value={value}
        onClose={() => setOpen(false)}
        onSave={(v) => onChange(v)}
      />
    </div>
  );
}

function AboutEditModal({
  open,
  value,
  onClose,
  onSave,
}: {
  open: boolean;
  value: string;
  onClose: () => void;
  onSave: (v: string) => void;
}) {
  const [text, setText] = useState(value);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-[90%] max-w-md rounded-2xl bg-white p-5 shadow-xl animate-scaleIn">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Edit About</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <textarea
          autoFocus
          rows={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl border p-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
        />

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => {
              onSave(text);
              onClose();
            }}
            className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-semibold"
          >
            Save
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CardButtonsPreview({
  title,
  items,
  theme,
  layout,
  editable = false,
  onEdit,
}: any) {
  const t = resolveTheme(theme);
  const shapeClass = resolveShape(layout?.button_style);

  const visible = (items || []).filter((i: any) => i.enabled);

  if (!visible.length && !editable) return null;

  return (
    <Section title={title || "Card Button"} theme={theme}>
      <div className="relative">
        {editable && (
          <button
            onClick={onEdit}
            className="absolute -top-4 right-0 z-20 h-9 w-9 rounded-full shadow-lg
              flex items-center justify-center bg-orange-500 text-white
              hover:scale-110 active:scale-95"
          >
            <Pencil size={14} />
          </button>
        )}

        {visible.length === 0 ? (
          <div className="py-6 text-center text-sm opacity-60 italic">
            No buttons added
          </div>
        ) : (
          <div
            className={`flex gap-3 ${visible.length === 1 ? "flex-col" : "flex-row"
              }`}
          >
            {visible.slice(0, 2).map((btn: any) => (
              <a
                key={btn.id}
                href={btn.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 text-center py-3 font-semibold shadow-md
                  transition hover:scale-[1.02]
                  ${shapeClass}`}
                style={{
                  backgroundColor: t.buttonBg,
                  color: t.buttonText,
                }}
              >
                {btn.title || "Button"}
              </a>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}

function ResultModal({
  open,
  type,
  message,
  onClose,
}: {
  open: boolean;
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center space-y-4"
      >
        <div
          className={`mx-auto h-14 w-14 rounded-full flex items-center justify-center
            ${type === "success"
              ? "bg-green-100 text-green-600"
              : "bg-red-100 text-red-600"
            }`}
        >
          {type === "success" ? "✓" : "!"}
        </div>

        <h3 className="text-lg font-semibold">
          {type === "success" ? "Success" : "Error"}
        </h3>

        <p className="text-sm text-gray-600">{message}</p>

        <button
          onClick={onClose}
          className="w-full py-2 rounded-xl bg-purple-600 text-white font-semibold"
        >
          OK
        </button>
      </div>
    </div>,
    document.body
  );
}