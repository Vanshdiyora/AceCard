// All allowed status values from your backend
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
  name: string;
  description: string;
  status: CampaignStatus;

  budget: number;
  targets: Record<string, any>;

  leads_generated: number;
  conversion_rate: number;
  pipeline_value: number;
}

// Redux slice state shape
export interface CampaignState {
  items: Campaign[];
  loading: boolean;
  error: string | null;
}
