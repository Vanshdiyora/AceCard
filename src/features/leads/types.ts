export interface Lead {
  id: number;
  vendor_id: number;
  lead_name: string;
  phone: string;
  email: string;
  company: string;
  stage: string;
  deal_amount: number;
  source: string;
  age?: number;
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
