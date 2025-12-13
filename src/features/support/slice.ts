import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getVendorSupportTickets, createSupportTicket } from "./services/support.service";

// FETCH vendor tickets
export const fetchTickets = createAsyncThunk(
  "support/fetch",
  async (vendorId: number) => {
    return await getVendorSupportTickets(vendorId);
  }
);

// ADD ticket
export const addTicket = createAsyncThunk(
  "support/add",
  async (payload: any) => {
    return await createSupportTicket(payload);
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
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload.data ?? action.payload;
      })
      .addCase(addTicket.fulfilled, (state, action) => {
        state.tickets.unshift(action.payload.data ?? action.payload);
      });
  },
});

export default supportSlice.reducer;
