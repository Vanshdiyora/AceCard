// src/features/subscription/slice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { teamService, type SubscriptionResponse } from "./services/teams.service";

interface SubscriptionState {
  data: SubscriptionResponse | null;
  loading: boolean;
  error?: string;
}

const initialState: SubscriptionState = {
  data: null,
  loading: false,
};

export const fetchSubscription = createAsyncThunk(
  "subscription/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await teamService.getSubscription();
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch subscription"
      );
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default subscriptionSlice.reducer;
