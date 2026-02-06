import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type {
  PaymentsState,
  UpdateSubscriptionPayload,
  PaymentsQuery,
  VendorPayment,
} from "./types";
import {
  getPaymentsSummaryApi,
  updateVendorSubscriptionApi,
  getPaymentHistoryApi,
  archiveVendorApi,
} from "./services/paymentsApi";

/* ----------------------------- THUNKS ----------------------------- */

export const fetchPayments = createAsyncThunk(
  "payments/fetch",
  async (params: PaymentsQuery, { rejectWithValue }) => {
    try {
      return await getPaymentsSummaryApi(params);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch payments"
      );
    }
  }
);

export const updateSubscription = createAsyncThunk(
  "payments/update",
  async (payload: UpdateSubscriptionPayload, { rejectWithValue }) => {
    try {
      return await updateVendorSubscriptionApi(payload);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update subscription"
      );
    }
  }
);

export const fetchPaymentHistory = createAsyncThunk(
  "payments/history",
  async (vendorId: number, { rejectWithValue }) => {
    try {
      return await getPaymentHistoryApi(vendorId);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch history"
      );
    }
  }
);

export const archiveVendor = createAsyncThunk(
  "payments/archive",
  async (vendorId: number, { rejectWithValue }) => {
    try {
      return await archiveVendorApi(vendorId);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to archive vendor"
      );
    }
  }
);

/* ----------------------------- STATE ----------------------------- */

const initialState: PaymentsState = {
  list: [],
  history: [],
  loading: false,
  error: null,
  meta: null,
};

/* ----------------------------- HELPERS ----------------------------- */

const replacePayment = (
  list: VendorPayment[],
  updated: VendorPayment
) =>
  list.map((item) =>
    item.vendor_id === updated.vendor_id ? updated : item
  );

/* ----------------------------- SLICE ----------------------------- */

const paymentsSlice = createSlice({
  name: "payments",
  initialState,

 reducers: {
  updateSeatsLocal: (
    state,
    action: PayloadAction<{ vendor_id: number; seats: number }>
  ) => {
    const item = state.list.find(
      v => v.vendor_id === action.payload.vendor_id
    );

    if (item) {
      item.seats = action.payload.seats;
      item.payment_amount_total =
        item.seats * item.price_per_card;
    }
  },

  /* ✅ NEW: LOCAL PRICE UPDATE */
  updatePriceLocal: (
    state,
    action: PayloadAction<{ vendor_id: number; price_per_card: number }>
  ) => {
    const item = state.list.find(
      v => v.vendor_id === action.payload.vendor_id
    );

    if (item) {
      item.price_per_card = action.payload.price_per_card;
      item.payment_amount_total =
        item.seats * item.price_per_card;
    }
  },
},


  extraReducers: (builder) => {
    builder
      /* FETCH PAYMENTS */
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* PAYMENT HISTORY */
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.history = action.payload;
      })

      /* UPDATE SUBSCRIPTION (API RETURNS UPDATED OBJECT) */
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.list = replacePayment(state.list, action.payload);
      })

      /* ARCHIVE VENDOR (API RETURNS UPDATED OBJECT) */
      .addCase(archiveVendor.fulfilled, (state, action) => {
        state.list = replacePayment(state.list, action.payload);
      });
  },
});

export const {
  updateSeatsLocal,
  updatePriceLocal,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
