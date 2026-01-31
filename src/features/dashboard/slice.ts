import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getVendorMetrics } from "./services/dashboard.service";
import type { DashboardState, DashboardMetrics } from "./types";

/* -----------------------------------------------------
   ERROR HANDLER
----------------------------------------------------- */

type ApiError = { response?: { data?: { error?: string; message?: string } } };

const extractApiError = (err: unknown, fallback: string): string =>
  (err as ApiError)?.response?.data?.error ||
  (err as ApiError)?.response?.data?.message ||
  (err as Error)?.message ||
  fallback;

/* -----------------------------------------------------
   THUNK
----------------------------------------------------- */

export type Period = "day" | "week" | "month" | "year";

export const fetchDashboard = createAsyncThunk<
  DashboardMetrics,
  Period,
  { rejectValue: string }
>("dashboard/fetch", async (period, { rejectWithValue }) => {
  try {
    return await getVendorMetrics(period);
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, "Failed to load dashboard")
    );
  }
});

/* -----------------------------------------------------
   INITIAL STATE
----------------------------------------------------- */

interface DashboardSliceState extends DashboardState {
  error: string | null;
  period: Period;
}

const initialState: DashboardSliceState = {
  data: null,
  loading: true,
  error: null,
  period: "month",
};

/* -----------------------------------------------------
   SLICE
----------------------------------------------------- */

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setPeriod(state, action: PayloadAction<Period>) {
      state.period = action.payload;
    },
    resetDashboard(state) {
      state.data = null;
      state.loading = true;
      state.error = null;
      state.period = "month";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.data = action.payload;
        state.loading = false;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load dashboard";
      });
  },
});

/* -----------------------------------------------------
   EXPORTS
----------------------------------------------------- */

export const { setPeriod, resetDashboard } = dashboardSlice.actions;

export default dashboardSlice.reducer;
