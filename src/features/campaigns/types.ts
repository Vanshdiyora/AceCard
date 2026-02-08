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
export interface CampaignProduct {
  id: number;
  name: string;
  category: string;
  price: number;
}

export type SortBy = "recent" | "name" | "pipeline_value";
export type SortOrder = "asc" | "desc";

export interface CampaignSalesperson {
  id: number;
  name: string;
  leads_generated: number;
  total_deal_amount: number;
}

export interface Campaign {
  id: number;
  vendor_id: number;
  name: string;
  description: string;
  manager_id?: number;
  manager_name: string;
  products?: CampaignProduct[];
  product_ids?: number[];    
  assigned_reps?: CampaignSalesperson[];
  assigned_reps_ids?: number[];
  start_date?: string;
  end_date?: string | null;
  status: CampaignStatus;
  budget: number;
  leads_generated: number;
  conversion_rate: number;
  pipeline_value: number;
  created_at: string;
  updated_at: string;
}


export type EnrichedCampaign = Campaign & {
  owner_name?: string;
};


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
