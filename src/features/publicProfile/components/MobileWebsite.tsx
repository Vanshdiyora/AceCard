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

import { normalizeProfile } from "../utils/normalizeProfile";
import { FiPhone, FiGlobe } from "react-icons/fi";

import { ProfileWrapper } from "./WebsiteLayout/ProfileWrapper";
import { type ReactNode, useState, useEffect, useRef } from "react";
import { ConnectModal } from "./ConnectModal";
import { ProfileActions } from "./WebsiteLayout/ProfileActions";
/* ================= HELPERS ================= */

type ThemeLike = {
  card_background?: string;
  button_color?: string;
  card_text?: string;
  button_text?: string;
  image_text_color?: string;
};

type RankedItem = {
  enabled?: boolean;
  rank?: number;
};

type SectionLike = RankedItem & {
  id?: string | number;
  type?: string;
};

type SocialLike = RankedItem & {
  id?: string;
  platform?: string;
  url?: string;
};

type ProductLike = RankedItem & {
  id?: string | number;
  name?: string;
  price?: string | number;
  image_url?: string;
  product_img_url?: string;
};

type LinkLike = RankedItem & {
  id?: string | number;
  type?: string;
  title?: string;
  url?: string;
  file_url?: string;
  avatar_url?: string;
};

type VideoLike = RankedItem & {
  id?: string | number;
  url?: string;
};

type PhotoLike = {
  img_url?: string;
  title?: string;
  description?: string;
  link?: string;
  rank?: number;
  enabled?: boolean;
};

type MobileData = {
  meta_pixel_id?: string;
  google_analytics_id?: string;
  linkedin_insight_tag_id?: string;
  name?: string;
  vendor_name?: string;
  job_title?: string;
  role?: string;
  phone?: string;
  email?: string;
  username?: string;
};

function injectScript(id: string, src?: string, inner?: string) {
  if (document.getElementById(id)) return;

  const s = document.createElement("script");
  s.id = id;
  s.async = true;

  if (src) s.src = src;
  if (inner) s.innerHTML = inner;

  document.head.appendChild(s);
}

const resolveTheme = (theme: ThemeLike = {}) => ({
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

const sortByRank = <T extends RankedItem>(arr: T[] = []): T[] => {
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
  isPreview = false,
}: {
  data: MobileData;
  isPreview?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const normalized = normalizeProfile(data);
  const config = normalized;
  const bgPositionClass = isPreview ? "absolute" : "fixed";

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


  const [activePhoto, setActivePhoto] = useState<PhotoLike | null>(null);

  const [open, setOpen] = useState(false);

  const {
    profile,
    cover,
    layout,
    theme,
    contact,
    banner,
    // meeting,
    social_links,
    youtube,
    links_files,
    products,
    sections,
    photo_gallery,
    card_buttons,
    // video_gallery,
  } = config;



  const orderedSections = sortByRank(sections.items as SectionLike[]);
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
          <Section title="" theme={theme}>
            <p
              className="text-sm leading-relaxed"
              style={{
                color: theme.card_text,
                textAlign: layout?.card_alignment || "left"
              }}
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
            onConnect={() => setOpen(true)}

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

      // case "meeting":
      //   return meeting?.enabled ? (
      //     <MeetingCTA meeting={meeting} theme={theme} shapeClass={shapeClass} />
      //   ) : null;

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
            items={sortByRank(photo_gallery.items as PhotoLike[]) as PhotoLike[]}
            theme={theme}
            onOpen={setActivePhoto}   // 👈 add
          />
        ) : null;
      case "card_buttons":
        return (
          <CardButtons
            items={sortByRank(card_buttons.items as Array<{ id?: string | number; title?: string; link?: string; enabled?: boolean }>)}
            theme={theme}
            shapeClass={shapeClass}
          />
        );
      default:
        return null;
    }
  };

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
        layout?.background_color || "#000",
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
    <div className={`relative w-full ${isPreview ? "h-full" : "min-h-screen"} overflow-x-hidden`}>

      {/* BACKGROUND — absolute in preview, fixed on real mobile */}
      <div
        className={`${bgPositionClass} inset-0 z-0 pointer-events-none`}
        style={
          !["stripes", "waves", "polka", "zigzag", "video"].includes(layout?.use_background || "")
            ? resolveBackgroundStyle()
            : {}
        }
      >
        {layout?.use_background === "zigzag" && (
          <ZigzagBackground color={layout?.background_color || "#65696F"} />
        )}
        {layout?.use_background === "waves" && (
          <WaveBackground color={layout?.background_color || "#40474D"} />
        )}
        {layout?.use_background === "stripes" && (
          <StripeBackground color={layout?.background_color || "#65696F"} />
        )}
        {layout?.use_background === "polka" && (
          <PolkaBackground color={layout?.background_color || "#3d444b"} />
        )}
        {layout?.use_background === "video" && (
          <BackgroundVideo src={layout?.background_video} isPreview={isPreview} />
        )}
      </div>

      <div
        className={`relative h-full w-full no-scrollbar overflow-y-auto p-4 ${fontClass}`}>

        <ConnectModal
          open={open}
          onClose={() => setOpen(false)}
          handle={data?.username || ""}
          theme={theme}
          config={config.contact}
        />

        {/* MODAL */}
        {isMobile && (
          <PhotoModal
            open={!!activePhoto}
            item={activePhoto}
            theme={theme}
            onClose={() => setActivePhoto(null)}
          />
        )}



        <span className="wave-3 absolute inset-0" />
        <span className="wave-fade" />
        <div className="relative z-10 space-y-6">

          {orderedSections.map((s) =>
            s?.enabled ? (
              <div key={s.id}>{renderSection(s.type || "")}</div>
            ) : null
          )}
        </div>

      </div>
    </div>
  );
}

