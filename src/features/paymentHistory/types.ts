export type PaymentStatus = "PAID" | "NOT PAID";

export interface VendorPayment {
  vendor_id: number;  
  vendor_name: string;
  email: string;
  seats: number;
  price_per_card: number;
  payment_terms: string;
  payment_amount_total: number;
  days_left: number;
  is_archived: boolean;

  status?: PaymentStatus; // ✅ NEW
}

export interface MarkUnpaidPayload {
  vendor_id: number;
  subscription_start_date?: string;
  subscription_end_date?: string;
}


export interface PaymentHistory {
  id: number;
  vendor_id: number;
  payment_amount_total: number;
  payment_terms: string;
  created_at: string;
}

export interface UpdateSubscriptionPayload {
  vendor_id: number;
  payment_terms: string;
  seats: number;
  price_per_card: number;
  payment_amount_total: number;
}

/* 🔑 pagination meta */
export interface PaginationMeta {
  page: number;
  page_size: number;
  total_count: number;
}

export interface PaymentsQuery {
  page: number;
  page_size: number;
  search?: string;

  /* 🔥 NEW */
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

export interface PaymentsState {
  list: VendorPayment[];
  history: PaymentHistory[];
  loading: boolean;
  error: string | null;
  meta: PaginationMeta | null; // ✅ REQUIRED
}
