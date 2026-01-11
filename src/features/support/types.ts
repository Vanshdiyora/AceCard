/* ---------- SUPPORT REPLY ---------- */
export interface SupportReply {
  id: number;
  ticket_id: number;
  message: string;
  status?: "open" | "closed" | "pending";
  // status?: "open" | "resolved" | "in_progress";
  created_at: string;
}

/* ---------- SUPPORT TICKET ---------- */
/* ---------- SUPPORT TICKET ---------- */
export interface SupportTicket {
  id: number;
  vendor_id: number;
  vendor_name: string;
  vendor_email: string;
  requester_id: number;

  subject: string;
  category: string;
  priority: "high" | "medium" | "low";
  status: "open" | "closed" | "pending";
  description: string;

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

export type NewSupportTicket = Omit<
  SupportTicket,
  "id" | "vendor_id" | "created_at" | "updated_at" | "replies" | "status"
>;


export interface NewSupportTicketForm extends NewSupportTicket {
  description: string;
}