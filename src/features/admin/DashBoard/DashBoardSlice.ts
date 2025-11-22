import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { DashboardState } from "./DashBoardTypes";

// Fake initial delay so UI can show skeleton
export const loadDashboard = createAsyncThunk(
  "dashboard/loadDashboard",
  async () => {
    // This delay forces skeleton to show
    await new Promise((resolve) => setTimeout(resolve, 1200));

    return {
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
  }
);

const initialState: DashboardState = {
  stats: null,
  pipeline: [],
  leadDistribution: [],
  loading: true,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadDashboard.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
        state.pipeline = action.payload.pipeline;
        state.leadDistribution = action.payload.leadDistribution;
        state.loading = false;
      });
  },
});

export default dashboardSlice.reducer;
