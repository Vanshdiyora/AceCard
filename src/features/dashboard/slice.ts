import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getVendorMetrics } from "./services/dashboard.service";
import type { DashboardState } from "./types";

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetch",
  async () => {
    return await getVendorMetrics();
  }
);

const initialState: DashboardState = {
  data: null,
  loading: true,
};

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      });
  }
});

export default dashboardSlice.reducer;
