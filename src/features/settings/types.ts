// ---------- Profile ----------
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
  address?: string;
}

export interface AccountProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar_url: string;
  bio: string;
  company_description: string;
  socials: any;
  other_links: any;
  display_settings: any;
  address: string;
}

export type UpdateAccountProfilePayload = AccountProfile;

// ---------- Lead Config ----------
export type RequiredFields = {
  name: boolean;
  phone: boolean;
  email: boolean;
  product: boolean;
};

export type FieldType =
  | "text"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "datetime";

export type Option = {
  label: string;
  value: string;
};

export type CustomField = {
  fieldId: string;
  label: string;
  type: FieldType;
  required: boolean;
  archived: boolean;
  options?: Option[];
};

export interface LeadFormConfig {
  customFields: CustomField[];
}

// ---------- State ----------
export interface SettingsState {
  account: {
    data: AccountProfile | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
  };
  leadConfig: {
    data: LeadFormConfig | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
  };
}
