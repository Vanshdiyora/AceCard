export type LockMode = "global" | "individual" | "locked";

export interface LockMeta {
  locked: boolean;
  lock_mode?: LockMode;
}

/* ================= SECTION ITEM ================= */

export interface SectionItem {
  id: string;
  type: string;
  rank: number;
  enabled: boolean;
}

/* ================= API ROOT ================= */

export interface PublicProfileApi {
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  job_title?: string;
  vendor_name?: string;
  custom_job_role?: string;
  address?: string;
  configuration?: {
    /* ---------- PROFILE ---------- */
    profile?: {
      avatar_url?: string;
      cover_url?: string;
      description?: string;
    };

    /* ---------- THEME ---------- */
    theme?: LockMeta & {
      primary_color?: string | null;
      background_color?: string | null;
      card_color?: string | null;
      text_color?: string | null;
      accent_color?: string | null;
    } | null;

    /* ---------- BANNER ---------- */
    banner?: LockMeta & {
      enabled?: boolean;
      image_url?: string | null;
      cta_text?: string | null;
      cta_url?: string | null;
      rank?: number | null;
    } | null;

    /* ---------- MEETING ---------- */
    meeting: LockMeta & {
      enabled: boolean;
      type: string;
      meeting_url: string;
      button_text: string;
    };

    /* ---------- SOCIAL ---------- */
    social_links?: { items?: any[] | null } | null;

    /* ---------- PRODUCTS ---------- */
    products?: LockMeta & {
      items: {
        id: string | number;
        name: string;
        price?: string;
        image_url?: string;
        rank: number;
        enabled: boolean;
      }[];
    };

    /* ---------- YOUTUBE ---------- */
    youtube: LockMeta & {
      items: {
        id: string;
        url: string;
        rank: number;
        enabled: boolean;
      }[];
    };

    /* ---------- LINKS & FILES ---------- */
    links_files?: LockMeta & {
      items?: any[] | null;
    } | null;

    /* ---------- SECTIONS (GROUP LOCK) ---------- */
    sections?: LockMeta & {
      items: SectionItem[];
    };
  } | null;
}
