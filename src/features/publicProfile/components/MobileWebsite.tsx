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

/* ================= HELPERS ================= */



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

  const {
    profile = {},
    cover = {},
    layout = {},
    theme = {},
    banner = {},
    meeting = {},
    social_links = { items: [] },
    youtube = { items: [] },
    links_files = { items: [] },
    products = { items: [] },
    sections = { items: [] },
  } = config;


  const orderedSections = sortByRank(sections.items);

  useEffect(() => {
    if (!scrollRef?.current) return;
    const el = scrollRef.current;
    el.style.overflow = open ? "hidden" : "auto";
    el.style.touchAction = open ? "none" : "";
  }, [open, scrollRef]);

  const resolveFontClass = (font?: string) => {
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
        return "font-inter"; // fallback
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
            <p style={{ color: theme.text_color }}>
              {profile.description}
            </p>
          </Section>
        ) : null;

      case "social_links":
        return (
          <Social
            items={sortByRank(social_links.items)}
            theme={theme}
          />
        );

      case "products":
        return (
          <Products
            items={sortByRank(products.items)}
            theme={theme}
          />
        );

      case "youtube":
        return (
          <YouTube
            items={sortByRank(youtube.items)}
            theme={theme}
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
          <MeetingCTA meeting={meeting} theme={theme} />
        ) : null;

      case "banner":
        return banner?.enabled && banner?.image_url ? (
          <Banner image={banner.image_url} />
        ) : null;

      default:
        return null;
    }
  };

  const resolveBackgroundStyle = () => {
    if (layout?.use_background === "image" && layout?.background_image) {
      return {
        backgroundImage: `url(${layout.background_image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
    }

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

    return {
      backgroundColor: theme?.background_color || "#000",
    };
  };


  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden p-4 ${fontClass}`}
      style={resolveBackgroundStyle()}
    >

      <div className="space-y-6">
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
  return (
    <div className="">
      <h3
        className="text-sm font-semibold mb-2"
        style={{ color: theme.text_color }}
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

function MeetingCTA({ meeting, theme }: any) {
  return (
    <div className="px-12">
      <a
        href={meeting.meeting_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center py-4 rounded-xl text-sm font-semibold shadow-md"
        style={{
          backgroundColor: theme.primary_color,
          color: "#fff",
        }}
      >
        {meeting.button_text || "BOOK A MEETING NOW!"}
      </a>
    </div>
  );
}

/* ================= PRODUCTS ================= */

function Products({ items, theme }: any) {
  if (!items?.length) return null;

  return (
    <Section title="Products" theme={theme}>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {items.map((p: any) => (
          <div
            key={p.id}
            className="relative min-w-[220px] h-44 rounded-2xl overflow-hidden snap-start shadow-lg"
          >
            {/* Background image */}
            <img
              src={p.image_url || p.product_img_url}
              alt={p.name}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <p className="text-sm opacity-80">Featured</p>
              <h3 className="text-lg font-semibold leading-tight line-clamp-2">
                {p.name}
              </h3>
              <p className="text-xs mt-1">₹{p.price}</p>
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
      {items.map((v: any) => {
        const id = getYouTubeId(v.url);
        if (!id) return null;
        return (
          <a
            key={v.id}
            href={v.url}
            className="block rounded-2xl overflow-hidden"
          >
            <img
              src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`}
              className="w-full h-40 object-cover"
            />
          </a>
        );
      })}
    </Section>
  );
}

/* ================= SOCIAL ================= */

function Social({ items, theme }: any) {
  if (!items?.length) return null;

  // break into rows of 3
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
              className="h-20 w-20 rounded-3xl flex items-center justify-center shadow-md transition hover:scale-105 overflow-hidden"
              style={{
                backgroundColor: theme.card_color,
                color: theme.primary_color,
              }}
            >
              {s.label === "Instagram" && <Instagram size={32} />}
              {s.label === "LinkedIn" && <Linkedin size={32} />}
              {s.label === "YouTube" && <Youtube size={32} />}
              {s.label === "Twitter" && <Twitter size={32} />}
              {s.label === "Facebook" && <Facebook size={32} />}
              {s.label === "Whatsapp" && <MessageCircle size={32} />}
              {s.label === "Call Me" && <Phone size={32} />}
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
  return (
    <Section title="Links & Files" theme={theme}>
      <div className="flex flex-col gap-4">
        {items.map((l: any) => (
          <a
            key={l.id}
            href={l.url || l.file_url}
            className="flex items-center gap-3"
          >
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: theme.card_color,
                color: theme.primary_color,
              }}
            >
              {l.type === "file" ? (
                <FileText size={16} />
              ) : (
                <Link2 size={16} />
              )}
            </div>
            <p
              className="text-sm font-semibold"
              style={{ color: theme.text_color }}
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

function Banner({ image }: any) {
  return (
    <div className="">
      <img
        src={image}
        className="w-full h-28 rounded-2xl object-cover"
      />
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
