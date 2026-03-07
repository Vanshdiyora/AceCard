export type LockMode = "global" | "individual" | "locked";

export function normalizeProfile(api: any) {
  const cfg = api.configuration ?? {};

  return {
    role: api.role ?? "manager",
    /* ================= PROFILE ================= */
    profile: {
      avatar_url: cfg.profile.avatar_url,
      description: cfg.profile.description,
      custom_profile: cfg.profile.custom_profile,
      custom_profile_url: cfg.profile.custom_profile_url,
      custom_job_role:
        api.custom_job_role ??
        cfg.profile?.custom_job_role ??
        "",
    },

    /* ================= COVER ================= */
    cover: {
      locked: Boolean(cfg.cover?.locked),
      lock_mode: cfg.cover?.lock_mode ?? undefined,
      locked_by: cfg?.cover?.locked_by ?? "",
      cover_url: cfg.cover?.cover_url ?? "",
    },

    /* ================= CARD BUTTONS ================= */
    card_buttons: (() => {
      const rawItems = Array.isArray(cfg.card_buttons?.items)
        ? cfg.card_buttons.items
        : [];

      const mappedItems = [...rawItems]
        .sort((a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0))
        .map((b: any, i: number) => ({
          id: b.id ?? crypto.randomUUID(),
          title: b.title ?? "",
          link: b.link ?? "",
          rank: i + 1, // always normalize rank
          enabled: b.enabled ?? true,
        }));

      return {
        locked: Boolean(cfg.card_buttons?.locked),
        lock_mode: cfg.card_buttons?.lock_mode ?? "individual",
        locked_by: cfg.card_buttons?.locked_by ?? "",
        items: mappedItems, // ✅ no fallback
      };
    })(),

    contact: {
      locked: Boolean(cfg.contact?.locked),
      lock_mode: cfg.contact?.lock_mode ?? undefined,
      locked_by: cfg?.contact?.locked_by ?? "",

      connect_title: cfg.contact?.connect_title || "Connect",
      contact_title: cfg.contact?.contact_title || "Save Contact",
      form_title: cfg.contact?.form_title || "Contact Form",

      fields: Array.isArray(cfg.contact?.fields)
        ? [...cfg.contact.fields]
          .sort((a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0))
          .map((f: any, i: number) => ({
            id: f.id ?? `field_${i}`,
            type: f.type ?? "text",
            label: f.label ?? "",
            placeholder: f.placeholder ?? "",
            required: Boolean(f.required),
            options: Array.isArray(f.options) ? f.options : [],
            rank: f.rank ?? i + 1,
            enabled: f.enabled ?? true,
          }))
        : [],
    },

    /* ================= LAYOUT ================= */
    layout: {
      locked: Boolean(cfg.layout?.locked),
      lock_mode: cfg.layout?.lock_mode ?? undefined,
      locked_by: cfg?.layout?.locked_by ?? "",
      profile_type: cfg.layout?.profile_type ?? 3,
      is_fade: Boolean(cfg.layout?.is_fade),
      font: cfg.layout?.font || "Inter",
      card_alignment: cfg.layout?.card_alignment || "center",

      use_background:
        ["solid", "gradient", "image", "video", "waves", "polka", "stripes", "zigzag"]
          .includes(cfg.layout?.use_background)
          ? cfg.layout.use_background
          : "gradient",

      color1: cfg.layout?.color1 || "#2f343a",   // 👈 base / pattern bg
      color2: cfg.layout?.color2 || "#6366f1",
      direction: ["to-r", "to-l", "to-b", "to-t"].includes(cfg.layout?.direction)
        ? cfg.layout.direction
        : "to-r",

      background_image: cfg.layout?.background_image || "",
      background_video: cfg.layout?.background_video || "",   // 👈 NEW
      background_color: cfg.layout?.background_color || "",
      custom_font: cfg.layout?.custom_font || "",
      use_custom_font: Boolean(cfg.layout?.use_custom_font),
      profile_width: Number(cfg.layout?.profile_width) || 2,
      button_style: Number(cfg.layout?.button_style) || 1,
      profile_radius: Number(cfg.layout?.profile_radius) || 40,
      fade_color: cfg.layout?.fade_color,
    },


    /* ================= THEME (NEW) ================= */
    theme: {
      locked: Boolean(cfg.theme?.locked),
      lock_mode: cfg.theme?.lock_mode ?? undefined,
      locked_by: cfg?.theme?.locked_by ?? "",
      card_background: cfg.theme?.card_background ?? "#BB3500",
      button_color: cfg.theme?.button_color ?? "#251F31",
      card_text: cfg.theme?.card_text ?? "#9F9F9F",
      button_text: cfg.theme?.button_text ?? "#B79A8A",
      image_text_color: cfg.theme?.image_text_color ?? "#000000",
    },

    /* ================= BANNER ================= */
    banner: {
      locked: Boolean(cfg.banner?.locked),
      lock_mode: cfg.banner?.lock_mode ?? undefined,
      locked_by: cfg?.banner?.locked_by ?? "",
      enabled: Boolean(cfg.banner?.enabled),
      image_url: cfg.banner?.image_url ?? "",
      cta_text: cfg.banner?.cta_text ?? "",
      cta_url: cfg.banner?.cta_url ?? "",
    },

    /* ================= MEETING ================= */
    // meeting: normalizeMeeting(api),

    /* ================= SOCIAL ================= */
    social_links: {
      locked: Boolean(cfg.social_links?.locked),
      lock_mode: cfg.social_links?.lock_mode ?? undefined,
      locked_by: cfg?.social_links?.locked_by ?? "",

      items: Array.isArray(cfg.social_links?.items)
        ? [...cfg.social_links.items]
          .sort((a: any, b: any) => (a.rank ?? 0) - (b.rank ?? 0))
          .map((s: any, i: number) => ({
            id: s.id ?? crypto.randomUUID(),
            platform: s.platform ?? s.type ?? "",
            url: s.url ?? "",
            enabled: s.enabled ?? true,
            rank: s.rank ?? i + 1,   // ✅ normalize rank
          }))
        : [],
    },


    /* ================= PRODUCTS ================= */
    products: {
      locked: Boolean(cfg.products?.locked),
      lock_mode: cfg.products?.lock_mode ?? undefined,
      locked_by: cfg?.products?.locked_by ?? "",
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
      locked_by: cfg?.sections?.locked_by ?? "",
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
// const normalizeMeeting = (api: any) => {
//   const m = api.configuration?.meeting ?? {};
//   return {
//     locked: Boolean(m.locked),
//     lock_mode: m.lock_mode ?? undefined,
//     locked_by: m?.locked_by ?? "",
//     enabled: Boolean(m.enabled),
//     type: m.type ?? "",
//     meeting_url: m.meeting_url ?? "",
//     button_text: m.button_text ?? "",
//   };
// };

const normalizeYoutube = (api: any) => {
  const y = api.configuration?.youtube ?? {};
  return {
    locked: Boolean(y.locked),
    lock_mode: y.lock_mode ?? undefined,
    locked_by: y?.locked_by ?? "",
    section_title: y?.section_title ?? "Video Gallery",
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
    locked_by: lf?.locked_by ?? "",
    section_title: lf?.section_title ?? "Links and Files",
    items: Array.isArray(lf.items)
      ? lf.items.map((l: any, i: number) => ({
        id: l.id,
        type: l.type || "link",
        title: l.title || "",
        url: l.url || l.file_url || "",
        file_url: l.file_url || "",
        file_type: l.file_type || "",
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
    locked_by: g?.locked_by ?? "",
    section_title: g?.section_title || "Photo Gallery",

    items: Array.isArray(g.items)
      ? g.items.map((p: any, i: number) => ({
        id: p.id || crypto.randomUUID(),
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
  const baseConfig = baseApi.configuration ?? {};

  return {
    ...baseApi,
    role: cfg.role,

    avatar_url: cfg.profile.avatar_url,
    description: cfg.profile.description,
    custom_job_role: cfg.profile.custom_job_role,

    configuration: {
      ...baseConfig,

      /* ================= PROFILE ================= */
      profile: {
        ...baseConfig.profile,
        ...cfg.profile,
      },

      /* ================= COVER ================= */
      cover: {
        locked: cfg.cover.locked,
        lock_mode: cfg.cover.lock_mode ?? null,
        locked_by: cfg.cover.locked_by,
        cover_url: cfg.cover.cover_url,
      },

      /* ================= CONTACT ================= */
      contact: {
        locked: cfg.contact.locked,
        lock_mode: cfg.contact.lock_mode ?? null,
        locked_by: cfg.contact.locked_by,

        connect_title: cfg.contact.connect_title,
        contact_title: cfg.contact.contact_title,
        form_title: cfg.contact.form_title,

        fields: cfg.contact.fields
          .sort((a: any, b: any) => a.rank - b.rank)
          .map((f: any) => ({
            id: f.id,
            type: f.type,
            label: f.label,
            placeholder: f.placeholder,
            required: f.required,
            options: f.options ?? [],
            rank: f.rank,
            enabled: f.enabled ?? true,
          })),
      },

      /* ================= LAYOUT ================= */
      layout: {
        locked: cfg.layout.locked,
        lock_mode: cfg.layout.lock_mode ?? null,
        locked_by: cfg.layout.locked_by,

        profile_type: cfg.layout.profile_type,
        is_fade: cfg.layout.is_fade,
        font: cfg.layout.font,
        card_alignment: cfg.layout.card_alignment,

        use_background: cfg.layout.use_background,
        color1: cfg.layout.color1,
        color2: cfg.layout.color2,
        direction: cfg.layout.direction,

        background_image: cfg.layout.background_image,
        background_video: cfg.layout.background_video,
        background_color: cfg.layout.background_color,

        custom_font: cfg.layout.custom_font,
        use_custom_font: cfg.layout.use_custom_font,

        profile_width: cfg.layout.profile_width,
        profile_radius: cfg.layout.profile_radius,
        button_style: cfg.layout.button_style,

        fade_color: cfg.layout.fade_color,
      },

      /* ================= THEME ================= */
      theme: {
        locked: cfg.theme.locked,
        lock_mode: cfg.theme.lock_mode ?? null,
        locked_by: cfg.theme.locked_by,

        card_background: cfg.theme.card_background,
        button_color: cfg.theme.button_color,
        card_text: cfg.theme.card_text,
        button_text: cfg.theme.button_text,
        image_text_color: cfg.theme.image_text_color,
      },

      /* ================= BANNER ================= */
      banner: {
        locked: cfg.banner.locked,
        lock_mode: cfg.banner.lock_mode ?? null,
        locked_by: cfg.banner.locked_by,

        enabled: cfg.banner.enabled,
        image_url: cfg.banner.image_url,
        cta_text: cfg.banner.cta_text,
        cta_url: cfg.banner.cta_url,
      },
      /* ================= CARD BUTTONS ================= */
      card_buttons: {
        locked: cfg.card_buttons.locked,
        lock_mode: cfg.card_buttons.lock_mode ?? null,
        locked_by: cfg.card_buttons.locked_by,

        items: cfg.card_buttons.items
          .sort((a: any, b: any) => a.rank - b.rank)
          .map((b: any) => ({
            id: b.id,
            title: b.title,
            link: b.link,
            rank: b.rank,
            enabled: b.enabled,
          })),
      },
      /* ================= MEETING ================= */
      // meeting: {
      //   locked: cfg.meeting.locked,
      //   lock_mode: cfg.meeting.lock_mode ?? null,
      //   locked_by: cfg.meeting.locked_by,

      //   enabled: cfg.meeting.enabled,
      //   type: cfg.meeting.type,
      //   meeting_url: cfg.meeting.meeting_url,
      //   button_text: cfg.meeting.button_text,
      // },

      /* ================= SOCIAL LINKS ================= */
      social_links: {
        locked: cfg.social_links.locked,
        lock_mode: cfg.social_links.lock_mode ?? null,
        locked_by: cfg.social_links.locked_by,

        items: [...cfg.social_links.items]
          .sort((a: any, b: any) => a.rank - b.rank)
          .map((s: any) => ({
            id: s.id,
            platform: s.platform,
            url: s.url,
            rank: s.rank,
            enabled: s.enabled ?? true,
          })),
      },

      /* ================= PRODUCTS ================= */
      products: {
        locked: cfg.products.locked,
        lock_mode: cfg.products.lock_mode ?? null,
        locked_by: cfg.products.locked_by,

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

      /* ================= YOUTUBE ================= */
      youtube: {
        locked: cfg.youtube.locked,
        lock_mode: cfg.youtube.lock_mode ?? null,
        locked_by: cfg.youtube.locked_by,
        section_title: cfg.youtube.section_title,

        items: cfg.youtube.items.map((v: any) => ({
          id: v.id,
          url: v.url,
          rank: v.rank,
          enabled: v.enabled,
        })),
      },

      /* ================= LINKS & FILES ================= */
      links_files: {
        locked: cfg.links_files.locked,
        lock_mode: cfg.links_files.lock_mode ?? null,
        locked_by: cfg.links_files.locked_by,
        section_title: cfg.links_files.section_title,

        items: cfg.links_files.items.map((l: any) => ({
          id: l.id,
          type: l.type,
          title: l.title,
          url: l.url || "",
          file_url: l.file_url || "",
          file_type: l.file_type || "",
          rank: l.rank,
          enabled: l.enabled,
        })),
      },

      /* ================= PHOTO GALLERY ================= */
      photo_gallery: {
        locked: cfg.photo_gallery.locked,
        lock_mode: cfg.photo_gallery.lock_mode ?? null,
        locked_by: cfg.photo_gallery.locked_by,
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

      /* ================= VIDEO GALLERY ================= */
      video_gallery: {
        locked: cfg.video_gallery.locked,
        lock_mode: cfg.video_gallery.lock_mode ?? null,
        section_title: cfg.video_gallery.section_title,

        items: cfg.video_gallery.items.map((v: any) => ({
          id: v.id,
          title: v.title,
          description: v.description,
          video_url: v.video_url,
          rank: v.rank,
          enabled: v.enabled,
        })),
      },

      /* ================= SECTIONS ================= */
      sections: {
        locked: cfg.sections.locked,
        lock_mode: cfg.sections.lock_mode ?? null,
        locked_by: cfg.sections.locked_by,

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
