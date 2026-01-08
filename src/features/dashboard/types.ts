export interface RecentActivityEntry {
  type: string;
  title: string;
  name: string;
  created_at: string;
}
interface Performer {
  name: string;
  leads: number;
  conversion: string;
}
export interface QuickStats {
  active_campaigns: number;
  team_members: number;
  products: number;
  avg_deal_size: number;
  win_rate: number;
  top_performers?: Performer[];
}

export interface RepPerformance {
  top_performer: number;
  average: number;
  need_improvement: number;
}

export interface RatioPoint {
  month: string;
  value: number;
}

export interface KPIBlock {
  value: number;
  prev_value: number;
  percentage: number;
}

export interface DashboardMetrics {
  pipeline: KPIBlock;
  leads_captured: KPIBlock;
  card_taps: KPIBlock;
  tap_lead_ratio: KPIBlock;
  conversion_rate: KPIBlock;

  tap_lead_ratio_over_time: RatioPoint[];

  quick_stats: QuickStats;
  recent_activity: RecentActivityEntry[];
  rep_performance: RepPerformance;
}

export interface DashboardState {
  data: DashboardMetrics | null;
  loading: boolean;
}
