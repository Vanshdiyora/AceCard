export interface Lead {
  id: number;
  vendor_id: number;
  lead_name: string;
  phone: string;
  email: string;
  company: string;
  assigned_rep_id?: number;
  stage: string;
  products?: number[];
  deal_amount: number;
  source: string;
  last_interaction_at: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
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

export interface UpdateLeadDto extends CreateLeadDto {}

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
  body: string;
  created_at: string;
}
