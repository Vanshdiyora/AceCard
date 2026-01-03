/* ---------- SUPPORT REPLY ---------- */
export interface SupportReply {
  id: number;
  ticket_id: number;
  message: string;
  status?: "open" | "resolved" | "in_progress";
  created_at: string;
}

/* ---------- SUPPORT TICKET ---------- */
export interface SupportTicket {
  id: number;
  vendor_id: number;
  title: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "open" | "resolved" | "in_progress";

  replies?: SupportReply[];

  created_at: string;
  updated_at: string;
}

/* ---------- PAGINATION ---------- */
export interface SupportMeta {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface SupportListResponse {
  data: SupportTicket[];
  meta: SupportMeta;
}

/* ---------- STATE ---------- */
export interface SupportState {
  tickets: SupportTicket[];
  meta: SupportMeta | null;
  loading: boolean;
  error?: string;
}
