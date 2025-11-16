export interface SuperDashboardStats {
  activeVendors: number;
  totalSeats: number;
  leadsCaptured: number;
  activeSalespeople: number;
  pendingApprovals: number;
}

export interface RecentActivityItem {
  id: number;
  user: string;
  title: string;
  desc: string;
  time: string;
}

export interface SystemHealth {
  activeSessions: number;
  apiRequests: number;
  errorRate: string;
  avgResponseTime: string;
  seatUtilization: number;
}

export interface SuperDashboardState {
  stats: SuperDashboardStats;
  recentActivity: RecentActivityItem[];
  systemHealth: SystemHealth;
}
