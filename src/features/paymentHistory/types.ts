/* ============================= ENUMS ============================= */

export type PaymentStatus = "Paid" | "Not Paid" | "Pending";

/* ============================= MAIN LIST ============================= */
/* This is for the main payments table */

export interface VendorPayment {
  id: number; // 🔥 payment id (important for mark paid)
  vendor_id: number;
  vendor_name: string;
  email: string;

  seats: number;
  price_per_card: number;
  payment_terms: string;
  payment_amount_total: number;

  days_left: number;
  is_archived: boolean;

  status: PaymentStatus;
}

/* ============================= HISTORY ============================= */
/* Each payment entry */

export interface PaymentHistory {
  id: number;
  vendor_id: number;

  seats: number;
  subject: string;
  price_per_card: number;

  payment_amount_total: number;
  payment_terms: string;

  subscription_start_date?: string;
  subscription_end_date?: string;

  payment_date?: string | null;
  created_at: string;

  status: "Paid" | "Pending" | "Not Paid";
  badge: string;
}

/* ============================= MARK UNPAID ============================= */

export interface MarkUnpaidPayload {
  payment_id: number;
  subscription_start_date?: string;
  subscription_end_date?: string;
}

/* ============================= UPDATE SUBSCRIPTION ============================= */

export interface UpdateSubscriptionPayload {
  vendor_id: number;
  payment_terms: string;
  seats: number;
  price_per_card: number;
}

/* ============================= PAGINATION ============================= */

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_count: number;
}

/* ============================= QUERY ============================= */

export interface PaymentsQuery {
  page: number;
  page_size: number;
  search?: string;

  sort_by?:
    | "days_left"
    | "total_amount"
    | "seats"
    | "last_seen"
    | "onboarding"
    | "alphabetical";

  sort_order?: "asc" | "desc";

  status?: "paid" | "unpaid";
}

/* ============================= REDUX STATE ============================= */

export interface PaymentsState {
  list: VendorPayment[];
  history: PaymentHistory[];
  loading: boolean;
  error: string | null;
  listMeta: PaginationMeta | null;
  historyMeta: PaginationMeta | null;
}