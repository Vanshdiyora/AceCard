// import {
//   Link2,
//   FileText,
// } from "lucide-react";
import Links from "./Links/Links";
import { Pencil } from "lucide-react";
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
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { savePublicProfile } from "../../slice";
import { ProfileTypeInlinePicker } from "./Profile/ProfileTypeInlinePicker";
import { FiPhone, FiGlobe } from "react-icons/fi";
import React from "react";
import { useState, useEffect } from "react";
import { ConnectModal } from "../ConnectModal";
import { ProfileActions } from "../WebsiteLayout/ProfileActions";
import { ProfileWrapper } from "../WebsiteLayout/ProfileWrapper";
import { Banner } from "./Banner/Banner";
import { EditableMeetingCTA } from "./Meeting/EditableMeetingCTA";
/* ================= HELPERS ================= */

// function injectScript(id: string, src?: string, inner?: string) {
//   if (document.getElementById(id)) return;

//   const s = document.createElement("script");
//   s.id = id;
//   s.async = true;

//   if (src) s.src = src;
//   if (inner) s.innerHTML = inner;

//   document.head.appendChild(s);
// }

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
  return arr
    .filter((i) => i?.enabled !== false)
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
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
}: {
  data: any;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const config = data?.configuration ?? {};

  //   useEffect(() => {
  //     if (!data) return;

  //     /* ---------- META ---------- */
  //     if (data.meta_pixel_id) {
  //       injectScript(
  //         "fb-pixel",
  //         "https://connect.facebook.net/en_US/fbevents.js",
  //         `
  //         !function(f,b,e,v,n,t,s){
  //         if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  //         n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  //         if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  //         n.queue=[];t=b.createElement(e);t.async=!0;
  //         t.src=v;s=b.getElementsByTagName(e)[0];
  //         s.parentNode.insertBefore(t,s)
  //         }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

  //         fbq('init', '${data.meta_pixel_id}');
  //         fbq('track', 'PageView');
  //       `
  //       );
  //     }

  //     /* ---------- GOOGLE / YOUTUBE ---------- */
  //     if (data.google_analytics_id) {
  //       injectScript(
  //         "gtag-js",
  //         `https://www.googletagmanager.com/gtag/js?id=${data.google_analytics_id}`
  //       );

  //       injectScript(
  //         "gtag-init",
  //         "",
  //         `
  //         window.dataLayer = window.dataLayer || [];
  //         function gtag(){dataLayer.push(arguments);}
  //         gtag('js', new Date());
  //         gtag('config', '${data.google_analytics_id}');
  //       `
  //       );
  //     }

  //     /* ---------- LINKEDIN ---------- */
  //     if (data.linkedin_insight_tag_id) {
  //       injectScript(
  //         "linkedin-pixel",
  //         "https://snap.licdn.com/li.lms-analytics/insight.min.js",
  //         `
  //         _linkedin_partner_id = "${data.linkedin_insight_tag_id}";
  //         window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
  //         window._linkedin_data_partner_ids.push(_linkedin_partner_id);
  //       `
  //       );
  //     }
  //   }, [
  //     data?.meta_pixel_id,
  //     data?.google_analytics_id,
  //     data?.linkedin_insight_tag_id,
  //   ]);


  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  const [open, setOpen] = useState(false);

  const {
    profile = {},
    // cover = {},
    layout = {},
    theme = {},
    contact = {},
    banner = {},
    meeting = {},
    social_links = { items: [] },
    // youtube = { items: [] },
    // links_files = { items: [] },
    products = { items: [] },
    sections = { items: [] },
    photo_gallery = { items: [] },
    video_gallery = { items: [] },
  } = config;

  const dispatch = useAppDispatch();
  const saving = useAppSelector((s) => s.publicProfile.saving);
  const [editSection, setEditSection] = useState<any>(null);

  // local editable copy
  const [draft, setDraft] = useState<any>(config);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  console.log(draft)
  const handleSave = () => {
    dispatch(savePublicProfile({ config: draft }));
  };

  // keep in sync when API loads
  useEffect(() => {
    setDraft({
      ...config,
      youtube: config.youtube || { items: [] },
      links_files: config.links_files || { items: [] }, // 👈 ADD THIS
    });
  }, [config]);


  const orderedSections = sortByRank(sections.items);
  const shapeClass = resolveShape(layout?.button_style);

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

  const isMobile = useIsMobile();
  const updateDraft = (updater: any) => {
    setDraft((prev: any) =>
      typeof updater === "function" ? updater(prev) : updater
    );
  };

  const fontClass = resolveFontClass(layout?.font);
  const renderSection = (type: string) => {
    switch (type) {
      case "profile":
        return (
          <div className="space-y-3">
            <ProfileWrapper
              profile={draft.profile}   // 👈 must be from draft
              cover={draft.cover}
              theme={theme}
              user={data}
              layout={draft.layout}
              onConnect={() => isMobile && setOpen(true)}
              onEdit={() => setShowProfileEditor((v) => !v)}
              onProfileChange={updateDraft}
            />


            {/* 👇 EDIT PANEL COMES *RIGHT BELOW PROFILE* */}
            {showProfileEditor && (
              <ProfileTypeInlinePicker
                current={draft.layout?.profile_type || 1}

                onSelect={(type) => {
                  setDraft((prev: any) => ({
                    ...prev,
                    layout: {
                      ...prev.layout,
                      profile_type: type,
                    },
                  }));
                }}
              />
            )}
          </div>
        );

      case "about":
        return profile.description ? (
          <Section title="About" theme={theme}>
            <p
              className="text-sm leading-relaxed"
              style={{ color: theme.card_text }}
            >
              {profile.description}
            </p>
          </Section>
        ) : null;


      case "social_links":
        return (
          <Social
            items={sortByRank(social_links.items)}
            theme={theme}
            shapeClass={shapeClass}
          />
        );

      case "products":
        return (
          <Products
            title={products.section_title}
            items={sortByRank(products.items)}
            theme={theme}
            showPrice={products.toggle_price}
          />

        );
      case "video_gallery":
        return video_gallery?.items?.length ? (
          <VideoGallery
            title={video_gallery.section_title}
            items={sortByRank(video_gallery.items)}
            theme={theme}
          />
        ) : null;

      case "youtube":
        return (
          <YouTube
            items={sortByRank(draft.youtube?.items || [])}
            theme={theme}
            editable={!draft.youtube?.locked}
            onEdit={(item) => setEditSection({ type: "youtube", item })}
          />
        );

      case "contact":
        return (
          <ProfileActions
            user={data}
            theme={theme}
            contact={contact}
            layout={layout}
            onConnect={() => isMobile && setOpen(true)}

          />
        );

      case "links_files":
        return (
          <Links
            items={draft.links_files?.items || []}
            theme={theme}
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
            theme={theme}
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
            theme={theme}
            editable={!draft.banner?.locked}
            onBannerChange={(updater: any) =>
              setDraft((prev: any) =>
                typeof updater === "function" ? updater(prev) : updater
              )
            }
          />


        ) : null;

      case "photo_gallery":
        return photo_gallery?.items?.length ? (
          <PhotoGallery
            title={photo_gallery.section_title}
            items={sortByRank(photo_gallery.items)}
            theme={theme}
            onOpen={setActivePhoto}   // 👈 add
          />
        ) : null;

      default:
        return null;
    }
  };
  const bgClass = (() => {
    switch (layout?.use_background) {
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



  const resolveBackgroundStyle = () => {
    // IMAGE
    if (layout?.use_background === "image" && layout?.background_image) {
      return {
        backgroundImage: `url(${layout.background_image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

    // PATTERN BACKGROUNDS → handled by CSS
    if (
      ["waves", "polka", "stripes", "zigzag"].includes(
        layout?.use_background || ""
      )
    ) {
      return {};
    }

    // GRADIENT
    if (layout?.use_background === "gradient") {
      const from = layout?.color1 || "#7c3aed";
      const to = layout?.color2 || "#6366f1";

      const validDirections = {
        "to-r": "to right",
        "to-l": "to left",
        "to-b": "to bottom",
        "to-t": "to top",
      };

      const dir =
        validDirections[layout?.direction as keyof typeof validDirections] ||
        "to right";

      return {
        backgroundImage: `linear-gradient(${dir}, ${from}, ${to})`,
      };
    }

    // SOLID
    return {
      backgroundColor:
        layout?.color1 || theme?.background_color || "#000",
    };
  };

  useEffect(() => {
    if (!layout?.use_custom_font || !layout?.custom_font) return;

    const fontUrl = layout.custom_font;

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
  }, [layout?.custom_font, layout?.use_custom_font]);

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
  const dragFrom = React.useRef<number | null>(null);
  return (
    <div
      className={`relative min-h-screen w-full no-scrollbar overflow-hidden p-4 ${bgClass} ${fontClass}`}
      style={{
        ...(bgClass
          ? { ["--pattern-bg" as any]: theme?.background_color || layout?.color1 || "#2f343a" }
          : resolveBackgroundStyle()),
      }}
    >
      <ConnectModal
        open={open}
        onClose={() => setOpen(false)}
        handle={data?.username}
        theme={theme}
      />

      {/* MODAL */}
      <PhotoModal
        open={!!activePhoto}
        item={activePhoto}
        theme={theme}
        onClose={() => setActivePhoto(null)}
      />

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
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {(draft.youtube?.items || []).map((v: any, idx: number) => (
            <div
              key={v.id}
              draggable
              onDragStart={() => (dragFrom.current = idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragFrom.current === null) return;

                const from = dragFrom.current;
                const to = idx;

                setDraft((prev: any) => {
                  const items = [...prev.youtube.items];
                  const [moved] = items.splice(from, 1);
                  items.splice(to, 0, moved);

                  return {
                    ...prev,
                    youtube: {
                      ...prev.youtube,
                      items: items.map((i, r) => ({ ...i, rank: r + 1 })),
                    },
                  };
                });

                dragFrom.current = null;
              }}
              className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border cursor-move active:scale-[0.98]"
            >
              <span className="text-xs text-gray-400">☰</span>

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
          ))}
        </div>
        <div className="pt-3">
          <button
            onClick={() => setEditSection(null)}
            className="w-full py-2 rounded-lg bg-indigo-600 text-white"
          >
            Done
          </button>
        </div>

      </EditModal>


      {/* SAVE BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur border-t shadow flex justify-center p-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 shadow disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>


      <span className="wave-3 absolute inset-0" />
      <span className="wave-fade" />
      {layout?.use_background === "video" && (
        <BackgroundVideo src={layout?.background_video} />
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
}: {
  title: string;
  items: any[];
  theme: any;
  showPrice: boolean;
}) {
  if (!items?.length) return null;

  return (
    <Section title={title || "Products"} theme={theme}>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
        {items.map((p: any) => (
          <div
            key={p.id}
            className="relative min-w-[220px] h-48 rounded-2xl overflow-hidden snap-start shadow-lg transition hover:scale-[1.02]"
            style={{ backgroundColor: theme.card_background }}
          >
            {/* IMAGE */}
            <img
              src={p.image_url || p.product_img_url}
              alt={p.name}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* OVERLAY */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* CONTENT */}
            <div className="absolute bottom-3 left-3 right-3">
              <h3
                className="text-sm font-semibold leading-tight line-clamp-2"
                style={{ color: theme.card_text }}
              >
                {p.name}
              </h3>

              {showPrice && (
                <p
                  className="text-xs mt-1 font-medium"
                  style={{ color: theme.button_text }}
                >
                  ₹{p.price}
                </p>
              )}
            </div>
          </div>
        ))}
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
                  className="absolute top-2 right-3 z-20 h-8 w-8 rounded-full shadow
                    flex items-center justify-center transition hover:scale-105
                    bg-orange-500 text-white"
                  title="Edit"
                >
                  <Pencil size={14} />
                </button>
              )}

              {/* iframe blocker layer so drag works */}
              <div className="absolute inset-0 z-10" />

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

  const rows: any[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3));
  }

  return (
    <div className="flex flex-col items-center gap-4">
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

/* ================= LINKS ================= */

// function Links({ items, theme }: any) {
//   if (!items?.length) return null;

//   const t = resolveTheme(theme)

//   return (
//     <Section title="Links & Files" theme={theme}>
//       <div className="flex flex-col gap-4">
//         {items.map((l: any) => (
//           <a
//             key={l.id}
//             href={l.url || l.file_url}
//             target="_blank"
//             rel="noopener noreferrer"
//             className="flex items-center gap-3 rounded-xl p-2 transition hover:scale-[1.01]"
//             style={{ backgroundColor: "transparent" }}
//           >
//             {/* ICON */}
//             <div
//               className="h-9 w-9 rounded-full flex items-center justify-center shadow"
//               style={{
//                 backgroundColor: t.buttonBg,
//                 color: t.buttonText,
//               }}
//             >
//               {l.type === "file" ? (
//                 <FileText size={16} />
//               ) : (
//                 <Link2 size={16} />
//               )}
//             </div>

//             {/* TEXT */}
//             <p
//               className="text-sm font-semibold truncate"
//               style={{ color: t.text }}
//             >
//               {l.title}
//             </p>
//           </a>
//         ))}
//       </div>
//     </Section>
//   );
// }

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

/* ================= BANNER ================= */
// function Banner({
//   image,
//   ctaText,
//   ctaUrl,
//   theme,
// }: {
//   image: string;
//   ctaText?: string;
//   ctaUrl?: string;
//   theme?: any;
// }) {
//   const t = resolveTheme(theme)
//   return (
//     <div className="space-y-2">
//       {ctaText && (
//         <p
//           className="text-sm font-semibold text-left pb-2"
//           style={{ color: t?.text }}
//         >
//           {ctaText}
//         </p>
//       )}

//       <div
//         className="cursor-pointer"
//         onClick={() => {
//           if (ctaUrl) window.open(ctaUrl, "_blank");
//         }}
//       >
//         <img
//           src={image}
//           className="w-full h-28 rounded-2xl object-cover"
//           alt="Banner"
//         />
//       </div>
//     </div>
//   );
// }

function EditModal({ open, onClose, children }: any) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center px-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4 space-y-3 animate-fadeIn"
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
function PhotoGallery({ title, items, theme, onOpen }: any) {

  const t = resolveTheme(theme);

  if (!items?.length) return null;

  return (
    <>
      <Section title={title || "Photo Gallery"} theme={theme}>
        <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory no-scrollbar">
          {items.map((p: any, i: number) => (
            <button
              key={i}
              onClick={() => {
                const scroller = document.querySelector(".flex-1.overflow-y-auto");

                console.log(scroller)
                if (scroller) {
                  scroller.scrollTo({ top: 0, behavior: "smooth" });
                }

                setTimeout(() => {
                  onOpen(p);
                }, 80);
              }}
              className="group block text-left snap-start"
            >
              <div className="relative min-w-[220px] h-48 rounded-2xl overflow-hidden shadow-md">
                <img
                  src={p.img_url}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,.55), transparent)",
                  }}
                />

                {/* title */}
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
      </Section>


    </>
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


function VideoGallery({ title, items, theme }: any) {
  const t = resolveTheme(theme);
  const isYouTube = (url?: string) =>
    !!url && /youtube\.com|youtu\.be/.test(url);

  const isDirectVideo = (url?: string) =>
    !!url && /\.(mp4|webm|ogg)$/i.test(url);

  return (
    <Section title={title || "Video Gallery"} theme={theme}>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
        {items.map((v: any, i: number) => {
          const id = getYouTubeId(v.video_url);
          if (!id) return null;

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
                    src={`https://www.youtube.com/embed/${getYouTubeId(v.video_url)}`}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
