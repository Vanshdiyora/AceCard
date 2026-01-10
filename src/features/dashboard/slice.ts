import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getVendorMetrics } from "./services/dashboard.service";
import type { DashboardState } from "./types";

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

export const fetchDashboard = createAsyncThunk<
  any,
  void,
  { rejectValue: string }
>("dashboard/fetch", async (_, { rejectWithValue }) => {
  try {
    return await getVendorMetrics();
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to load dashboard"));
  }
});

/* -----------------------------------------------------
   INITIAL STATE
----------------------------------------------------- */

const initialState: DashboardState & { error: string | null } = {
  data: null,
  loading: true,
  error: null,
};

/* -----------------------------------------------------
   SLICE
----------------------------------------------------- */

export const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
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

export default dashboardSlice.reducer;
