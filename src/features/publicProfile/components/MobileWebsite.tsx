import {
  Link2,
  FileText,
} from "lucide-react";

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
import { normalizeProfile } from "../utils/normalizeProfile";
import { FiPhone, FiGlobe } from "react-icons/fi";

import { ProfileWrapper } from "./WebsiteLayout/ProfileWrapper";
import { useState, useEffect } from "react";
import { ConnectModal } from "./ConnectModal";
import { ProfileActions } from "./WebsiteLayout/ProfileActions";
/* ================= HELPERS ================= */

function injectScript(id: string, src?: string, inner?: string) {
  if (document.getElementById(id)) return;

  const s = document.createElement("script");
  s.id = id;
  s.async = true;

  if (src) s.src = src;
  if (inner) s.innerHTML = inner;

  document.head.appendChild(s);
}

const resolveTheme = (theme: any) => ({
  cardBg: theme.card_background || "#6B6E93",
  buttonBg: theme.button_color || "#A5A6AB",
  text: theme.card_text || "#EA3636",
  buttonText: theme.button_text || "#5F29F5",
  imageText: theme.image_text_color, 
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
}: {
  data: any;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const normalized = normalizeProfile(data);
  const config = normalized;


  useEffect(() => {
    if (!data) return;

    /* ---------- META ---------- */
    if (data.meta_pixel_id) {
      injectScript(
        "fb-pixel",
        "https://connect.facebook.net/en_US/fbevents.js",
        `
        !function(f,b,e,v,n,t,s){
        if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)
        }(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');

        fbq('init', '${data.meta_pixel_id}');
        fbq('track', 'PageView');
      `
      );
    }

    /* ---------- GOOGLE / YOUTUBE ---------- */
    if (data.google_analytics_id) {
      injectScript(
        "gtag-js",
        `https://www.googletagmanager.com/gtag/js?id=${data.google_analytics_id}`
      );

      injectScript(
        "gtag-init",
        "",
        `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${data.google_analytics_id}');
      `
      );
    }

    /* ---------- LINKEDIN ---------- */
    if (data.linkedin_insight_tag_id) {
      injectScript(
        "linkedin-pixel",
        "https://snap.licdn.com/li.lms-analytics/insight.min.js",
        `
        _linkedin_partner_id = "${data.linkedin_insight_tag_id}";
        window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
      `
      );
    }
  }, [
    data?.meta_pixel_id,
    data?.google_analytics_id,
    data?.linkedin_insight_tag_id,
  ]);


  const [activePhoto, setActivePhoto] = useState<any | null>(null);

  const [open, setOpen] = useState(false);

  const {
    profile,
    cover,
    layout,
    theme,
    contact,
    banner,
    meeting,
    social_links,
    youtube,
    links_files,
    products,
    sections,
    photo_gallery,
    // video_gallery,
  } = config;



  const orderedSections = sortByRank(sections.items);
  const shapeClass = resolveShape(layout?.button_style);

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
            onConnect={() => isMobile && setOpen(true)}

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
      // case "video_gallery":
      //   return video_gallery?.items?.length ? (
      //     <VideoGallery
      //       title={video_gallery.section_title}
      //       items={sortByRank(video_gallery.items)}
      //       theme={theme}
      //     />
      //   ) : null;

      case "youtube":
        return (
          <YouTube
            title={youtube.section_title}
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
            onConnect={() => isMobile && setOpen(true)}

          />
        );

      case "links_files":
        return (
          <Links
            title={links_files.section_title}
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
        layout?.color1 || layout?.background_color || "#000",
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
  const isAnyModalOpen = open || !!activePhoto;
  useEffect(() => {
    if (!isAnyModalOpen) {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      return;
    }

    // lock body (iOS-safe)
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
      className={`relative min-h-screen w-full no-scrollbar overflow-hidden p-4 ${bgClass} ${fontClass}`}
      style={{
        ...(bgClass
          ? { ["--pattern-bg" as any]: layout?.background_color || layout?.color1 || "#2f343a" }
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
    <div className="px-2">
      <a
        href={meeting.meeting_url}
        className={`block text-center py-3 text-sm font-semibold shadow-md ${shapeClass}`}
        style={{ backgroundColor: t.buttonBg, color: t.buttonText }}
      >

        {meeting.button_text || "BOOK A MEETING NOW!"}
      </a>
    </div>
  );
}

/* ================= PRODUCTS ================= */
export function Products({
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
                style={{ color: theme.image_text_color }}
              >
                {p.name}
              </h3>

              {showPrice && (
                <p
                  className="text-xs mt-1 font-medium"
                  style={{ color: theme.image_text_color }}
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
import { useRef } from "react";
// import { link } from "fs";
function YouTube({ title, items, theme }: any) {
  if (!items?.length) return null;

  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const videos = items
    .map((v: any) => ({
      ...v,
      ytId: getYouTubeId(v.url),
    }))
    .filter((v: any) => v.ytId);

  if (!videos.length) return null;

  const handleScroll = () => {
    if (!containerRef.current) return;

    const { scrollLeft, offsetWidth } = containerRef.current;
    const currentIndex = Math.round(scrollLeft / offsetWidth);
    setIndex(currentIndex);
  };

  const scrollTo = (i: number) => {
    if (!containerRef.current) return;

    containerRef.current.scrollTo({
      left: i * containerRef.current.offsetWidth,
      behavior: "smooth",
    });
  };

  return (
    <Section title={title} theme={theme}>
      {/* Carousel */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="
          flex overflow-x-auto scroll-smooth
          snap-x snap-mandatory
          scrollbar-hide
        "
      >
        {videos.map((v: any, i: number) => (
          <div
            key={v.id ?? i}
            className="
              min-w-full h-48
              snap-center
              px-1
            "
          >
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-md">
              <iframe
                src={`https://www.youtube.com/embed/${v.ytId}`}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-3">
        {videos.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            className={`h-2 w-2 rounded-full transition ${i === index
              ? "bg-gray-900"
              : "bg-gray-300 hover:bg-gray-400"
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

function Links({ title, items, theme }: any) {
  if (!items?.length) return null;

  const t = resolveTheme(theme)

  return (
    <Section title={title} theme={theme}>
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

export function useIsMobile(breakpoint = 768) {
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
                      style={{ color: t.imageText }}
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


// function VideoGallery({ title, items, theme }: any) {
//   const t = resolveTheme(theme);
//   const isYouTube = (url?: string) =>
//     !!url && /youtube\.com|youtu\.be/.test(url);

//   const isDirectVideo = (url?: string) =>
//     !!url && /\.(mp4|webm|ogg)$/i.test(url);

//   return (
//     <Section title={title || "Video Gallery"} theme={theme}>
//       <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
//         {items.map((v: any, i: number) => {
//           const id = getYouTubeId(v.video_url);
//           if (!id) return null;

//           return (
//             <div
//               key={i}
//               className="min-w-[220px] h-48 snap-start rounded-2xl overflow-hidden shadow-lg flex flex-col"
//               style={{ backgroundColor: t.cardBg }}
//             >
//               {/* VIDEO */}
//               <div className="w-full h-[140px] bg-black">
//                 {isYouTube(v.video_url) ? (
//                   <iframe
//                     src={`https://www.youtube.com/embed/${getYouTubeId(v.video_url)}`}
//                     className="w-full h-full"
//                     frameBorder="0"
//                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//                     allowFullScreen
//                   />
//                 ) : isDirectVideo(v.video_url) ? (
//                   <video
//                     src={v.video_url}
//                     controls
//                     className="w-full h-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-white text-sm">
//                     Video preview not available
//                   </div>
//                 )}
//               </div>

//               {/* INFO */}
//               <div className="px-3 py-1 space-y-1">
//                 <h4
//                   className="text-sm font-semibold line-clamp-1"
//                   style={{ color: t.text }}
//                 >
//                   {v.title}
//                 </h4>

//                 {v.description && (
//                   <p
//                     className="text-xs opacity-80 line-clamp-2"
//                     style={{ color: t.text }}
//                   >
//                     {v.description}
//                   </p>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </Section>
//   );
// }


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
