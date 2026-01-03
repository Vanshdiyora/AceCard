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
  name: string;
  email: string;
  phone: string;
  role: "manager" | "sales_rep" | "vendor" | string;
  status: "active" | "pending" | "suspended";

  permissions?: TeamPermissions;

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
