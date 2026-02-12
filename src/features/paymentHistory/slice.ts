import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  PaymentsState,
  UpdateSubscriptionPayload,
  PaymentsQuery,
  MarkUnpaidPayload,
} from "./types";

import {
  getPaymentsSummaryApi,
  updateVendorSubscriptionApi,
  getPaymentHistoryApi,
  archiveVendorApi,
  markVendorUnpaidApi,
} from "./services/paymentsApi";

/* ============================= THUNKS ============================= */

/* FETCH PAYMENTS */
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

/* UPDATE SUBSCRIPTION
   🔑 API returns only { message }, so we return payload */
export const updateSubscription = createAsyncThunk(
  "payments/update",
  async (payload: UpdateSubscriptionPayload, { rejectWithValue }) => {
    try {
      await updateVendorSubscriptionApi(payload);
      return payload; // ✅ return payload for local update
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update subscription"
      );
    }
  }
);

/* PAYMENT HISTORY */
export const fetchPaymentHistory = createAsyncThunk(
  "payments/history",
  async (vendorId: number, { rejectWithValue }) => {
    try {
      const response = await getPaymentHistoryApi(vendorId);

      return {
        data: Array.isArray(response?.data) ? response.data : [],
        meta: response?.meta ?? null,
      };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch history"
      );
    }
  }
);

/* ARCHIVE VENDOR */
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

/* MARK UNPAID */
export const markVendorUnpaid = createAsyncThunk(
  "payments/mark-unpaid",
  async (payload: MarkUnpaidPayload, { rejectWithValue }) => {
    try {
      return await markVendorUnpaidApi(payload);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to mark vendor unpaid"
      );
    }
  }
);

/* ============================= STATE ============================= */

const initialState: PaymentsState = {
  list: [],
  history: [],
  loading: false,
  error: null,
  meta: null,
};

/* ============================= SLICE ============================= */

const paymentsSlice = createSlice({
  name: "payments",
  initialState,

  reducers: {
    /* LOCAL SEATS UPDATE (optimistic) */
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

    /* LOCAL PRICE UPDATE (optimistic) */
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

    /* LOCAL UNPAID (optimistic) */
    markUnpaidLocal: (
      state,
      action: PayloadAction<{ vendor_id: number }>
    ) => {
      const item = state.list.find(
        v => v.vendor_id === action.payload.vendor_id
      );

      if (item) {
        item.status = "NOT PAID";
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
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;

        const data = action.payload.data; // already normalized
        const meta = action.payload.meta;

        if (!meta || meta.page === 1) {
          state.history = data;
        } else {
          state.history.push(...data);
        }

        state.meta = meta;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* UPDATE SUBSCRIPTION (LOCAL APPLY) */
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const item = state.list.find(
          v => v.vendor_id === action.payload.vendor_id
        );

        if (item) {
          item.seats = action.payload.seats;
          item.price_per_card = action.payload.price_per_card;
          item.payment_amount_total =
            action.payload.payment_amount_total;

          // ✅ mark paid as part of flow
          item.status = "PAID";
        }
      })

      /* ARCHIVE VENDOR (API RETURNS UPDATED OBJECT) */
      .addCase(archiveVendor.fulfilled, (state, action) => {
        state.list = state.list.map(v =>
          v.vendor_id === action.payload.vendor_id
            ? action.payload
            : v
        );
      })

      /* MARK UNPAID (API RETURNS UPDATED OBJECT) */
      .addCase(markVendorUnpaid.fulfilled, (state, action) => {
        state.list = state.list.map(v =>
          v.vendor_id === action.payload.vendor_id
            ? action.payload
            : v
        );
      });
  },
});

/* ============================= EXPORTS ============================= */

export const {
  updateSeatsLocal,
  updatePriceLocal,
  markUnpaidLocal,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
