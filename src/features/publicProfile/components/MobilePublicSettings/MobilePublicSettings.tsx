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
import { ProfileLayoutModal } from "./Profile/ProfileLayoutModal";
import { ProfileLayoutEditor } from "./Profile/ProfileLayoutEditor";
import { uploadImage } from "../../services/publicProfile.api";
import { VideoGalleryEditModal } from "./VideoGallery/VideoGallery";
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
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

/* ================= HELPERS ================= */

export const resolveTheme = (theme: any) => ({
  cardBg: theme.card_background || "#6B6E93",
  buttonBg: theme.button_color || "#A5A6AB",
  text: theme.card_text || "#EA3636",
  buttonText: theme.button_text || "#5F29F5",
});


const getYouTubeId = (url?: string) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
  return match?.[1];
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
      return ""; // style 1 (default)
  }
};
/* ================= COMPONENT ================= */
export default function MobilePublicSettings({
  data,
  scrollRef,
  onLogout,
}: {
  data: any;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onLogout?: () => void;
}) {

  const config = data?.configuration ?? {};

  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  const [open, setOpen] = useState(false);
  const [editProducts, setEditProducts] = useState(false);

  const {
    // layout = {},
    // theme = {},
    banner = {},
    meeting = {},
    sections = { items: [] },
  } = config;

  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.publicProfile.saving);
  const [editSection, setEditSection] = useState<any>(null);

  // local editable copy
  const [draft, setDraft] = useState<any>(config);

  const handleSave = () => {
    dispatch(savePublicProfile({ config: draft }));
  };

  // keep in sync when API loads
  useEffect(() => {
    if (!config || !Object.keys(config).length) return;

    setDraft((prev: any) => ({
      ...prev,
      ...config,
      contact: { ...prev.contact, ...config.contact },

      youtube: config.youtube || prev.youtube || { items: [] },
      links_files: config.links_files || prev.links_files || { items: [] },
      social_links: config.social_links || prev.social_links || { items: [] }, // 👈 FIX
    }));
  }, [config]);


  const [openLayoutEditor, setOpenLayoutEditor] = useState(false);

  const orderedSections = sortByRank(sections.items);
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

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );


  const isMobile = useIsMobile();
  const updateDraft = (updater: any) => {
    setDraft((prev: any) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  };

  const fontClass = resolveFontClass(draft.layout?.font);
  console.log(draft)
  const renderSection = (type: string) => {
    switch (type) {
      case "profile":
        return (
          <div className="space-y-3">
            <ProfileWrapper
              profile={draft.profile}   // 👈 must be from draft
              cover={draft.cover}
              theme={draft.theme}
              user={data}
              layout={draft.layout}
              onConnect={() => isMobile && setOpen(true)}
              onEdit={() => setOpenLayoutEditor(true)}
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
            editable={p.locked}
            onEdit={() => setEditProducts(true)}
          />
        );
      }

      case "video_gallery": {
        const vg = draft.video_gallery;
        return (
          <VideoGallery
            title={vg?.section_title}
            items={sortByRank(vg?.items || [])}  // 👈 pass empty array
            theme={draft.theme}
            editable={!draft.video_gallery?.locked}
            galleryValue={vg}
            onGalleryChange={(v: any) =>
              setDraft((prev: any) => ({
                ...prev,
                video_gallery: v,
              }))
            }
          />
        );
      }

      case "youtube":
        return (
          <YouTube
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
            onContactChange={(updater: any) =>
              setDraft((prev: any) => ({
                ...prev,
                contact:
                  typeof updater === "function"
                    ? updater(prev.contact || {})
                    : updater,
              }))
            }

            onConnect={() => isMobile && setOpen(true)}
          />
        );

      case "links_files":
        return (
          <Links
            items={draft.links_files?.items || []}
            theme={draft.theme}
            editable={!draft.links_files?.locked} // 👈 only if NOT locked
            onChange={(next: any) =>
              setDraft((prev: any) => ({
                ...prev,
                links_files: {
                  ...prev.links_files,
                  items: next,
                },
              }))
            }
          />
        );

      case "meeting":
        return meeting?.enabled ? (
          <EditableMeetingCTA
            meeting={draft.meeting}
            theme={draft.theme}
            shapeClass={shapeClass}
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
            editable={!pg?.locked}              // 🔒 respect lock
            onEdit={() => setEditPhotoGallery(true)}   // open modal
            onOpen={setActivePhoto}
          />
        );
      }


      default:
        return null;
    }
  };

  const bgClass = (() => {
    switch (draft.layout?.use_background) {
      case "polka":
        return "bg-pattern bg-polka";
      case "waves":
        return "bg-pattern bg-waves";
      case "stripes":
        return "bg-pattern bg-stripes";
      case "zigzag":
        return "bg-pattern bg-zigzag";
      case "video":
        return "";
      default:
        return "";
    }
  })();



  const [editPhotoGallery, setEditPhotoGallery] = useState(false);

  const resolveBackgroundStyle = () => {
    // IMAGE
    if (draft.layout?.use_background === "image" && draft.layout?.background_image) {
      return {
        backgroundImage: `url(${draft.layout.background_image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    // PATTERN BACKGROUNDS → handled by CSS
    if (
      ["waves", "polka", "stripes", "zigzag"].includes(
        draft.layout?.use_background || ""
      )
    ) {
      return {};
    }

    // GRADIENT
    if (draft.layout?.use_background === "gradient") {
      const from = draft.layout?.color1 || "#7c3aed";
      const to = draft.layout?.color2 || "#6366f1";

      const validDirections = {
        "to-r": "to right",
        "to-l": "to left",
        "to-b": "to bottom",
        "to-t": "to top",
      };

      const dir =
        validDirections[draft.layout?.direction as keyof typeof validDirections] ||
        "to right";

      return {
        backgroundImage: `linear-gradient(${dir}, ${from}, ${to})`,
      };
    }

    // SOLID
    return {
      backgroundColor:
        draft.layout?.color1 || draft.theme?.background_color || "#000",
    };
  };
  const safeSort = (arr: any[]) =>
    Array.isArray(arr)
      ? [...arr].sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
      : [];

  const youtubeSorted = React.useMemo(
    () => safeSort(draft.youtube?.items),
    [draft.youtube?.items]
  );


  useEffect(() => {
    if (!draft.layout?.use_custom_font || !draft.layout?.custom_font) return;

    const fontUrl = draft.layout.custom_font;

    const font = new FontFace("UserCustomFont", `url(${fontUrl})`);

    font
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);

        // expose to Tailwind + inline styles
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

  // useEffect(() => {
  //   // always test with this local URL
  //   const fontUrl = "http://localhost:5173/fonts/BitcountSingle_Cursive-Regular.ttf";

  //   const font = new FontFace("CustomFont", `url(${fontUrl})`);

  //   font
  //     .load()
  //     .then((loaded) => {
  //       document.fonts.add(loaded);
  //       document.documentElement.style.setProperty(
  //         "--custom-font",
  //         "CustomFont"
  //       );

  //       console.log("✅ Local test font loaded");
  //     })
  //     .catch((err) => {
  //       console.error("❌ Local font failed", err);
  //     });
  // }, []);  // empty dependency for local test only

  // any overlay open?
  const isAnyModalOpen =
    open ||                     // ConnectModal
    !!activePhoto ||            // PhotoModal
    editProducts ||
    editPhotoGallery ||
    openLayoutEditor ||
    editSection?.type === "youtube";

  useEffect(() => {
    if (!isAnyModalOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      return;
    }

    // lock body
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
  }, [isAnyModalOpen]);

  return (
    <div
      className={`relative min-h-screen w-full no-scrollbar overflow-hidden p-4 pb-28 ${bgClass} ${fontClass}`}
      style={{
        ...(bgClass
          ? { ["--pattern-bg" as any]: draft.theme?.background_color || draft.layout?.color1 || "#2f343a" }
          : resolveBackgroundStyle()),
      }}
    >
      <ConnectModal
        open={open}
        onClose={() => setOpen(false)}
        handle={data?.username}
        theme={draft.theme}
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
        onClose={() => setEditSection(null)}
      >
        <h3 className="text-lg font-semibold">Manage YouTube Videos</h3>

        {/* ADD */}
        <button
          onClick={() =>
            setDraft((prev: any) => {
              const items = prev.youtube?.items || [];
              return {
                ...prev,
                youtube: {
                  ...prev.youtube,
                  items: [
                    ...items,
                    { id: Date.now(), url: "", rank: items.length + 1 },
                  ],
                },
              };
            })
          }
          className="w-full py-2 rounded-xl border border-dashed
             text-sm font-semibold text-gray-600 hover:bg-gray-100"
        >
          ➕ Add Video
        </button>

        {/* LIST */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(e) => {
            const { active, over } = e;
            if (!over || active.id === over.id) return;

            setDraft((prev: any) => {
              const items = safeSort(prev.youtube?.items);

              const oldIndex = items.findIndex(i => i.id === active.id);
              const newIndex = items.findIndex(i => i.id === over.id);

              const reordered = arrayMove(items, oldIndex, newIndex)
                .map((i, idx) => ({ ...i, rank: idx + 1 }));

              return {
                ...prev,
                youtube: {
                  ...prev.youtube,
                  items: reordered,
                },
              };
            });
          }}

        >
          <SortableContext
            items={youtubeSorted.map((i: any) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2 max-h-72 overflow-y-auto overscroll-contain touch-pan-y">


              {youtubeSorted.map((v: any) => (
                <YouTubeRow key={v.id} v={v} setDraft={setDraft} />
              ))}
            </div>
          </SortableContext>

        </DndContext>


        <div className="pt-3">
          <button
            onClick={() => setEditSection(null)}
            className="w-full py-2 rounded-lg bg-purple-600 text-white"
          >
            Done
          </button>
        </div>

      </EditModal>

      {/* Photo gallery */}
      <EditModal
        open={editPhotoGallery}
        onClose={() => setEditPhotoGallery(false)}
      >
        <h3 className="text-lg font-semibold">Manage Photo Gallery</h3>

        <PhotoGallerySection
          value={draft.photo_gallery}
          disabled={draft.photo_gallery?.locked}
          onChange={(v: any) =>
            setDraft((prev: any) => ({
              ...prev,
              photo_gallery: v,
            }))
          }
        />

        <div className="pt-3">
          <button
            onClick={() => setEditPhotoGallery(false)}
            className="w-full py-2 rounded-lg bg-purple-600 text-white"
          >
            Done
          </button>
        </div>
      </EditModal>

      <ProductsEditModal
        open={editProducts}
        onClose={() => setEditProducts(false)}
        value={draft.products}
        onChange={(v: any) =>
          setDraft((prev: any) => ({ ...prev, products: v }))
        }
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
          className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <ProfileLayoutModal
          open={openLayoutEditor}
          onClose={() => setOpenLayoutEditor(false)}
        >
          <ProfileLayoutEditor
            config={draft}
            update={setDraft}
            isLayoutLocked={false}
            isReadOnly={(m: any) => m?.locked}
            uploadImage={uploadImage}
          />
        </ProfileLayoutModal>


      </div>


      <span className="wave-3 absolute inset-0" />
      <span className="wave-fade" />
      {draft.layout?.use_background === "video" && (
        <BackgroundVideo src={draft.layout?.background_video} />
      )}
      <div className="relative z-10 space-y-6">

        {orderedSections.map((s: any) =>
          s?.enabled ? (
            <div key={s.id}>{renderSection(s.type)}</div>
          ) : null
        )}
      </div>

    </div>
  );
}

/* ================= UI BLOCKS ================= */
function YouTubeRow({
  v,
  setDraft,
}: {
  v: any;
  setDraft: any;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: v.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center gap-2 bg-gray-50 p-2 rounded-lg border
        ${isDragging ? "opacity-50 scale-[1.02] z-50" : ""}
      `}
    >
      {/* drag handle */}
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing select-none
                   touch-none text-gray-500 px-2 py-1"
      >
        ☰
      </span>

      {/* input */}
      <input
        value={v.url}
        onChange={(e) =>
          setDraft((prev: any) => ({
            ...prev,
            youtube: {
              ...prev.youtube,
              items: prev.youtube.items.map((i: any) =>
                i.id === v.id ? { ...i, url: e.target.value } : i
              ),
            },
          }))
        }
        placeholder="YouTube link"
        className="flex-1 border rounded-md p-2 text-sm"
      />

      {/* delete */}
      <button
        onClick={() =>
          setDraft((prev: any) => ({
            ...prev,
            youtube: {
              ...prev.youtube,
              items: prev.youtube.items
                .filter((i: any) => i.id !== v.id)
                .map((i: any, r: number) => ({ ...i, rank: r + 1 })),
            },
          }))
        }
        className="text-red-500 text-sm px-2"
      >
        ✕
      </button>
    </div>
  );
}


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
                    style={{ color: theme.button_text }}
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
    src={`https://www.youtube.com/embed/${id}`}
    className="w-full h-full"
    frameBorder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowFullScreen
  />
));

