/* ======================================================
   PERMISSIONS
====================================================== */

export interface TeamPermissions {
  manage_team: boolean;
  manage_products: boolean;
  manage_campaigns: boolean;
  view_leads: boolean;
  edit_leads: boolean;
  archive_leads: boolean;
  send_notifications: boolean;
  view_analytics: boolean;
}

export interface UpdatePermissionsDTO extends TeamPermissions {}


/* ======================================================
   TEAM MEMBER
====================================================== */

export interface TeamMember {
  id: number;
  vendor_id: number;
  manager_id?: number | null;
  name: string;
  email: string;
  phone: string;
  role: "manager" | "sales_rep" | "vendor_admin" | string;
  status: "active" | "pending" | "suspended";
  username: string;
  // 👇 ADD THIS
  website?: string;

  // Backend computed fields
  total_leads?: number;
  total_deal_amount?: number;
  assigned_manager?: {
    id: number;
    name: string;
  };

  permissions?: TeamPermissions;

  last_active_at?: string;
  created_at: string;
  updated_at: string;

  // UI-only
  leads?: number;
  pipeline?: string;
  conversion?: string;
  lastActive?: string;
  avatar?: string;
}

/* ======================================================
   PAGINATION
====================================================== */

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


/* ======================================================
   DTOs
====================================================== */

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
  status?: "active" | "pending" | "suspended";
}
