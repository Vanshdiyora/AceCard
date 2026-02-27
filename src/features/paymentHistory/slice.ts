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
  markVendorPaidApi,
  updateSeatsApi,
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

/* MARK PAID */
export const markVendorPaid = createAsyncThunk(
  "payments/mark-paid",
  async (paymentId: number, { rejectWithValue }) => {
    try {
      return await markVendorPaidApi(paymentId);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to mark paid"
      );
    }
  }
);

/* MARK UNPAID */
export const markVendorUnpaid = createAsyncThunk(
  "payments/mark-unpaid",
  async (
    payload: MarkUnpaidPayload,
    { rejectWithValue }
  ) => {
    try {
      const { payment_id } = payload;
      return await markVendorUnpaidApi(payment_id);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to mark unpaid"
      );
    }
  }
);

/* UPDATE SEATS */
export const updateSeats = createAsyncThunk(
  "payments/update-seats",
  async (
    { vendor_id, seats }: { vendor_id: number; seats: number },
    { rejectWithValue }
  ) => {
    try {
      return await updateSeatsApi(vendor_id, seats);
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update seats"
      );
    }
  }
);

/* UPDATE SUBSCRIPTION */
export const updateSubscription = createAsyncThunk(
  "payments/update-subscription",
  async (payload: UpdateSubscriptionPayload, { rejectWithValue }) => {
    try {
      await updateVendorSubscriptionApi(payload);
      return payload; // backend returns only message
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

/* ARCHIVE */
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

/* ============================= STATE ============================= */

const initialState: PaymentsState = {
  list: [],
  history: [],
  loading: false,
  error: null,
  listMeta: null,
historyMeta: null,
};

/* ============================= SLICE ============================= */

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

    markUnpaidLocal: (
      state,
      action: PayloadAction<{ payment_id: number }>
    ) => {
      const item = state.list.find(
        v => v.id === action.payload.payment_id
      );

      if (item) {
        item.status = "Not Paid";
      }
    },
  },

  extraReducers: (builder) => {
    builder

      /* ================= FETCH PAYMENTS ================= */
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;

        const { data, meta } = action.payload;

        state.list = (data || []).map((v: any) => ({
          id: v.id,
          vendor_id: v.vendor_id,
          vendor_name: v.vendor_name ?? "-",
          email: v.email ?? "-",

          seats: v.seats ?? 0,
          price_per_card: v.price_per_card ?? 0,
          payment_amount_total: v.payment_amount_total ?? v.amount ?? 0,

          days_left: v.days_left ?? 0,
          payment_terms: v.payment_terms ?? "",
          is_archived: v.is_archived ?? false,

          status:
            v.status === "Paid"
              ? "Paid"
              : v.status === "Pending"
                ? "Pending"
                : v.status === "Not Paid"
                  ? "Not Paid"
                  : "Not Paid",
        }));

        state.listMeta = meta ?? null;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= HISTORY ================= */
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.loading = false;

        const { data, meta } = action.payload;

        const normalizedData = data.map((p: any) => ({
          id: p.id,
          vendor_id: p.vendor_id,

          // ✅ include missing fields
          seats: p.seats ?? 0,
          subject: p.subject ?? "",
          price_per_card: p.price_per_card ?? 0,

          payment_amount_total: p.amount ?? 0,
          payment_terms: p.payment_terms ?? "",

          subscription_start_date: p.subscription_start_date ?? null,
          subscription_end_date: p.subscription_end_date ?? null,

          payment_date: p.payment_date ?? null,
          created_at: p.created_at,

          // normalize status casing
          status:
            p.status === "paid"
              ? "Paid"
              : p.status === "pending"
                ? "Pending"
                : "Not Paid",

          badge: p.badge ?? p.status?.toUpperCase() ?? "",
        }));

        if (!meta || meta.page === 1) {
          state.history = normalizedData;
        } else {
          state.history.push(...normalizedData);
        }

        state.historyMeta = meta ?? null;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= MARK PAID ================= */
      .addCase(markVendorPaid.pending, (state) => {
        state.loading = true;
      })
      .addCase(markVendorPaid.fulfilled, (state, action) => {
        state.loading = false;

        const paymentId = action.meta.arg; // the id you passed

        const item = state.list.find(v => v.id === paymentId);

        if (item) {
          item.status = "Paid";
        }
      })
      .addCase(markVendorPaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= MARK UNPAID ================= */
      .addCase(markVendorUnpaid.pending, (state) => {
        state.loading = true;
      })
      .addCase(markVendorUnpaid.fulfilled, (state, action) => {
        state.loading = false;

        const paymentId = action.meta.arg.payment_id;

        const item = state.list.find(v => v.id === paymentId);

        if (item) {
          item.status = "Not Paid";
        }
      })
      .addCase(markVendorUnpaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= UPDATE SEATS ================= */
      .addCase(updateSeats.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSeats.fulfilled, (state, action) => {
        state.loading = false;

        state.list = state.list.map(v =>
          v.vendor_id === action.payload.vendor_id
            ? action.payload
            : v
        );
      })
      .addCase(updateSeats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= UPDATE SUBSCRIPTION ================= */
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;

        const item = state.list.find(
          v => v.vendor_id === action.payload.vendor_id
        );

        if (item) {
          item.seats = action.payload.seats;
          item.price_per_card = action.payload.price_per_card;
          item.payment_terms = action.payload.payment_terms;

          item.payment_amount_total =
            action.payload.seats *
            action.payload.price_per_card;

          item.status = "Pending"; // safer default
        }
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= ARCHIVE ================= */
      .addCase(archiveVendor.pending, (state) => {
        state.loading = true;
      })
      .addCase(archiveVendor.fulfilled, (state, action) => {
        state.loading = false;

        state.list = state.list.map(v =>
          v.vendor_id === action.payload.vendor_id
            ? action.payload
            : v
        );
      })
      .addCase(archiveVendor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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