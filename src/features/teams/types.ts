export interface TeamPermissions {
  send_notifications: boolean;
  view_analytics: boolean;
  view_leads: boolean;
}

export interface TeamMember {
  id: number;
  vendor_id: number;
  name: string;
  email: string;
  phone: string;
  role: "manager" | "salesperson" | "vendor" | string;
  status: "active" | "pending" | "suspended";
  permissions: TeamPermissions;
  created_at: string;
  updated_at: string;

  // UI placeholder metrics
  leads?: number;
  pipeline?: string;
  conversion?: string;
  lastActive?: string;
}

export interface CreateTeamMemberDTO {
  email: string;
  name: string;
  password: string;
  phone: string;
  role: string;
}

export interface UpdateTeamMemberDTO {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: "active" | "inactive";
}

export interface UpdatePermissionsDTO {
  send_notifications: boolean;
  view_analytics: boolean;
  view_leads: boolean;
}
