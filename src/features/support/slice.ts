import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getVendorSupportTickets,
  createSupportTicket,
  replyToSupportTicket,
  getAllSupportTickets,
  getAdminSupportStats
} from "./services/support.service";
import type { SupportState, SupportTicket } from "./types";
import { getVendorSupportStats } from "./services/support.service";

/* ---------------- THUNKS ---------------- */

export const fetchTickets = createAsyncThunk(
  "support/fetchVendor",
  async (vendorId: number, { rejectWithValue }) => {
    try {
      return await getVendorSupportTickets(vendorId);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to fetch tickets");
    }
  }
);

export const fetchAllTickets = createAsyncThunk(
  "support/fetchAll",
  async (
    params: { page: number; page_size: number; search?: string; status?: TicketStatus },
    { rejectWithValue }
  ) => {
    try {
      return await getAllSupportTickets(params);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to fetch all tickets");
    }
  }
);



export const addTicket = createAsyncThunk(
  "support/add",
  async (payload: Partial<SupportTicket>, { rejectWithValue }) => {
    try {
      return await createSupportTicket(payload);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to create ticket");
    }
  }
);

export const fetchSupportStats = createAsyncThunk(
  "support/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      return await getVendorSupportStats();
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to fetch stats");
    }
  }
);

type TicketStatus = "open" | "pending" | "closed";

export const replyTicket = createAsyncThunk(
  "support/reply",
  async (
    {
      ticketId,
      message,
      status,
    }: { ticketId: number; message: string; status: TicketStatus },
    { rejectWithValue }
  ) => {
    try {
      await replyToSupportTicket(ticketId, { message, status });

      return {
        id: Date.now(),
        ticket_id: ticketId,
        message,
        status, // now correctly typed
        created_at: new Date().toISOString(),
      };
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to reply");
    }
  }
);

export const fetchAdminSupportStats = createAsyncThunk(
  "support/fetchAdminStats",
  async (_, { rejectWithValue }) => {
    try {
      return await getAdminSupportStats();
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to fetch admin stats");
    }
  }
);


/* ---------------- STATE ---------------- */
const initialState: SupportState = {
  tickets: [],
  meta: null,
  stats: null,
  loading: false,
  statsLoading: false,
  error: undefined,
  statsAdmin: null,
  statsAdminLoading: false,

};


/* ---------------- SLICE ---------------- */

const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* -------- FETCH VENDOR TICKETS -------- */
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.data ?? [];
        state.meta = action.payload.meta ?? null;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.tickets = [];
        state.meta = null;
      })

      /* -------- FETCH ALL TICKETS (ADMIN) -------- */
      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.data ?? [];
        state.meta = action.payload.meta ?? null;
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.tickets = [];
        state.meta = null;
      })

      /* -------- ADD TICKET -------- */
      .addCase(addTicket.fulfilled, (state, action) => {
        if (!action.payload) return;

        state.tickets.unshift({
          ...action.payload,
          replies: [],
        });
      })

      /* -------- REPLY TICKET -------- */
      .addCase(replyTicket.fulfilled, (state, action) => {
        const reply = action.payload;
        if (!reply) return;

        const ticket = state.tickets.find((t) => t.id === reply.ticket_id);
        if (!ticket) return;

        ticket.replies ??= [];
        ticket.replies.push(reply);

        if (reply.status) ticket.status = reply.status;
        ticket.updated_at = new Date().toISOString();
      })

      .addCase(fetchSupportStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchSupportStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchSupportStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdminSupportStats.pending, (state) => {
  state.statsAdminLoading = true;
})
.addCase(fetchAdminSupportStats.fulfilled, (state, action) => {
  state.statsAdminLoading = false;
  state.statsAdmin = action.payload;
})
.addCase(fetchAdminSupportStats.rejected, (state, action) => {
  state.statsAdminLoading = false;
  state.error = action.payload as string;
});

  },
});

export default supportSlice.reducer;
