import { createSlice } from "@reduxjs/toolkit";
import type { SupportTicket, SubscriptionStatus } from "./SupportTypes";

interface SupportState {
  tickets: SupportTicket[];
  subscription: SubscriptionStatus;
}

const initialState: SupportState = {
  tickets: [
    {
      id: 1,
      title: "Unable to add new lead",
      category: "Technical Issue",
      created: "2 hours ago",
      ticketNumber: "Ticket #1",
      priority: "high",
      status: "open",
    },
    {
      id: 2,
      title: "Request for custom domain setup",
      category: "Slot Request",
      created: "1 day ago",
      ticketNumber: "Ticket #2",
      priority: "medium",
      status: "in progress",
    },
    {
      id: 3,
      title: "Subscription renewal reminder",
      category: "Subscription",
      created: "3 days ago",
      ticketNumber: "Ticket #3",
      priority: "low",
      status: "resolved",
    },
    {
      id: 4,
      title: "Export feature not working",
      category: "Technical Issue",
      created: "5 hours ago",
      ticketNumber: "Ticket #4",
      priority: "high",
      status: "open",
    },
  ],

  subscription: {
    plan: "Professional Plan",
    billingDate: "November 4, 2025",
    active: true,
  },
};

const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {},
});

export default supportSlice.reducer;
