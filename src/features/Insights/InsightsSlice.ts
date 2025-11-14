import { createSlice } from "@reduxjs/toolkit";
import type { InsightMetrics, RevenueData } from "./InsightsTypes";

interface InsightsState {
  metrics: InsightMetrics;
  revenueData: RevenueData[];
}

const initialState: InsightsState = {
  metrics: {
    pipeline: "$1.1M",
    pipelineGrowth: "+15.2%",

    conversionRate: "27.4%",
    conversionGrowth: "+3.8%",

    activeCampaigns: 12,
    campaignChange: "-2 from last month",

    teamSize: 16,
    teamGrowth: "+3 this quarter",
  },

  revenueData: [
    { month: "Jan", closed: 245000, pipeline: 650000, target: 300000 },
    { month: "Feb", closed: 300000, pipeline: 720000, target: 350000 },
    { month: "Mar", closed: 410000, pipeline: 820000, target: 400000 },
    { month: "Apr", closed: 380000, pipeline: 780000, target: 420000 },
    { month: "May", closed: 500000, pipeline: 900000, target: 450000 },
  ],
};

const insightsSlice = createSlice({
  name: "insights",
  initialState,
  reducers: {},
});

export default insightsSlice.reducer;
