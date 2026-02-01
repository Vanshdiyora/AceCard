export type LockMode = "global" | "individual" | "locked";

export function normalizeProfile(api: any) {
  const cfg = api.configuration ?? {};

  return {
    /* ================= PROFILE ================= */
    profile: {
      avatar_url: cfg.profile.avatar_url,
      description: cfg.profile.description,
      custom_profile: cfg.profile.custom_profile,
      custom_profile_url: cfg.profile.custom_profile_url,
    },

    /* ================= COVER ================= */
    cover: {
      locked: Boolean(cfg.cover?.locked),
      lock_mode: cfg.cover?.lock_mode ?? undefined,
      cover_url: cfg.cover?.cover_url ?? "",
    },

    contact: {
      locked: Boolean(cfg.contact?.locked),
      lock_mode: cfg.contact?.lock_mode ?? undefined,

      connect_title: cfg.contact?.connect_title || "Connect",
      contact_title: cfg.contact?.contact_title || "Save Contact",
    },

    /* ================= LAYOUT ================= */
    layout: {
      locked: Boolean(cfg.layout?.locked),
      lock_mode: cfg.layout?.lock_mode ?? undefined,

      profile_type: cfg.layout?.profile_type ?? 3,
      is_fade: Boolean(cfg.layout?.is_fade),
      font: cfg.layout?.font || "Inter",
      card_alignment: cfg.layout?.card_alignment || "center",

      use_background:
        ["solid", "gradient", "image"].includes(cfg.layout?.use_background)
          ? cfg.layout.use_background
          : "gradient",

      color1: cfg.layout?.color1 || "#000000",
      color2: cfg.layout?.color2 || "#000000",
      direction: ["to-r", "to-l", "to-b", "to-t"].includes(cfg.layout?.direction)
        ? cfg.layout.direction
        : "to-r",

      background_image: cfg.layout?.background_image || "",
      custom_font: cfg.layout?.custom_font || "",
      use_custom_font: Boolean(cfg.layout?.use_custom_font),

      profile_width: cfg.layout?.profile_width ?? 0,
      pattern_color: cfg.layout?.pattern_color ?? "",
      button_style: cfg.layout?.button_style ?? 0,
    },

    /* ================= THEME (NEW) ================= */
    theme: {
      locked: Boolean(cfg.theme?.locked),
      lock_mode: cfg.theme?.lock_mode ?? undefined,

      card_background: cfg.theme?.card_background ?? "#BB3500",
      button_color: cfg.theme?.button_color ?? "#251F31",
      card_text: cfg.theme?.card_text ?? "#9F9F9F",
      button_text: cfg.theme?.button_text ?? "#B79A8A",
    },

    /* ================= BANNER ================= */
    banner: {
      locked: Boolean(cfg.banner?.locked),
      lock_mode: cfg.banner?.lock_mode ?? undefined,

      enabled: Boolean(cfg.banner?.enabled),
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
      locked: Boolean(cfg.products?.locked),
      lock_mode: cfg.products?.lock_mode ?? undefined,

      toggle_price: Boolean(cfg.products?.toggle_price),
      section_title: cfg.products?.section_title || "Products",

      items: Array.isArray(cfg.products?.items)
        ? cfg.products.items.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.product_img_url || p.image_url || "",
          rank: p.rank ?? 0,
          enabled: p.enabled ?? true,
        }))
        : [],
    },

    /* ================= YOUTUBE ================= */
    youtube: normalizeYoutube(api),

    /* ================= LINKS & FILES ================= */
    links_files: normalizeLinksFiles(api),

    /* ================= PHOTO GALLERY ================= */
    photo_gallery: normalizePhotoGallery(api),

    /* ================= VIDEO GALLERY ================= */
    video_gallery: normalizeVideoGallery(api),


    /* ================= SECTIONS ================= */
    sections: {
      locked: Boolean(cfg.sections?.locked),
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
    locked: Boolean(m.locked),
    lock_mode: m.lock_mode ?? undefined,

    enabled: Boolean(m.enabled),
    type: m.type ?? "",
    meeting_url: m.meeting_url ?? "",
    button_text: m.button_text ?? "",
  };
};

const normalizeYoutube = (api: any) => {
  const y = api.configuration?.youtube ?? {};
  return {
    locked: Boolean(y.locked),
    lock_mode: y.lock_mode ?? undefined,

    items: Array.isArray(y.items)
      ? y.items.map((v: any, i: number) => ({
        id: v.id,
        url: v.url,
        rank: v.rank ?? i + 1,
        enabled: v.enabled ?? true,
      }))
      : [],
  };
};

const normalizeLinksFiles = (api: any) => {
  const lf = api.configuration?.links_files ?? {};
  return {
    locked: Boolean(lf.locked),
    lock_mode: lf.lock_mode ?? undefined,

    items: Array.isArray(lf.items)
      ? lf.items.map((l: any, i: number) => ({
        id: l.id,
        type: l.type || "link",
        title: l.title || "",
        url: l.url || "",
        rank: l.rank ?? i + 1,
        enabled: l.enabled ?? true,
      }))
      : [],
  };
};

const normalizePhotoGallery = (api: any) => {
  const g = api.configuration?.photo_gallery ?? {};
  return {
    locked: Boolean(g.locked),
    lock_mode: g.lock_mode ?? undefined,
    section_title: g?.section_title || "Photo Gallery",

    items: Array.isArray(g.items)
      ? g.items.map((p: any, i: number) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        link: p.link ?? "",     // 🔥 ADD
        img_url: p.img_url,
        rank: p.rank ?? i + 1,
        enabled: p.enabled ?? true,
      }))
      : [],

  };
};

const normalizeVideoGallery = (api: any) => {
  const g = api.configuration?.video_gallery ?? {};
  return {
    locked: Boolean(g.locked),
    lock_mode: g.lock_mode ?? undefined,
    section_title: g.section_title || "Video Gallery",
    items: Array.isArray(g.items)
      ? g.items.map((v: any, i: number) => ({
        id: v.id,
        title: v.title,
        description: v.description,
        video_url: v.video_url,
        rank: v.rank ?? i + 1,
        enabled: v.enabled ?? true,
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
    cover_url: cfg.cover.cover_url,
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
      contact: {
        locked: Boolean(cfg.contact?.locked),
        lock_mode: cfg.contact?.lock_mode ?? undefined,

        connect_title: cfg.contact?.connect_title || "Connect",
        contact_title: cfg.contact?.contact_title || "Save Contact",
      },

      theme: {
        locked: cfg.theme.locked,
        lock_mode: cfg.theme.lock_mode,
        card_background: cfg.theme.card_background,
        button_color: cfg.theme.button_color,
        card_text: cfg.theme.card_text,
        button_text: cfg.theme.button_text,
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
        toggle_price: cfg.products.toggle_price,
        section_title: cfg.products.section_title,
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
      photo_gallery: {
        locked: cfg.photo_gallery.locked,
        lock_mode: cfg.photo_gallery.lock_mode,
        section_title: cfg.photo_gallery.section_title,

        items: cfg.photo_gallery.items.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          link: p.link,
          img_url: p.img_url,
          rank: p.rank,
          enabled: p.enabled,
        })),
      },
      video_gallery: {
        locked: cfg.video_gallery.locked,
        lock_mode: cfg.video_gallery.lock_mode,
        section_title: cfg.video_gallery.section_title,
        items: cfg.video_gallery.items.map((v: any) => ({
          title: v.title,
          description: v.description,
          link: v.link,
          video_url: v.video_url,
          rank: v.rank,
          enabled: v.enabled,
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