function YouTube({
  items,
  theme,
  onEdit,
  editable = true, // 👈 new
}: {
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
    setActive(index);
  };

  return (
    <Section title="Videos" theme={theme}>
      {/* CAROUSEL */}
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
        {valid.map((v) => {
          const id = getYouTubeId(v.url);
          return (
            <div
              key={v.id}
              className="relative min-w-full h-48 snap-center px-1"
            >
              {/* ROUND EDIT ICON */}
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

              {/* iframe blocker layer so drag works */}
              {/* <div className="absolute inset-0 z-10" /> */}

              <div className="w-full h-full rounded-2xl overflow-hidden shadow-md">
                <YoutubeEmbed id={id!} />
              </div>
            </div>
          );
        })}
      </div>

      {/* DOTS */}
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

  // 👇 ONLY enabled
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
              {s.id === "instagram" && <SiInstagram size={32} />}
              {s.id === "linkedin" && <SiLinkedin size={32} />}
              {s.id === "youtube" && <SiYoutube size={32} />}
              {s.id === "twitter" && <SiX size={32} />}
              {s.id === "facebook" && <SiFacebook size={32} />}
              {s.id === "whatsapp" && <SiWhatsapp size={32} />}
              {s.id === "phone" && <FiPhone size={32} />}
              {s.id === "website" && <FiGlobe size={32} />}
              {s.id === "snapchat" && <SiSnapchat size={32} />}
              {s.id === "tiktok" && <SiTiktok size={32} />}
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

export function EditModal({ open, onClose, children }: any) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}   // 👈 only backdrop closes
    >
      <div
        onClick={(e) => e.stopPropagation()} // 👈 block inner clicks
        className="w-full max-w-md bg-white rounded-2xl shadow-xl 
                   max-h-[85vh] overflow-y-auto p-4 space-y-3 animate-fadeIn"
      >
        {children}
      </div>
    </div>
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
        {/* FLOATING EDIT ICON */}
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
      className="absolute inset-0 z-[9999] bg-black/70 flex justify-center pt-4 px-4 pointer-events-auto"
      onClick={onClose}
    >


      {/* MOBILE FRAME */}
      <div
        className="relative w-full max-w-[390px] bg-white rounded-3xl shadow-2xl animate-fadeIn
             max-h-[85%] self-start"
        onClick={(e) => e.stopPropagation()}
      >

        <img
          src={item.img_url}
          alt={item.title}
          className="w-full h-64 object-cover"
        />

        <div className="p-4 space-y-3">
          <h3 className="text-lg font-semibold" style={{ color: t.text }}>
            {item.title}
          </h3>

          {item.description && (
            <p className="text-sm opacity-80" style={{ color: t.text }}>
              {item.description}
            </p>
          )}

          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center py-2 rounded-xl text-sm font-semibold shadow-md transition"
              style={{
                backgroundColor: t.buttonBg,
                color: t.buttonText,
              }}
            >
              Open Link
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full text-xs text-gray-400 mt-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function VideoGallery({
  title,
  items,
  theme,
  editable = false,
  galleryValue,
  onGalleryChange,
}: any) {
  const t = resolveTheme(theme);
  const [open, setOpen] = useState(false);

  const isYouTube = (url?: string) =>
    !!url && /youtube\.com|youtu\.be/.test(url);

  const isDirectVideo = (url?: string) =>
    !!url && /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <Section title={title || "Video Gallery"} theme={theme}>
      <div className="relative">
        {/* FLOATING EDIT ICON */}
        {editable && (
          <button
            onClick={() => setOpen(true)}
            className="absolute -top-4 -right-0 z-20 h-9 w-9 rounded-full shadow-lg
                     flex items-center justify-center
                     bg-orange-500 
                     text-white hover:scale-110 active:scale-95"
          >
            <Pencil size={14} />
          </button>
        )}

        {/* EMPTY STATE */}
        {!items?.length ? (
          <div className="w-full py-10 text-center rounded-2xl">
            <p className="text-sm opacity-70" style={{ color: t.text }}>
              No videos added yet
            </p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
            {items.map((v: any, i: number) => {
              const id = getYouTubeId(v.video_url);
              if (!id || !v.enabled) return null;

              return (
                <div
                  key={i}
                  className="min-w-[220px] h-48 snap-start rounded-2xl overflow-hidden shadow-lg flex flex-col"
                  style={{ backgroundColor: t.cardBg }}
                >
                  {/* VIDEO */}
                  <div className="w-full h-[140px] bg-black">
                    {isYouTube(v.video_url) ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${id}`}
                        className="w-full h-full"
                        frameBorder="0"
                        allowFullScreen
                      />
                    ) : isDirectVideo(v.video_url) ? (
                      <video
                        src={v.video_url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-sm">
                        Video preview not available
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="px-3 py-1 space-y-1">
                    <h4
                      className="text-sm font-semibold line-clamp-1"
                      style={{ color: t.text }}
                    >
                      {v.title}
                    </h4>

                    {v.description && (
                      <p
                        className="text-xs opacity-80 line-clamp-2"
                        style={{ color: t.text }}
                      >
                        {v.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MODAL */}
        <VideoGalleryEditModal
          open={open}
          value={galleryValue}
          disabled={false}
          onClose={() => setOpen(false)}
          onSave={(v: any) => onGalleryChange(v)}
        />
      </div>
    </Section>
  );
}


function BackgroundVideo({ src }: { src?: string }) {
  if (!src) return null;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
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
}: any) {
  const [open, setOpen] = useState(false);
  const t = resolveTheme(theme);

  // 🔒 lock background scroll when modal is open
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
      {/* FLOATING EDIT */}
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

      {/* MODAL */}
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
