import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import type {
  PaymentsState,
  UpdateSubscriptionPayload,
  PaymentsQuery,
  VendorPayment,
  MarkUnpaidPayload,
} from "./types";

import {
  getPaymentsSummaryApi,
  updateVendorSubscriptionApi,
  getPaymentHistoryApi,
  archiveVendorApi,
  markVendorUnpaidApi,
} from "./services/paymentsApi";

/* ----------------------------- THUNKS ----------------------------- */

/* FETCH PAYMENTS (PAGINATED + SORT + FILTER) */
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

/* UPDATE SUBSCRIPTION */
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

/* PAYMENT HISTORY */
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

/* MARK VENDOR AS UNPAID */
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
    /* LOCAL SEATS UPDATE */
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

    /* LOCAL PRICE UPDATE */
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

    /* LOCAL UNPAID (OPTIMISTIC UI) */
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

        const { data, meta } = action.payload;

        // 👇 append instead of replace
        if (meta.page === 1) {
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

      /* UPDATE SUBSCRIPTION */
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.list = replacePayment(state.list, action.payload);
      })

      /* ARCHIVE VENDOR */
      .addCase(archiveVendor.fulfilled, (state, action) => {
        state.list = replacePayment(state.list, action.payload);
      })

      /* MARK UNPAID */
      .addCase(markVendorUnpaid.fulfilled, (state, action) => {
        state.list = replacePayment(state.list, action.payload);
      });
  },
});

/* ----------------------------- EXPORTS ----------------------------- */

export const {
  updateSeatsLocal,
  updatePriceLocal,
  markUnpaidLocal,
} = paymentsSlice.actions;

export default paymentsSlice.reducer;
