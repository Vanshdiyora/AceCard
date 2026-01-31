export interface RecentActivityEntry {
  type: string;
  title: string;
  name: string;
  created_at: string;
}

export interface TopPerformer {
  name: string;
  revenue: number;
  lead_count: number;
}

export interface QuickStats {
  active_campaigns: number;
  team_members: number;
  products: number;
  avg_deal_size: number;
  win_rate: number;
}

export interface RepPerformance {
  top_performer: number;
  average: number;
  need_improvement: number;
}

/* -------------------------------
   CHART POINTS
-------------------------------- */
export interface RatioPoint {
  month: string;
  value: number;
}

export interface PipelinePoint {
  label: string; // 00:00, Mon, Jan etc.
  value: number;
}

/* -------------------------------
   KPI
-------------------------------- */
export interface KPIBlock {
  value: number;
  prev_value: number;
  percentage: number;
}

/* -------------------------------
   PIPELINE SUMMARY
-------------------------------- */
export interface PipelineGenerated {
  today: number;
  week: number;
  month: number;
  year: number;
}

/* -------------------------------
   MAIN DASHBOARD
-------------------------------- */
export interface DashboardMetrics {
  pipeline: KPIBlock;
  leads_captured: KPIBlock;
  card_taps: KPIBlock;
  tap_lead_ratio: KPIBlock;
  conversion_rate: KPIBlock;

  /* time series */
  tap_lead_ratio_over_time: RatioPoint[];
  pipeline_graph: PipelinePoint[];

  /* summary */
  pipeline_generated: PipelineGenerated;

  quick_stats: QuickStats;
  recent_activity: RecentActivityEntry[];
  rep_performance: RepPerformance;
  top_performers: TopPerformer[];
}

export interface DashboardState {
  data: DashboardMetrics | null;
  loading: boolean;
}
