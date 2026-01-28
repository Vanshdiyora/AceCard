import type { TeamMember } from "../types";
import {
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Facebook,
} from "lucide-react";

/* ================= HELPERS ================= */

const getYouTubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
  );
  return match?.[1];
};

/* ================= CAROUSEL CARDS ================= */

const CARDS = [
  {
    id: "1",
    name: "AceCard Premium",
    category: "Digital Card",
    price: "₹1,999",
    image: "https://images.unsplash.com/photo-1586880244406-556ebe35f282",
  },
  {
    id: "2",
    name: "Personal Branding Kit",
    category: "Branding",
    price: "₹4,999",
    image: "https://images.unsplash.com/photo-1558655146-d09347e92766",
  },
  {
    id: "3",
    name: "Lead Automation Setup",
    category: "Growth",
    price: "₹9,999",
    image: "https://images.unsplash.com/photo-1556155092-8707de31f9c4",
  },
];

const LINKS = [
  {
    id: 1,
    title: "Manage your end-to-end LinkedIn",
    type: "link",
    url: "https://linkedin.com",
  },
  {
    id: 2,
    title: "AceCards Report",
    type: "file",
    url: "/files/acecards-report.pdf",
  },
];

/* ================= COMPONENT ================= */

interface Props {
  member: TeamMember;
}

export default function MemberMobileWebsite({ member }: Props) {
  return (
    <div className="relative min-h-full bg-gray-100">
      {/* ================= COVER ================= */}
      <div className="absolute top-0 left-0 w-full h-52 z-0">
        <img
          loading="lazy"
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute top-4 left-4 text-xs text-white font-medium">
          AceCard
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 pt-36">
        {/* ================= PROFILE ================= */}
        <div className="px-4">
          <div className="bg-white rounded-2xl shadow-md p-4">
            <div className="flex gap-4 items-center">
              <img
                loading="lazy"
                src={`https://ui-avatars.com/api/?name=${member.name}&background=111827&color=fff`}
                className="w-24 h-24 rounded-xl -mt-14 border-4 border-white"
              />
              <div className="flex-1 mt-2">
                <p className="text-lg font-semibold">{member.name}</p>
                <p className="text-sm text-gray-600 capitalize">
                  {member.role.replace("_", " ")} @ AceCard
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button className="h-11 rounded-xl border text-sm">
                Save Contact
              </button>
              <button className="h-11 rounded-xl bg-orange-500 text-white text-sm">
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* ================= ABOUT ================= */}
        <div className="px-4 mt-6">
          <h3 className="text-sm font-semibold mb-2">About</h3>
          <p className="text-sm text-gray-600">
            I&apos;m {member.name}, helping professionals grow using digital
            identity, automation, and branding solutions.
          </p>
        </div>

        {/* ================= SOCIAL ================= */}
        <div className="px-4 mt-6">
          <SocialLinks />
        </div>

        {/* ================= CAROUSEL ================= */}
        <div className="px-4 mt-6">
          <h3 className="text-sm font-semibold mb-3">Products</h3>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth touch-pan-x will-change-transform">
            {CARDS.map((item) => (
              <div
                key={item.id}
                className="min-w-[220px] h-52 rounded-2xl relative overflow-hidden shadow-md snap-start"
              >
                <img
                  loading="lazy"
                  src={item.image}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="text-xs opacity-90">{item.category}</p>
                  <p className="text-[10px] opacity-80 font-medium">
                    {item.price}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= LINKS & FILES ================= */}
        <div className="px-4 mt-6">
          <h3 className="text-sm font-semibold mb-3">Links & Files</h3>
          <div className="bg-white rounded-2xl shadow-sm divide-y overflow-hidden">
            {LINKS.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-sm">
                    {item.type === "file" ? "📄" : "🔗"}
                  </div>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {item.title}
                  </p>
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </a>
            ))}
          </div>
        </div>

        {/* ================= YOUTUBE ================= */}
        <div className="px-4 mt-6">
          <YouTubeCard url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
          <div className="mt-4 flex justify-center">
            <button className="h-10 px-6 rounded-lg bg-orange-500 text-white text-sm font-semibold shadow hover:bg-orange-600 transition">
              BOOK A MEETING
            </button>
          </div>
        </div>

        {/* ================= BANNER ================= */}
        <div className="px-4 mt-6">
          <div className="relative rounded-2xl overflow-hidden shadow-sm">
            <img
              loading="lazy"
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
              className="w-full h-28 object-cover"
            />
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  );
}

/* ================= YOUTUBE ================= */

function YouTubeCard({ url }: { url: string }) {
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="relative block rounded-2xl overflow-hidden bg-black shadow-sm"
    >
      <img
        loading="lazy"
        src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
        className="w-full h-40 object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-14 w-14 bg-red-600 rounded-full flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-white ml-1"
            fill="currentColor"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </a>
  );
}

/* ================= SOCIAL ================= */

function SocialLinks() {
  return (
    <div className="flex justify-center gap-3">
      <SocialIcon icon={<Instagram className="text-orange-400" />} />
      <SocialIcon icon={<Linkedin className="text-orange-400" />} />
      <SocialIcon icon={<Youtube className="text-orange-400" />} />
      <SocialIcon icon={<Twitter className="text-orange-400" />} />
      <SocialIcon icon={<Facebook className="text-orange-400" />} />
    </div>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center">
      {icon}
    </div>
  );
}
