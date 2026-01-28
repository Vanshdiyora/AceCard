import type { TeamMember } from "../types";
import {
  Instagram,
  Linkedin,
  Youtube,
  Twitter,
  Facebook,
  GripVertical,
} from "lucide-react";

/* ================= HELPERS ================= */

const getYouTubeId = (url: string) => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/
  );
  return match?.[1];
};

/* ================= STATIC PRODUCTS (REORDERABLE) ================= */

const PRODUCTS = [
  {
    id: "1",
    name: "AceCard Premium",
    category: "Digital Card",
    price: "₹1,999",
    image:
      "https://images.unsplash.com/photo-1586880244406-556ebe35f282",
  },
  {
    id: "2",
    name: "Personal Branding Kit",
    category: "Branding",
    price: "₹4,999",
    image:
      "https://images.unsplash.com/photo-1558655146-d09347e92766",
  },
  {
    id: "3",
    name: "Lead Automation Setup",
    category: "Growth",
    price: "₹9,999",
    image:
      "https://images.unsplash.com/photo-1556155092-8707de31f9c4",
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
          <div className="bg-white rounded-2xl shadow-lg p-4">
            <div className="flex gap-4 items-center">
              <img
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

        {/* ================= PRODUCTS (REORDERABLE UI) ================= */}
        <div className="px-4 mt-8">
          <h3 className="text-sm font-semibold mb-4">Products</h3>

          <div className="space-y-3">
            {PRODUCTS.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* ================= YOUTUBE ================= */}
        <div className="px-4 mt-8">
          <YouTubeCard url="https://www.youtube.com/watch?v=dQw4w9WgXcQ" />
        </div>

        {/* ================= SOCIAL ================= */}
        <div className="px-4 mt-6 pb-10">
          <SocialLinks />
        </div>
      </div>
    </div>
  );
}

/* ================= PRODUCT ROW (DRAG READY) ================= */

function ProductRow({
  product,
}: {
  product: {
    name: string;
    category: string;
    price: string;
    image: string;
  };
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 flex items-center gap-3">
      {/* Drag Handle */}
      <div className="text-gray-400 cursor-grab active:cursor-grabbing">
        <GripVertical size={18} />
      </div>

      {/* Image */}
      <img
        src={product.image}
        className="w-14 h-14 rounded-lg object-cover"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {product.name}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            {product.category}
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="text-sm font-semibold whitespace-nowrap">
        {product.price}
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
