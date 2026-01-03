// All allowed status values from backend
export type CampaignStatus =
  | "planned"
  | "draft"
  | "active"
  | "paused"
  | "archived"
  | "completed"
  | "expired";

// Campaign object from backend
export interface Campaign {
  id: number;
  vendor_id: number;
  name: string;
  description: string;
  status: CampaignStatus;
  budget: number;

  leads_generated: number;
  conversion_rate: number;
  pipeline_value: number;

  created_at: string;
  updated_at: string;
}

// Pagination metadata
export interface CampaignMeta {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// API response shape
export interface CampaignListResponse {
  data: Campaign[];
  meta: CampaignMeta;
}

// Redux slice state
export interface CampaignState {
  items: Campaign[];
  meta: CampaignMeta | null;
  loading: boolean;
  error: string | null;
}
