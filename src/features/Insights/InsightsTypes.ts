export interface InsightMetrics {
  pipeline: string;
  pipelineGrowth: string;

  conversionRate: string;
  conversionGrowth: string;

  activeCampaigns: number;
  campaignChange: string;

  teamSize: number;
  teamGrowth: string;
}

export interface RevenueData {
  month: string;
  closed: number;
  pipeline: number;
  target: number;
}
