import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getVendorSupportTickets,
  createSupportTicket,
  replyToSupportTicket,
  getAllSupportTickets
} from "./services/support.service";

// ---------------------------
// FETCH vendor tickets
// ---------------------------
export const fetchTickets = createAsyncThunk(
  "support/fetch",
  async (vendorId: number) => {
    return await getVendorSupportTickets(vendorId);
  }
);

// ---------------------------
// CREATE a new ticket
// ---------------------------
export const addTicket = createAsyncThunk(
  "support/add",
  async (payload: any) => {
    return await createSupportTicket(payload);
  }
);

// ---------------------------
// REPLY to a ticket
// ---------------------------
export const replyTicket = createAsyncThunk(
  "support/reply",
  async ({
    ticketId,
    message,
    status,
  }: {
    ticketId: number;
    message: string;
    status: string;
  }) => {
    return await replyToSupportTicket(ticketId, { message, status });
  }
);


export const fetchAllTickets = createAsyncThunk(
  "support/fetchAll",
  async () => {
    return await getAllSupportTickets();
  }
);

interface SupportState {
  tickets: any[];
  loading: boolean;
}

const initialState: SupportState = {
  tickets: [],
  loading: false,
};

const supportSlice = createSlice({
  name: "support",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ---------------------------
      // FETCH TICKETS
      // ---------------------------
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.data ?? action.payload;
      })

      // ---------------------------
      // ADD NEW TICKET
      // ---------------------------
      .addCase(addTicket.fulfilled, (state, action) => {
        const ticket = action.payload.data ?? action.payload;
        state.tickets.unshift(ticket);
      })

      // ---------------------------
      // REPLY TO TICKET
      // ---------------------------
      .addCase(replyTicket.fulfilled, (state, action) => {
        const reply = action.payload.data ?? action.payload;

        const ticket = state.tickets.find((t) => t.id === reply.ticket_id);

        if (ticket) {
          if (!ticket.replies) ticket.replies = [];
          ticket.replies.push(reply);

          // Update ticket status on UI immediately
          if (reply.status) {
            ticket.status = reply.status;
          }
        }
      })

      .addCase(fetchAllTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.data ?? action.payload;
      })

  },
});

export default supportSlice.reducer;
