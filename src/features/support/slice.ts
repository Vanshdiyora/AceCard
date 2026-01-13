import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getVendorSupportTickets,
  createSupportTicket,
  replyToSupportTicket,
  getAllSupportTickets,
} from "./services/support.service";
import type { SupportState, SupportTicket } from "./types";

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
    params: { page: number; page_size: number; search?: string },
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

/* ---------------- STATE ---------------- */

const initialState: SupportState = {
  tickets: [],
  meta: null,
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
});

  },
});

export default supportSlice.reducer;
