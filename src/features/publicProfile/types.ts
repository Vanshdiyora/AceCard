export interface PublicProfileApi {
  username?: string;
  name?: string;
  email?: string;
  role?: string;
  job_title?: string;
  vendor_name?: string;

  configuration?: {
    profile?: {
      avatar_url?: string;
      cover_url?: string;
      description?: string;
    };

    theme?: {
      primary_color?: string | null;
      background_color?: string | null;
      card_color?: string | null;
      text_color?: string | null;
      accent_color?: string | null;
    } | null;

    banner?: {
      enabled?: boolean;
      image_url?: string | null;
      cta_text?: string | null;
      cta_url?: string | null;
      rank?: number | null;
    } | null;

  meeting: {
  locked: boolean;
  enabled: boolean;
  type: string;
  meeting_url: string;
  button_text: string;
};


    social_links?: { items?: any[] | null } | null;

    products?: {
      locked: boolean;
      items: {
        id: string | number;
        name: string;
        price?: string;
        image_url?: string;
        rank: number;
        enabled: boolean;
      }[];
    };

    youtube: {
      locked: boolean;
      items: {
        id: string;
        url: string;
        rank: number;
        enabled: boolean;
      }[];
    };

    links_files?: { items?: any[] | null } | null;
    sections: SectionItem[];
  } | null;
}



export interface SectionItem {
  id: string;
  type: string;
  rank: number;
  locked: boolean;
  enabled: boolean;
}
