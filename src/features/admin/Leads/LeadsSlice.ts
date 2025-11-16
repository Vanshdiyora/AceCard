import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { Lead } from "./LeadsTypes";

interface LeadsState {
  leads: Lead[];
}

const initialState: LeadsState = {
  leads: [
    {
      id: 1,
      name: "John Smith",
      company: "Tech Solutions Inc.",
      stage: "Qualified",
      stageColor: "bg-green-100 text-green-700",
      owner: "Sarah J.",
      lastContact: "2 hours ago",
      nextAction: "Follow-up call",
    },
    {
      id: 2,
      name: "Emily Davis",
      company: "Global Enterprises",
      stage: "Contacted",
      stageColor: "bg-yellow-100 text-yellow-700",
      owner: "Michael C.",
      lastContact: "1 day ago",
      nextAction: "Send proposal",
    },
    {
      id: 3,
      name: "Robert Wilson",
      company: "Innovation Labs",
      stage: "New",
      stageColor: "bg-blue-100 text-blue-700",
      owner: "David R.",
      lastContact: "3 days ago",
      nextAction: "Initial outreach",
    },
  ],
};

const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    addLead: (state, action: PayloadAction<Lead>) => {
      state.leads.push(action.payload);
    },
  },
});

export const { addLead } = leadsSlice.actions;
export default leadsSlice.reducer;
