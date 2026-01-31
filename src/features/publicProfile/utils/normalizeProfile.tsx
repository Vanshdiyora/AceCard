export type LockMode = "global" | "individual" | "locked";

export function normalizeProfile(api: any) {
  const cfg = api.configuration ?? {};

  return {
    /* ================= PROFILE ================= */
    profile: {
      avatar_url: api.avatar_url ?? "",
      cover_url: api.cover_url ?? "",
      description: api.description ?? "",
    },

    layout: {
      // LOCK
      locked: Boolean(cfg.layout?.locked),
      lock_mode: cfg.layout?.lock_mode ?? undefined,

      // CORE
      profile_type: cfg.layout?.profile_type ?? 3,
      is_fade: cfg.layout?.is_fade ?? true,
      font: cfg.layout?.font || "Inter",
      card_alignment: cfg.layout?.card_alignment || "center",

      // BACKGROUND TYPE
      use_background:
        cfg.layout?.use_background === "solid" ||
          cfg.layout?.use_background === "gradient" ||
          cfg.layout?.use_background === "image"
          ? cfg.layout.use_background
          : "gradient",

      // GRADIENT SAFE
      color1: cfg.layout?.color1 || "#7c3aed",
      color2: cfg.layout?.color2 || "#6366f1",
      direction:
        cfg.layout?.direction === "to-r" ||
          cfg.layout?.direction === "to-l" ||
          cfg.layout?.direction === "to-b" ||
          cfg.layout?.direction === "to-t"
          ? cfg.layout.direction
          : "to-r",

      // MEDIA
      background_image: cfg.layout?.background_image || "",
      custom_font: cfg.layout?.custom_font || "",

      use_custom_font: Boolean(cfg.layout?.use_custom_font),
    },



    cover: {
      locked: cfg.cover?.locked ?? false,
      lock_mode: cfg.cover?.lock_mode,
      cover_url: cfg.cover?.cover_url ?? "",
    },

    /* ================= THEME ================= */
    theme: {
      locked: cfg.theme?.locked ?? false,
      lock_mode: cfg.theme?.lock_mode ?? undefined,

      primary_color: cfg.theme?.primary_color ?? "#F97316",
      background_color: cfg.theme?.background_color ?? "#F3F4F6",
      card_color: cfg.theme?.card_color ?? "#FFFFFF",
      text_color: cfg.theme?.text_color ?? "#111827",
      accent_color: cfg.theme?.accent_color ?? "#000000",
    },

    /* ================= BANNER ================= */
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

    /* ================= PRODUCTS ================= */
    products: {
      locked: cfg.products?.locked ?? false,
      lock_mode: cfg.products?.lock_mode ?? undefined,

      items: Array.isArray(cfg.products?.items)
        ? cfg.products.items.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.image_url || p.product_img_url,
          rank: p.rank,
          enabled: p.enabled,
        }))
        : [],
    },

    /* ================= YOUTUBE ================= */
    youtube: normalizeYoutube(api),

    /* ================= LINKS & FILES ================= */
    links_files: normalizeLinksFiles(api),

    /* ================= SECTIONS (GROUP LOCK) ================= */
    sections: {
      locked: cfg.sections?.locked ?? false,
      lock_mode: cfg.sections?.lock_mode ?? undefined,

      items: Array.isArray(cfg.sections?.items)
        ? cfg.sections.items.map((s: any, i: number) => ({
          id: s.id,
          type: s.type,
          rank: s.rank ?? i + 1,
          enabled: s.enabled ?? true,
        }))
        : [],
    },
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

    items: Array.isArray(y.items)
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

    items: Array.isArray(lf.items)
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


export function denormalizeProfile(
  cfg: ReturnType<typeof normalizeProfile>,
  baseApi: any
) {
  return {
    ...baseApi, // keep username, ids, meta, etc

    avatar_url: cfg.profile.avatar_url,
    cover_url: cfg.profile.cover_url,
    description: cfg.profile.description,

    configuration: {
      ...baseApi.configuration,
      profile: {
        ...baseApi.configuration?.profile,
        ...cfg.profile, // 🔥 live value always wins
      },

      layout: {
        locked: cfg.layout.locked,
        lock_mode: cfg.layout.lock_mode,
        profile_type: cfg.layout.profile_type,
        is_fade: cfg.layout.is_fade,
        font: cfg.layout.font,
        card_alignment: cfg.layout.card_alignment,
        use_background: cfg.layout.use_background,
        color1: cfg.layout.color1,
        color2: cfg.layout.color2,
        direction: cfg.layout.direction,
        background_image: cfg.layout.background_image,
        custom_font: cfg.layout.custom_font,
        use_custom_font: cfg.layout.use_custom_font,
      },

      cover: {
        locked: cfg.cover.locked,
        lock_mode: cfg.cover.lock_mode,
        cover_url: cfg.cover.cover_url,
      },

      theme: {
        locked: cfg.theme.locked,
        lock_mode: cfg.theme.lock_mode,
        primary_color: cfg.theme.primary_color,
        background_color: cfg.theme.background_color,
        card_color: cfg.theme.card_color,
        text_color: cfg.theme.text_color,
        accent_color: cfg.theme.accent_color,
      },

      banner: {
        locked: cfg.banner.locked,
        lock_mode: cfg.banner.lock_mode,
        enabled: cfg.banner.enabled,
        image_url: cfg.banner.image_url,
        cta_text: cfg.banner.cta_text,
        cta_url: cfg.banner.cta_url,
      },

      meeting: {
        locked: cfg.meeting.locked,
        lock_mode: cfg.meeting.lock_mode,
        enabled: cfg.meeting.enabled,
        type: cfg.meeting.type,
        meeting_url: cfg.meeting.meeting_url,
        button_text: cfg.meeting.button_text,
      },

      social_links: {
        items: cfg.social_links.items,
      },

      products: {
        locked: cfg.products.locked,
        lock_mode: cfg.products.lock_mode,
        items: cfg.products.items.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.image_url,
          rank: p.rank,
          enabled: p.enabled,
        })),
      },

      youtube: {
        locked: cfg.youtube.locked,
        lock_mode: cfg.youtube.lock_mode,
        items: cfg.youtube.items.map((v: any) => ({
          id: v.id,
          url: v.url,
          rank: v.rank,
          enabled: v.enabled,
        })),
      },

      links_files: {
        locked: cfg.links_files.locked,
        lock_mode: cfg.links_files.lock_mode,
        items: cfg.links_files.items.map((l: any) => ({
          id: l.id,
          type: l.type,
          title: l.title,
          url: l.url,
          file_url: l.file_url,
          file_type: l.file_type,
          rank: l.rank,
          enabled: l.enabled,
        })),
      },

      sections: {
        locked: cfg.sections.locked,
        lock_mode: cfg.sections.lock_mode,
        items: cfg.sections.items.map((s: any) => ({
          id: s.id,
          type: s.type,
          rank: s.rank,
          enabled: s.enabled,
        })),
      },
    },
  };
}
