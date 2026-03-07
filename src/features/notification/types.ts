export type NotificationCategory =
  | "assignment"
  | "campaign"
  | "crm"
  | "credit"
  | "general";

export interface Notification {
  id: number;
  message_title: string;
  message_body: string;
  status: "sent" | "read";
  created_at: string;
  read_at?: string;

  is_read: boolean;

  category?: NotificationCategory;
  reference_id?: number;
  reference_slug?: string;
    sent_to?: string[];
}

export interface SentNotification {
  id: number;
  message_title: string;
  message_body: string;
  created_at: string;
  sent_to: string[];
}
