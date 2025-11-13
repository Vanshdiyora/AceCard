import { createSlice } from "@reduxjs/toolkit";
import type { CampaignState } from "./CampaignTypes";

const initialState: CampaignState = {
  items: [
    {
      id: 1,
      title: "Q1 Tech Launch",
      status: "active",
      leads: 145,
      pipeline: 425000,
      conversion: 28.5,
      owner: "Sarah Johnson",
    },
    {
      id: 2,
      title: "Enterprise Outreach",
      status: "active",
      leads: 89,
      pipeline: 320000,
      conversion: 32.1,
      owner: "Michael Chen",
    },
    {
      id: 3,
      title: "Product Demo Series",
      status: "active",
      leads: 203,
      pipeline: 180000,
      conversion: 22.8,
      owner: "David Rodriguez",
    },
    {
      id: 4,
      title: "Holiday Special",
      status: "paused",
      leads: 67,
      pipeline: 95000,
      conversion: 18.5,
      owner: "Sarah Johnson",
    },
  ],
};

const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {
    // Example if you want to add dynamic updates later
    addCampaign(state, action) {
      state.items.push(action.payload);
    },
  },
});

export const { addCampaign } = campaignSlice.actions;
export default campaignSlice.reducer;
