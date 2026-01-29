export function normalizeProfile(api: any) {
  const cfg = api.configuration ?? {};

  return {
    profile: {
      avatar_url: cfg.profile?.avatar_url ?? "",
      cover_url: cfg.profile?.cover_url ?? "",
      description: cfg.profile?.description ?? "",
    },

    theme: {
      primary_color: cfg.theme?.primary_color ?? "#F97316",
      background_color: cfg.theme?.background_color ?? "#F3F4F6",
      card_color: cfg.theme?.card_color ?? "#FFFFFF",
      text_color: cfg.theme?.text_color ?? "#111827",
      accent_color: cfg.theme?.accent_color ?? "#000000",
    },

    banner: {
      enabled: cfg.banner?.enabled ?? false,
      image_url: cfg.banner?.image_url ?? "",
      cta_text: cfg.banner?.cta_text ?? "",
      cta_url: cfg.banner?.cta_url ?? "",
    },

    meeting: normalizeMeeting(api),

    social_links: {
      items: cfg.social_links?.items ?? [],
    },

    products: {
      locked: api.configuration?.products?.locked ?? false,
      items:
        api.configuration?.products?.items?.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.image_url,
          rank: p.rank,
          enabled: p.enabled,
        })) ?? [],
    },


   youtube: normalizeYoutube(api),

    links_files: normalizeLinksFiles(api),

    sections:
      api.configuration?.sections?.map((s: any, i: number) => ({
        id: s.id,
        type: s.type,
        rank: s.rank ?? i + 1,
        locked: !!s.locked,
        enabled: s.enabled ?? true,
      })) ?? [],

  };
}

const normalizeMeeting = (api: any) => ({
  locked: api.configuration?.meeting?.locked ?? false,
  enabled: api.configuration?.meeting?.enabled ?? false,
  type: api.configuration?.meeting?.type ?? "",
  meeting_url: api.configuration?.meeting?.meeting_url ?? "",
  button_text: api.configuration?.meeting?.button_text ?? "",
});

const normalizeYoutube = (api: any) => ({
  locked: api.configuration?.youtube?.locked ?? false,
  items:
    api.configuration?.youtube?.items?.map((y: any, i: number) => ({
      id: y.id ?? crypto.randomUUID(),
      url: y.url ?? "",
      rank: y.rank ?? i + 1,
      enabled: y.enabled ?? true,
    })) ?? [],
});

const normalizeLinksFiles = (api: any) => ({
  locked: api.configuration?.links_files?.locked ?? false,
  items:
    api.configuration?.links_files?.items?.map((l: any, i: number) => ({
      id: l.id || crypto.randomUUID(),
      type: l.type || "link",
      title: l.title || "",
      url: l.url || "",
      file_url: l.file_url || "",
      file_type: l.file_type || "",
      rank: l.rank ?? i + 1,
      enabled: l.enabled ?? true,
    })) || [],
});
