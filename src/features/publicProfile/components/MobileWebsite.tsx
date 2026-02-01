import {
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Facebook,
  Link2,
  FileText,
  Phone,
  Globe,
  MessageCircle,
  Ghost,     // Snapchat
  Music2,    // TikTok
} from "lucide-react";

import { ProfileWrapper } from "./WebsiteLayout/ProfileWrapper";
import { useState, useEffect } from "react";
import { ConnectModal } from "./ConnectModal";
import { ProfileActions } from "./WebsiteLayout/ProfileActions";
/* ================= HELPERS ================= */

const resolveTheme = (theme: any) => ({
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

export default function MobileWebsite({
  data,
  scrollRef,
}: {
  data: any;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const config = data?.configuration ?? {};
  const [open, setOpen] = useState(false);
  console.log(data)
  const {
    profile = {},
    cover = {},
    layout = {},
    theme = {},
    contact = {},
    banner = {},
    meeting = {},
    social_links = { items: [] },
    youtube = { items: [] },
    links_files = { items: [] },
    products = { items: [] },
    sections = { items: [] },
    photo_gallery = { items: [] },
    video_gallery = { items: [] },
  } = config;


  const orderedSections = sortByRank(sections.items);
  const shapeClass = resolveShape(layout?.button_style);

  useEffect(() => {
    if (!scrollRef?.current) return;
    const el = scrollRef.current;
    el.style.overflow = open ? "hidden" : "auto";
    el.style.touchAction = open ? "none" : "";
  }, [open, scrollRef]);

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


  const fontClass = resolveFontClass(layout?.font);
  const renderSection = (type: string) => {
    switch (type) {
      case "profile":
        return (
          <ProfileWrapper
            profile={profile}
            cover={cover}
            theme={theme}
            user={data}
            layout={layout}
            onConnect={() => setOpen(true)}
          />

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
            items={sortByRank(youtube.items)}
            theme={theme}
          />
        );

      case "contact":
        return (
          <ProfileActions
            user={data}
            theme={theme}
            contact={contact}
            layout={layout}
            onConnect={() => setOpen(true)}
          />
        );

      case "links_files":
        return (
          <Links
            items={sortByRank(links_files.items)}
            theme={theme}
          />
        );

      case "meeting":
        return meeting?.enabled ? (
          <MeetingCTA meeting={meeting} theme={theme} shapeClass={shapeClass} />
        ) : null;

      case "banner":
        return banner?.enabled && banner?.image_url ? (
          <Banner
            image={banner.image_url}
            ctaText={banner.cta_text}
            ctaUrl={banner.cta_url}
            theme={theme}
          />
        ) : null;

      case "photo_gallery":
        return photo_gallery?.items?.length ? (
          <PhotoGallery
            title={photo_gallery.section_title}
            items={sortByRank(photo_gallery.items)}
            theme={theme}
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

  return (
    <div
      className={`relative min-h-screen w-full no-scrollbar overflow-hidden p-4 ${bgClass} ${fontClass}`}
      style={{
        ...(bgClass
          ? { ["--pattern-bg" as any]: theme?.background_color || layout?.color1 || "#2f343a" }
          : resolveBackgroundStyle()),
      }}
    >

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

      <ConnectModal
        open={open}
        onClose={() => setOpen(false)}
        handle={data?.username}
        theme={theme}
      />
    </div>
  );
}

/* ================= UI BLOCKS ================= */

function Section({ title, children, theme }: any) {
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

/* ================= MEETING ================= */

function MeetingCTA({ meeting, theme, shapeClass }: any) {
  const t = resolveTheme(theme);

  return (
    <div className="px-12">
      <a
        href={meeting.meeting_url}
        className={`block text-center py-4 text-sm font-semibold shadow-md ${shapeClass}`}
        style={{ backgroundColor: t.buttonBg, color: t.buttonText }}
      >

        {meeting.button_text || "BOOK A MEETING NOW!"}
      </a>
    </div>
  );
}

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
function YouTube({ items, theme }: any) {
  if (!items?.length) return null;

  return (
    <Section title="Videos" theme={theme}>
      <div className="space-y-4">
        {items.map((v: any) => {
          const id = getYouTubeId(v.url);
          if (!id) return null;

          return (
            <div
              key={v.id}
              className="w-full h-40 rounded-2xl overflow-hidden shadow-md"
            >
              <iframe
                src={`https://www.youtube.com/embed/${id}`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        })}
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
              {s.label === "Instagram" && <Instagram size={32} />}
              {s.label === "LinkedIn" && <Linkedin size={32} />}
              {s.label === "YouTube" && <Youtube size={32} />}
              {s.label === "Twitter" && <Twitter size={32} />}
              {s.label === "Facebook" && <Facebook size={32} />}
              {s.label === "Whatsapp" && <MessageCircle size={32} />}
              {(s.label === "Call Me" || s.id === "phone") && <Phone size={32} />}
              {s.label === "Personal Website" && <Globe size={32} />}
              {s.label === "Snapchat" && <Ghost size={32} />}
              {s.label === "TikTok" && <Music2 size={32} />}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ================= LINKS ================= */

function Links({ items, theme }: any) {
  if (!items?.length) return null;

  const t = resolveTheme(theme)

  return (
    <Section title="Links & Files" theme={theme}>
      <div className="flex flex-col gap-4">
        {items.map((l: any) => (
          <a
            key={l.id}
            href={l.url || l.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl p-2 transition hover:scale-[1.01]"
            style={{ backgroundColor: "transparent" }}
          >
            {/* ICON */}
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center shadow"
              style={{
                backgroundColor: t.buttonBg,
                color: t.buttonText,
              }}
            >
              {l.type === "file" ? (
                <FileText size={16} />
              ) : (
                <Link2 size={16} />
              )}
            </div>

            {/* TEXT */}
            <p
              className="text-sm font-semibold truncate"
              style={{ color: t.text }}
            >
              {l.title}
            </p>
          </a>
        ))}
      </div>
    </Section>
  );
}


/* ================= BANNER ================= */
function Banner({
  image,
  ctaText,
  ctaUrl,
  theme,
}: {
  image: string;
  ctaText?: string;
  ctaUrl?: string;
  theme?: any;
}) {
  const t = resolveTheme(theme)
  return (
    <div className="space-y-2">
      {ctaText && (
        <p
          className="text-sm font-semibold text-left pb-2"
          style={{ color: t?.text }}
        >
          {ctaText}
        </p>
      )}

      <div
        className="cursor-pointer"
        onClick={() => {
          if (ctaUrl) window.open(ctaUrl, "_blank");
        }}
      >
        <img
          src={image}
          className="w-full h-28 rounded-2xl object-cover"
          alt="Banner"
        />
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
function PhotoGallery({ title, items, theme }: any) {
  const t = resolveTheme(theme);
  const [active, setActive] = useState<any | null>(null);

  return (
    <>
      <Section title={title || "Photo Gallery"} theme={theme}>
        <div className="grid grid-cols-2 gap-3">
          {items.map((p: any, i: number) => (
            <button
              key={i}
              onClick={() => setActive(p)}
              className="group block text-left"
            >
              <div className="relative w-full h-32 rounded-xl overflow-hidden shadow-md">
                <img
                  src={p.img_url}
                  alt={p.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* permanent gradient */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(0,0,0,.55), transparent)",
                  }}
                />

                {/* ALWAYS visible title */}
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

      {/* MODAL */}
      <PhotoModal
        open={!!active}
        item={active}
        theme={theme}
        onClose={() => setActive(null)}
      />
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
      className="fixed inset-0 z-[999] bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.img_url}
          alt={item.title}
          className="w-full h-56 object-cover"
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
            className="w-full text-xs text-gray-400 mt-1"
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
              className="min-w-[260px] snap-start rounded-2xl overflow-hidden shadow-lg"
              style={{ backgroundColor: t.cardBg }}
            >

              {/* VIDEO */}
              <div className="w-full h-40 bg-black">
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
              <div className="p-3 space-y-1">
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

                <a
                  href={v.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs font-semibold"
                  style={{ color: t.buttonText }}
                >
                  Open in new tab →
                </a>
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
