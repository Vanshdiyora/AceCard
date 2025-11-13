import { createSlice } from "@reduxjs/toolkit";
import type { DashboardState } from "./DashBoardTypes";

const initialState: DashboardState = {
  stats: {
    pipelineGenerated: 847500,
    leadsCaptured: 342,
    totalCardTaps: 1247,
    ratio: 27.4,
  },
  pipeline: [
    { month: "Jan", value: 60000 },
    { month: "Feb", value: 75000 },
    { month: "Mar", value: 90000 },
    { month: "Apr", value: 85000 },
    { month: "May", value: 100000 },
    { month: "Jun", value: 110000 },
  ],
  leadDistribution: [
    { name: "Qualified", value: 42 },
    { name: "Contacted", value: 29 },
    { name: "New", value: 29 },
  ],
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
});

export default dashboardSlice.reducer;
