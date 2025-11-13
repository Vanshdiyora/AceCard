export interface Campaign {
  id: number;
  title: string;
  status: "active" | "paused";
  leads: number;
  pipeline: number;
  conversion: number;
  owner: string;
}

export interface CampaignState {
  items: Campaign[];
}
