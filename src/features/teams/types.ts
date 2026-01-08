/* ---------- PERMISSIONS ---------- */
export interface TeamPermissions {
  send_notifications: boolean;
  view_analytics: boolean;
  view_leads: boolean;
}

/* ---------- TEAM MEMBER ---------- */
export interface TeamMember {
  id: number;
  vendor_id: number;
  manager_id?: number | null; 
  name: string;
  email: string;
  phone: string;
  role: "manager" | "sales_rep" | "vendor_admin" | string;
  status: "active" | "pending" | "suspended";
  leads_count?: number;
  permissions?: TeamPermissions;
  deal_amount?: number;

  last_active_at?: string;
  created_at: string;
  updated_at: string;

  // UI-only fields
  leads?: number;
  pipeline?: string;
  conversion?: string;
  lastActive?: string;
}

/* ---------- PAGINATION ---------- */
export interface TeamMeta {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface TeamListResponse {
  data: TeamMember[];
  meta: TeamMeta;
}

/* ---------- DTOs ---------- */
export interface CreateTeamMemberDTO {
  email: string;
  name: string;
  password: string;
  phone: string;
  role: string;
  manager_id?: number; 
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
