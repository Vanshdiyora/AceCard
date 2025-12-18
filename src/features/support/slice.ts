import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getVendorSupportTickets,
  createSupportTicket,
  replyToSupportTicket,
  getAllSupportTickets,
} from "./services/support.service";

/* ---------------- THUNKS ---------------- */

export const fetchTickets = createAsyncThunk(
  "support/fetch",
  async (vendorId: number, { rejectWithValue }) => {
    try {
      return await getVendorSupportTickets(vendorId);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to fetch tickets");
    }
  }
);

export const addTicket = createAsyncThunk(
  "support/add",
  async (payload: any, { rejectWithValue }) => {
    try {
      return await createSupportTicket(payload);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to create ticket");
    }
  }
);

export const replyTicket = createAsyncThunk(
  "support/reply",
  async (
    {
      ticketId,
      message,
      status,
    }: { ticketId: number; message: string; status: string },
    { rejectWithValue }
  ) => {
    try {
      return await replyToSupportTicket(ticketId, { message, status });
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to reply");
    }
  }
);

export const fetchAllTickets = createAsyncThunk(
  "support/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await getAllSupportTickets();
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to fetch all tickets");
    }
  }
);

/* ---------------- STATE ---------------- */

interface SupportState {
  tickets: any[];
  loading: boolean;
  error?: string;
}

const initialState: SupportState = {
  tickets: [],
  loading: false,
  error: undefined,
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
        state.tickets = action.payload?.data ?? action.payload ?? [];
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.tickets = [];
      })

      /* -------- ADD TICKET -------- */
      .addCase(addTicket.fulfilled, (state, action) => {
        const ticket = action.payload?.data ?? action.payload;
        if (ticket) state.tickets.unshift(ticket);
      })

      /* -------- REPLY TICKET -------- */
      .addCase(replyTicket.fulfilled, (state, action) => {
        const reply = action.payload?.data ?? action.payload;
        const ticket = state.tickets.find((t) => t.id === reply.ticket_id);

        if (ticket) {
          ticket.replies ??= [];
          ticket.replies.push(reply);
          if (reply.status) ticket.status = reply.status;
        }
      })

      /* -------- FETCH ALL TICKETS (ADMIN) -------- */
      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload?.data ?? action.payload ?? [];
      })
      .addCase(fetchAllTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.tickets = [];
      });
  },
});

export default supportSlice.reducer;
