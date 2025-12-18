import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Lead, CreateLeadDto, UpdateLeadDto } from "./types";
import { LeadsService } from "./services/leads.service";

interface LeadsState {
  leads: Lead[];
  loading: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  leads: [],
  loading: false,
  error: null,
};

/* -----------------------------------------------------
   ASYNC THUNKS
----------------------------------------------------- */

// GET /vendor/leads
export const fetchLeads = createAsyncThunk("leads/fetch", async () => {
  const data = await LeadsService.getLeads();
  return data;
});

// POST /vendor/leads
export const createLead = createAsyncThunk(
  "leads/create",
  async (payload: CreateLeadDto) => {
    const data = await LeadsService.createLead(payload);
    return data;
  }
);

// PUT /vendor/leads/:id
export const updateLead = createAsyncThunk(
  "leads/update",
  async ({ id, data }: { id: number; data: UpdateLeadDto }) => {
    const updated = await LeadsService.updateLead(id, data);
    return updated;
  }
);

// POST /vendor/leads/:id/archive
export const archiveLead = createAsyncThunk(
  "leads/archive",
  async (id: number) => {
    await LeadsService.archiveLead(id);
    return id; // return the archived ID so reducer can remove it
  }
);

export const addLeadNote = createAsyncThunk(
  "leads/addNote",
  async ({ id, note }: { id: number; note: string }) => {
    return LeadsService.addNote(id, note);
  }
);


/* -----------------------------------------------------
   SLICE
----------------------------------------------------- */

const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ----- FETCH LEADS ----- */
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = Array.isArray(action.payload)
          ? action.payload
          : [];
      })

      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load leads";
      })

      /* ----- CREATE LEAD ----- */
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload); // add to top
      })

      /* ----- UPDATE LEAD ----- */
      .addCase(updateLead.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.leads.findIndex((l) => l.id === updated.id);
        if (index !== -1) {
          state.leads[index] = updated;
        }
      })

      /* ----- ARCHIVE LEAD ----- */
      .addCase(archiveLead.fulfilled, (state, action) => {
        const id = action.payload;
        state.leads = state.leads.filter((l) => l.id !== id);
      });
  },
});

export default leadsSlice.reducer;
