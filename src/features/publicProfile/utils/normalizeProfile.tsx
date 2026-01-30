export function normalizeProfile(api: any) {
  const cfg = api.configuration ?? {};

  return {
    /* ================= PROFILE ================= */
    profile: {
      avatar_url: api.avatar_url ?? "",
      cover_url: api.cover_url ?? "",
      description: api.description ?? "",
    },

    /* ================= THEME (GLOBAL LOCK SUPPORT) ================= */
    theme: {
      locked: cfg.theme?.locked ?? false,
      lock_mode: cfg.theme?.lock_mode ?? undefined,

      primary_color: cfg.theme?.primary_color ?? "#F97316",
      background_color: cfg.theme?.background_color ?? "#F3F4F6",
      card_color: cfg.theme?.card_color ?? "#FFFFFF",
      text_color: cfg.theme?.text_color ?? "#111827",
      accent_color: cfg.theme?.accent_color ?? "#000000",
    },

    /* ================= BANNER (INDIVIDUAL LOCK SUPPORT) ================= */
    banner: {
      locked: cfg.banner?.locked ?? false,
      lock_mode: cfg.banner?.lock_mode ?? undefined,

      enabled: cfg.banner?.enabled ?? false,
      image_url: cfg.banner?.image_url ?? "",
      cta_text: cfg.banner?.cta_text ?? "",
      cta_url: cfg.banner?.cta_url ?? "",
    },

    /* ================= MEETING ================= */
    meeting: normalizeMeeting(api),

    /* ================= SOCIAL ================= */
    social_links: {
      items: Array.isArray(cfg.social_links?.items)
        ? cfg.social_links.items
        : [],
    },


    /* ================= PRODUCTS (CRITICAL LOCK SUPPORT) ================= */
    products: {
      locked: cfg.products?.locked ?? false,
      lock_mode: cfg.products?.lock_mode ?? undefined,

      items:
        Array.isArray(cfg.products?.items)
          ? cfg.products.items.map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image_url: p.image_url,
            rank: p.rank,
            enabled: p.enabled,
          }))
          : [],

    },

    /* ================= YOUTUBE ================= */
    youtube: normalizeYoutube(api),

    /* ================= LINKS & FILES ================= */
    links_files: normalizeLinksFiles(api),

    /* ================= SECTIONS ================= */
    sections:
      cfg.sections?.map((s: any, i: number) => ({
        id: s.id,
        type: s.type,
        rank: s.rank ?? i + 1,

        locked: s.locked ?? false,
        lock_mode: s.lock_mode ?? undefined,

        enabled: s.enabled ?? true,
      })) ?? [],
  };
}

/* ================= SUB NORMALIZERS ================= */

const normalizeMeeting = (api: any) => {
  const m = api.configuration?.meeting ?? {};
  return {
    locked: m.locked ?? false,
    lock_mode: m.lock_mode ?? undefined,

    enabled: m.enabled ?? false,
    type: m.type ?? "",
    meeting_url: m.meeting_url ?? "",
    button_text: m.button_text ?? "",
  };
};

const normalizeYoutube = (api: any) => {
  const y = api.configuration?.youtube ?? {};
  return {
    locked: y.locked ?? false,
    lock_mode: y.lock_mode ?? undefined,

    items:
      Array.isArray(y.items)
        ? y.items.map((v: any, i: number) => ({
          id: v.id ?? crypto.randomUUID(),
          url: v.url ?? "",
          rank: v.rank ?? i + 1,
          enabled: v.enabled ?? true,
        }))
        : [],

  };
};

const normalizeLinksFiles = (api: any) => {
  const lf = api.configuration?.links_files ?? {};
  return {
    locked: lf.locked ?? false,
    lock_mode: lf.lock_mode ?? undefined,

    items:
      Array.isArray(lf.items)
        ? lf.items.map((l: any, i: number) => ({
          id: l.id || crypto.randomUUID(),
          type: l.type || "link",
          title: l.title || "",
          url: l.url || "",
          file_url: l.file_url || "",
          file_type: l.file_type || "",
          rank: l.rank ?? i + 1,
          enabled: l.enabled ?? true,
        }))
        : [],
  };
};
