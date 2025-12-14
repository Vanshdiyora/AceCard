export type NotificationCategory =
  | "assignment"
  | "campaign"
  | "crm"
  | "credit"
  | "general";

export interface Notification {
  id: number;
  title: string;
  message_title: string;
  message_body: string;
  category: "assignment" | "campaign" | "crm" | "credit" | "general";
  is_read: boolean;          
  created_at: string;

  // Optional fields for navigation
  reference_id?: number;
  reference_slug?: string;
}
