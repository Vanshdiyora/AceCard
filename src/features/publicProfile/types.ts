export interface PublicProfileApi {
  username?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  job_title?: string;

  configuration?: {
    profile?: {
      avatar_url?: string | null;
      cover_url?: string | null;
      name?: string | null;
      username?: string | null;
      email?: string | null;
      role?: string | null;
      vendor_name?: string | null;
      description?: string | null;
    } | null;

    theme?: {
      locked?: boolean;
      primary_color?: string | null;
      background_color?: string | null;
      card_color?: string | null;
      text_color?: string | null;
      accent_color?: string | null;
    } | null;

    banner?: {
      locked?: boolean;
      enabled?: boolean;
      image_url?: string | null;
      cta_text?: string | null;
      cta_url?: string | null;
      rank?: number | null;
    } | null;

    meeting?: {
      locked?: boolean;
      enabled?: boolean;
      type?: string | null;
      meeting_url?: string | null;
      button_text?: string | null;
    } | null;

    social_links?: {
      locked?: boolean;
      items?: {
        id: string;
        label: string;
        url: string;
        enabled: boolean;
      }[] | null;
    } | null;

    products?: {
      locked?: boolean;
      items?: any[] | null;
    } | null;

    youtube?: {
      locked?: boolean;
      items?: any[] | null;
    } | null;

    links_files?: {
      locked?: boolean;
      items?: any[] | null;
    } | null;

    sections?: any[] | null;
  } | null;
}
