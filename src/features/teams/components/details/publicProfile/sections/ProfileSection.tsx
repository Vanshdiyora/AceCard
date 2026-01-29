import { uploadImage } from "../../../../../publicProfile/services/publicProfile.api";

export default function ProfileSection({ profile, onChange }: any) {
  const upload = async (file: File, key: string) => {
    const res = await uploadImage(file);
    onChange({ ...profile, [key]: res.data.url });
  };

  return (
    <div className="space-y-8">

      {/* COVER */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <ImageBox
          url={profile.cover_url}
          wide
          onUpload={(f: any) => upload(f, "cover_url")}
        />
      </div>

      {/* AVATAR + BIO */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="space-y-2">
          <Label>Profile Photo</Label>
          <ImageBox
            url={profile.avatar_url}
            onUpload={(f: any) => upload(f, "avatar_url")}
          />
        </div>

        <div className="flex-1 space-y-2">
          <Label>Description</Label>
          <textarea
            placeholder="Write something about yourself..."
            className="w-full min-h-[120px] rounded-xl border border-gray-200 bg-white/70 backdrop-blur px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            value={profile.description || ""}
            onChange={(e) =>
              onChange({ ...profile, description: e.target.value })
            }
          />
        </div>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-wide text-gray-500">
      {children}
    </p>
  );
}


function ImageBox({ label, url, wide, onUpload }: any) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </p>

      <div
        className={`group relative rounded-2xl overflow-hidden border border-white/40 shadow-md bg-gradient-to-br from-gray-50 to-gray-100 ${
          wide ? "h-44 w-full" : "h-28 w-28"
        }`}
      >
        {url ? (
          <img
            src={url}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
            <div className="w-10 h-10 rounded-full bg-white/80 flex items-center justify-center shadow">
              📷
            </div>
            <span className="mt-2">Upload</span>
          </div>
        )}

        {/* Overlay */}
        <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition">
          <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur border border-white/30 text-sm">
            Change
          </span>
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={(e) =>
              e.target.files && onUpload(e.target.files[0])
            }
          />
        </label>
      </div>
    </div>
  );
}
