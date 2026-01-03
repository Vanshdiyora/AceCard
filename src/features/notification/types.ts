export type NotificationCategory =
  | "assignment"
  | "campaign"
  | "crm"
  | "credit"
  | "general";

export interface Notification {
  id: number;

  // Backend fields
  message_title: string;
  message_body: string;
  status: "sent" | "read";     // ✅ backend truth
  created_at: string;
  read_at?: string;

  // UI helper (derived from status)
  is_read: boolean;            // ✅ status === "read"

  // Optional metadata
  category?: NotificationCategory;
  reference_id?: number;
  reference_slug?: string;
}
