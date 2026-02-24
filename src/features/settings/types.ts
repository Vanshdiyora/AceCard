// ---------- Profile ----------
export interface AccountProfileResponse {
  username: string; // 👈 ADD THIS
  name: string;
  vendor_name: string;
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
  custom_job_role: string;
}

export interface AccountProfile {
  username: string; // 👈 ADD THIS
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
  custom_job_role: string;
  vendor_name: string;
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
  color?: {
    bg: string;
    text: string;
    border: string;
  };
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
  standardFields: Record<string, boolean>;
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
  suggestedQuestions: SuggestedQuestionsState;
  integrations: CRMIntegrationState;

  trackingPixels: {
    data: TrackingPixels | null;
    loading: boolean;
    saving: boolean;
    error: string | null;
  };
}
export interface UpdateMyAccountProfilePayload {
  name?: string;
  vendor_name?: string;
  custom_job_role: string;
  address: string;
  company_description: string;
}

// ---------- Suggested Questions ----------
export interface SuggestedQuestion {
  id: number;
  question: string;
  created_at?: string;
  updated_at?: string;
}

export interface SuggestedQuestionsState {
  data: SuggestedQuestion[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export type CRMProvider = "hubspot" | "zoho" | "salesforce" | "odoo";

export interface CRMIntegrationState {
  data: CRMIntegration[];
  loading: boolean;
  error: string | null;
}

export interface CRMIntegration {
  provider: CRMProvider;
  connected: boolean;

  // loading flags (UI only)
  syncing?: boolean;
  connecting?: boolean;
  disconnecting?: boolean;

  created_at?: string;
}

// ---------- Tracking Pixels ----------
export interface TrackingPixels {
  meta_pixel_id: string;
  google_analytics_id: string;
  linkedin_insight_tag_id: string;
}