/* ================= UI BLOCKS ================= */

function Section({ title, children, theme }: { title?: string; children?: ReactNode; theme?: ThemeLike }) {
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

// function MeetingCTA({ meeting, theme, shapeClass }: any) {
//   const t = resolveTheme(theme);

//   return (
//     <div className="">
//       <a
//         href={meeting.meeting_url}
//         className={`w-full block text-center py-3 text-sm font-semibold shadow-md ${shapeClass}`}
//         style={{ backgroundColor: t.buttonBg, color: t.buttonText }}
//       >

//         {meeting.button_text || "BOOK A MEETING NOW!"}
//       </a>
//     </div>
//   );
// }

/* ================= PRODUCTS ================= */
export function Products({
  title,
  items,
  theme,
  showPrice,
}: {
  title?: string;
  items: ProductLike[];
  theme: ThemeLike;
  showPrice: boolean;
}) {
  if (!items?.length) return null;

  return (
    <Section title={title || "Products"} theme={theme}>
      <div className="w-full overflow-x-auto pb-3 snap-x snap-mandatory">
        <div className="flex gap-4 w-[240px]">
          {items.map((p) => (
            <div
              key={p.id}
              className="relative min-w-[220px] h-44 rounded-2xl overflow-hidden snap-start shadow-lg transition hover:scale-[1.02] flex-shrink-0"
              style={{ backgroundColor: theme.card_background }}
            >
              <img
                src={p.image_url || p.product_img_url}
                alt={p.name}
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

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
      </div>
    </Section>

  );
}

/* ================= YOUTUBE ================= */
import { StripeBackground } from "./patterns/StripeBackground";
import { WaveBackground } from "./patterns/WaveBackground";
// import { link } from "fs";
import { PolkaBackground } from "./patterns/PolkaBackground";
import { ZigzagBackground } from "./patterns/ZigzagBackground";

function YouTube({ title, items, theme }: { title?: string; items: VideoLike[]; theme: ThemeLike }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (!items?.length) return null;

  const videos = items.map((v) => ({
    ...v,
    ytId: getYouTubeId(v.url),
    isYoutube: !!getYouTubeId(v.url),
  }));

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

  const maxDots = 5;

  let start = Math.max(0, index - Math.floor(maxDots / 2));
  let end = start + maxDots;

  if (end > videos.length) {
    end = videos.length;
    start = Math.max(0, end - maxDots);
  }

  const visibleDots = videos.slice(start, end);

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
        {videos.map((v, i: number) => (
          <div
            key={v.id ?? i}
            className="
              min-w-full h-48
              snap-center
              px-1
            "
          >
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-md">
              {v.isYoutube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${v.ytId}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={v.url}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2 mt-3">

        {start > 0 && (
          <span className="text-gray-400 text-xs">‹</span>
        )}

        {visibleDots.map((_, i) => {
          const actualIndex = start + i;

          return (
            <button
              key={actualIndex}
              onClick={() => scrollTo(actualIndex)}
              className={`h-2 w-2 rounded-full transition ${actualIndex === index
                  ? "bg-gray-900 scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
                }`}
            />
          );
        })}

        {end < videos.length && (
          <span className="text-gray-400 text-xs">›</span>
        )}

      </div>
    </Section>
  );
}

export function getSocialHref(platform: string, url: string): string {
  const val = url?.trim();
  if (!val) return "#";

  switch (platform) {
    case "whatsapp":
      // strip everything except digits
      return `https://wa.me/${val.replace(/\D/g, "")}`;
    case "phone":
      return `tel:${val.replace(/[\s\-()]/g, "")}`;
    case "sms":
      return `sms:${val.replace(/[\s\-()]/g, "")}`;
    case "email":
      return `mailto:${val}`;
    default:
      return val;
  }
}

/* ================= SOCIAL ================= */
function Social({ items, theme, shapeClass }: { items: SocialLike[]; theme: ThemeLike; shapeClass?: string }) {
  if (!items?.length) return null;

  const t = resolveTheme(theme);

  const rows: SocialLike[][] = [];
  for (let i = 0; i < items.length; i += 3) {
    rows.push(items.slice(i, i + 3));
  }

  return (
    <div className="flex flex-col items-center gap-4 px-6">
      {rows.map((row, rIdx) => (
        <div
          key={rIdx}
          className={`flex gap-4 ${row.length < 3 ? "justify-center" : "justify-between"
            } w-full`}
        >
          {row.map((s) => (
            <a
              key={s.id}
              href={getSocialHref(s.platform || s.id || "", s.url || "")}
              target="_blank"
              rel="noopener noreferrer"
              className={`h-20 w-20 p-2 flex items-center justify-center shadow-md transition hover:scale-105 overflow-hidden ${shapeClass}`}
              style={{
                backgroundColor: t.buttonBg,
                color: t.buttonText,
              }}
            >
              {s.id === "instagram" && <SiInstagram size={44} />}
              {s.id === "linkedin" && <SiLinkedin size={44} />}
              {s.id === "youtube" && <SiYoutube size={44} />}
              {s.id === "twitter" && <SiX size={44} />}
              {s.id === "facebook" && <SiFacebook size={44} />}
              {s.id === "whatsapp" && <SiWhatsapp size={44} />}
              {s.id === "phone" && <FiPhone size={44} />}
              {s.id === "website" && <FiGlobe size={44} />}
              {s.id === "snapchat" && <SiSnapchat size={44} />}
              {s.id === "tiktok" && <SiTiktok size={44} />}
              {s.id === "address" && <FiMapPin size={44} />}
              {s.id === "email" && <FiMail size={44} />}
              {s.id === "telegram" && <SiTelegram size={44} />}
              {s.id === "pinterest" && <SiPinterest size={44} />}
              {s.id === "threads" && <SiThreads size={44} />}
              {s.id === "github" && <SiGithub size={44} />}
              {s.id === "discord" && <SiDiscord size={44} />}
              {s.id === "calendly" && <SiCalendly size={44} />}
              {s.id === "appstore" && <SiAppstore size={44} />}
              {s.id === "playstore" && <SiGoogleplay size={44} />}
              {s.id === "sms" && <FiMessageSquare size={44} />}
            </a>
          ))}
        </div>
      ))}
    </div>
  );
}

/* ================= LINKS ================= */

function Links({ title, items, theme }: { title?: string; items: LinkLike[]; theme: ThemeLike }) {
  if (!items?.length) return null;
  const t = resolveTheme(theme);

  return (
    <Section title={title} theme={theme}>
      <div className="flex flex-col gap-4">
        {items.map((l) => {
          const href = l.type === "file" ? l.file_url : l.url;

          return (
            <a
              key={l.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl p-2 transition hover:scale-[1.01]"
              style={{ backgroundColor: "transparent" }}
            >
              {/* ICON / AVATAR */}
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center shadow overflow-hidden"
                style={{
                  backgroundColor: t.buttonBg,
                  color: t.buttonText,
                }}
              >
                {l.avatar_url ? (
                  <img
                    src={l.avatar_url}
                    alt={l.title}
                    className="w-full h-full object-cover"
                  />
                ) : l.type === "file" ? (
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
          );
        })}
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
  theme?: ThemeLike;
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
export function saveContact(user?: MobileData) {
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
function PhotoGallery({ title, items, theme, onOpen }: { title?: string; items: PhotoLike[]; theme: ThemeLike; onOpen?: (item: PhotoLike) => void }) {

  const t = resolveTheme(theme);

  if (!items?.length) return null;

  return (
    <>
      <Section title={title || "Photo Gallery"} theme={theme}>
        <div className="w-full overflow-x-auto overflow-y-hidden pb-3">
          <div className="flex gap-4 w-[240px]">
            {items.map((p, i: number) => (
              <button
                key={i}
                className="group text-left flex-shrink-0"
                onClick={() => onOpen?.(p)}
              >
                <div className="relative w-[200px] h-44 rounded-2xl overflow-hidden shadow-md">
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
  item: PhotoLike | null;
  theme: ThemeLike;
}) {
  const t = resolveTheme(theme);
  const isMobile = useIsMobile();

  if (!open || !item) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex px-4 ${isMobile ? "items-end" : "items-center justify-center"
        }`}
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-[390px] overflow-hidden
          ${isMobile ? "rounded-t-2xl" : "rounded-2xl"}
          animate-fadeIn`}
        style={{
          backgroundColor: t.cardBg,
          boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          maxHeight: isMobile ? "90vh" : "85vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE ICON */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 h-8 w-8 rounded-full
            flex items-center justify-center transition-opacity hover:opacity-80"
          style={{
            color: t.text,
            backgroundColor: t.cardBg,
            opacity: 0.85,
          }}
        >
          ✕
        </button>

        {/* IMAGE */}
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

        {/* CONTENT */}
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

// function VideoGallery({ title, items, theme }: any) {
//   const t = resolveTheme(theme);
//   const isYouTube = (url?: string) =>
//     !!url && /youtube\.com|youtu\.be/.test(url);

//   const isDirectVideo = (url?: string) =>
//     !!url && /\.(mp4|webm|ogg)$/i.test(url);

//   return (
//     <Section title={title || "Video Gallery"} theme={theme}>
//       <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
//         {items.map((v, i: number) => {
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

function CardButtons({
  items,
  theme,
  shapeClass,
}: {
  items: Array<{ id?: string | number; title?: string; link?: string; enabled?: boolean }>;
  theme: ThemeLike;
  shapeClass?: string;
}) {
  const t = resolveTheme(theme);

  const visible = items
    ?.filter((i) => i.enabled !== false)
    ?.slice(0, 2); // 🔥 MAX 2

  if (!visible?.length) return null; // 🔥 MIN 0

  const isSingle = visible.length === 1;

  return (
    <Section theme={theme}>
      <div
        className={`flex gap-3 ${isSingle ? "flex-col" : "flex-row"
          }`}
      >
        {visible.map((btn) => (
          <a
            key={btn.id}
            href={btn.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              ${isSingle ? "w-full" : "flex-1"}
              py-3
              text-sm
              font-semibold
              text-center
              shadow-md
              transition
              active:scale-95
              hover:opacity-90
              ${shapeClass}
            `}
            style={{
              backgroundColor: t.buttonBg,
              color: t.buttonText,
            }}
          >
            {btn.title}
          </a>
        ))}
      </div>
    </Section>
  );
}
