export interface Lead {
  id: number;
  vendor_id: number;
  lead_name: string;
  phone: string;
  email: string;
  company: string;
  assigned_rep_id?: number;
  assigned_rep_name: string;
  stage: string;
  products?: LeadProduct[];
  deal_amount: number;
  source: string;
  last_interaction_at: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
  campaign_id?: number;
}

export interface CreateLeadDto {
  lead_name: string;
  phone: string;
  email: string;
  company: string;
  stage: string;
  deal_amount: number;
  source: string;
  age?: number;
}

export interface UpdateLeadDto extends CreateLeadDto { }

export interface PaginationMeta {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface LeadsApiResponse {
  data: Lead[];
  meta: PaginationMeta;
}

export interface LeadNote {
  id: number;
  lead_id: number;
  author_id: number;

  // ✅ ADD THESE (from API)
  author_name?: string;
  author_email?: string;

  body: string;
  created_at: string;
}

export type TimelineEventType = "note" | "created" | "updated" | "status_changed" | "unknown";

export interface TimelineItem {
  id: string;
  type: TimelineEventType;
  timestamp: string;
  title: string;
  description: string;
  actor?: string;
}

export interface Meeting {
  id: number;
  lead_id: number;
  title?: string;
  scheduled_at: string;
  duration_min?: number;
  location?: string;
  notes?: string;
  created_by: number;
  created_at: string;
}

export interface LeadProduct {
  id: number;           // relation id
  product_id: number;   // actual product id
  name: string;
  quantity?: number;
  price?: number;
}

export type SortBy = "recent" | "name" | "deal_amount";
export type SortOrder = "asc" | "desc";


export type LeadStage =
  | "new"
  | "contacted"
  | "engaged"
  | "qualified"
  | "proposal_sent"
  | "converted"
  | "lost";
