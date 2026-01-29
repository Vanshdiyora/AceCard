
export default function MobileWebsite({ data }: { data: any }) {
  const config = data?.configuration || {};

  const profile = config.profile || {};
  const theme = config.theme || {};
  const banner = config.banner || {};
  const meeting = config.meeting || {};
  const social = config.social_links || {};
  const youtube = config.youtube || {};
  const links = config.links_files || {};
  // const products = config.products || {};

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.background_color || "#F3F4F6" }}
    >
      {/* COVER */}
      <div className="h-52 relative">
        {profile.cover_url ? (
          <img
            src={profile.cover_url}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
      </div>

      {/* PROFILE CARD */}
      <div
        className="mx-4 -mt-16 rounded-2xl shadow p-4"
        style={{ backgroundColor: theme.card_color || "#FFFFFF" }}
      >
        <img
          src={
            profile.avatar_url ||
            `https://ui-avatars.com/api/?name=${profile.name || "User"}`
          }
          className="w-20 h-20 rounded-xl -mt-10 border-4 border-white"
        />

        <h2 className="mt-2 font-semibold text-gray-900">
          {profile.name || ""}
        </h2>

        <p className="text-sm text-gray-500">{profile.role || ""}</p>
        <p className="text-xs mt-2 text-gray-600">
          {profile.description || ""}
        </p>
      </div>

      {/* MEETING */}
      {meeting.enabled && meeting.meeting_url && (
        <div className="px-4 mt-6">
          <a
            href={meeting.meeting_url}
            className="block w-full text-center py-3 rounded-lg text-white"
            style={{ backgroundColor: theme.primary_color || "#F97316" }}
          >
            {meeting.button_text || "Book Meeting"}
          </a>
        </div>
      )}

      {/* SOCIAL */}
      {Array.isArray(social.items) && (
        <div className="px-4 mt-6 flex gap-3 justify-center">
          {social.items.map((s: any) => (
            <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
              {s.label}
            </a>
          ))}
        </div>
      )}

      {/* BANNER */}
      {banner.enabled && banner.image_url && (
        <div className="px-4 mt-6">
          <img
            src={banner.image_url}
            className="rounded-xl w-full"
          />
        </div>
      )}

      {/* YOUTUBE */}
      {Array.isArray(youtube.items) &&
        youtube.items.map((v: any) => (
          <div key={v.id} className="px-4 mt-6">
            <a href={v.url} target="_blank" rel="noreferrer">
              <img
                src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
                className="rounded-xl"
              />
            </a>
          </div>
        ))}

      {/* LINKS */}
      {Array.isArray(links.items) && (
        <div className="px-4 mt-6">
          {links.items.map((l: any) => (
            <a
              key={l.id}
              href={l.url}
              className="block py-2 text-sm text-blue-600"
            >
              {l.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
