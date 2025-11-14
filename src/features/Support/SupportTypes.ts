export interface SupportTicket {
  id: number;
  title: string;
  category: string;
  created: string;
  ticketNumber: string;
  priority: "high" | "medium" | "low";
  status: "open" | "resolved" | "in progress";
}

export interface SubscriptionStatus {
  plan: string;
  billingDate: string;
  active: boolean;
}
