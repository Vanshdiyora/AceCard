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
} from "lucide-react";

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

  const renderSection = (type: string) => {
    switch (type) {
      case "profile":
        return (
          <Profile
            profile={profile}
            theme={theme}
            user={data}
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

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden p-4"
      style={{ backgroundColor: theme.background_color || "#000" }}
    >
      <div className="space-y-6 pb-6">
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

const formatRole = (role?: string) => {
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
function Profile({ profile, theme, user, onConnect }: any) {
  return (
    <div>
      {/* COVER */}
      <div className="relative h-[220px] rounded-2xl overflow-hidden">
        <img
          src={profile.cover_url || ""}
          className="w-full h-full object-cover"
        />

        {/* OVERLAY (also rounded via parent overflow) */}
        <div className="absolute inset-0 bg-black/50" />

        <div
          className="absolute top-4 left-4 text-sm font-semibold"
          style={{ color: theme.accent_color }}
        >
          {user?.vendor_name}
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-black shadow-lg flex items-center justify-center">
            <img
              src={profile.avatar_url || ""}
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>

          <h2
            className="mt-2 font-semibold"
            style={{ color: theme.text_color }}
          >
            {user?.name}
          </h2>
          <p
            className="text-xs"
            style={{ color: theme.accent_color }}
          >
            {formatRole(user?.job_title || user?.role)}
          </p>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="grid grid-cols-2 gap-3 mt-4 px-4">
        <button
          type="button"
          onClick={() => saveContact(user)}
          className="h-11 rounded-xl border text-sm"
          style={{
            color: theme.text_color,
            borderColor: theme.accent_color,
          }}
        >
          Save Contact
        </button>

        <button
          type="button"
          onClick={onConnect}
          className="h-11 rounded-xl text-sm font-medium"
          style={{
            backgroundColor: theme.card_color,
            color: theme.primary_color,
          }}
        >
          Connect
        </button>
      </div>
    </div>
  );
}

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
      <div className="flex gap-4 overflow-x-auto">
        {items.map((p: any) => (
          <div
            key={p.id}
            className="min-w-[220px] h-52 rounded-2xl relative overflow-hidden shadow-md"
            style={{ backgroundColor: theme.card_color }}
          >
            <img
              src={p.image_url || ""}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute bottom-3 left-3 text-white">
              <p className="text-sm font-semibold">{p.name}</p>
              <p className="text-xs">₹{p.price}</p>
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
          className={`flex gap-4 ${
            row.length < 3 ? "justify-center" : "justify-between"
          } w-full max-w-[220px]`}
        >
          {row.map((s: any) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-md transition hover:scale-105"
              style={{
                backgroundColor: theme.card_color,
                color: theme.primary_color,
              }}
            >
              {s.label === "Instagram" && <Instagram size={22} />}
              {s.label === "LinkedIn" && <Linkedin size={22} />}
              {s.label === "YouTube" && <Youtube size={22} />}
              {s.label === "Twitter" && <Twitter size={22} />}
              {s.label === "Facebook" && <Facebook size={22} />}
              {s.label === "Whatsapp" && <MessageCircle size={22} />}
              {s.label === "Call Me" && <Phone size={22} />}
              {s.label === "Personal Website" && <Globe size={22} />}
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

function saveContact(user: any) {
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
