  /* ---------- VENDOR ---------- */
export interface VendorItem {
  id: number;
  legal_name: string;
  address: string;
  gst?: string;
  vendor_poc_name: string;
  primary_phone: string;
  primary_email: string;

  secondary_phone?: string;
  secondary_email?: string;

  logo_url?: string;
  brand_color?: string;
  tagline?: string;
  industry_type?: string;

  status: "active" | "archived";

  subscription_end_date: string;
  seats_appointed: number;
  pricing_per_card: number;
  payment_terms: string;
  vendor_poc_email: string;

  allowed_crm_integrations: string[];
  crm_manual_trigger: boolean;
  crm_realtime_sync: boolean;

  created_at: string;
  updated_at: string;

  /* ✅ NEW METRICS */
  total_leads: number;
  seats_used: number;
  total_voice_time: number; // ⏱ minutes
}

  /* ---------- PAGINATION ---------- */
  export interface VendorMeta {
    total_count: number;
    page: number;
    page_size: number;
    total_pages: number;
    has_next: boolean;
    has_previous: boolean;
  }

  export interface VendorListResponse {
    data: VendorItem[];
    meta: VendorMeta;
  }

  /* ---------- STATS ---------- */
  export interface VendorStat {
    title: string;
    value: number;
    change?: string;
    positive?: boolean;
    icon: "users" | "clock" | "check-circle" | "archive";
  }



  /* ---------- TEAM ACTIVITY ---------- */
export interface VendorTeamActivity {
  id:number;
  name: string;
  role: string;
  username: string;
}


export interface VendorTeamMeta {
  total_count: number;
  total_unread_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface VendorTeamResponse {
  data: VendorTeamActivity[];
  meta: VendorTeamMeta;
}

export interface SearchVendorTeamParams {
  name?: string;
  user_role?: string;
  username?: string;
  page?: number;
  page_size?: number;
  append?: boolean;
}

export interface VendorSeatsTarget {
  id: number;
  seats_appointed: number;
}
