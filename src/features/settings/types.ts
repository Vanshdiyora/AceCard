export interface AccountProfileResponse {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url: string | null;
  job_title: string | null;
  bio: string | null;
  company_description: string | null;
  socials: any;
  other_links: any;
  display_settings: any;
}

// What your UI actually edits:
export interface AccountProfile {
  vendorName: string;
  pocName: string;
  email: string;
  phone: string;
}

export interface UpdateAccountProfilePayload {
  vendorName: string;
  pocName: string;
  email: string;
  phone: string;
}

export interface SettingsState {
  account: {
    data: AccountProfile | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
  };
}
