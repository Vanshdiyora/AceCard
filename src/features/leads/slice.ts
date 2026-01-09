import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  PaginationMeta,
  LeadsApiResponse,
  LeadNote
} from "./types";
import { LeadsService } from "./services/leads.service";

/* -----------------------------------------------------
   STATE
----------------------------------------------------- */

interface LeadsState {
  leads: Lead[];
  meta: PaginationMeta | null;
  notes: Record<number, LeadNote[]>; // keyed by leadId
  loading: boolean;
  error: string | null;
}

const initialState: LeadsState = {
  leads: [],
  meta: null,
  notes: {},
  loading: false,
  error: null,
};
/* -----------------------------------------------------
   THUNKS
----------------------------------------------------- */

export const fetchLeads = createAsyncThunk<
  LeadsApiResponse,
  { page?: number; pageSize?: number }
>("leads/fetch", async ({ page = 1, pageSize = 10 }) => {
  return await LeadsService.getLeads(page, pageSize);
});


export const createLead = createAsyncThunk<Lead, CreateLeadDto>(
  "leads/create",
  async (payload) => LeadsService.createLead(payload)
);

export const updateLead = createAsyncThunk<
  Lead,
  { id: number; data: UpdateLeadDto }
>("leads/update", async ({ id, data }) =>
  LeadsService.updateLead(id, data)
);

export const archiveLead = createAsyncThunk<number, number>(
  "leads/archive",
  async (id) => {
    await LeadsService.archiveLead(id);
    return id;
  }
);

export const fetchLeadNotes = createAsyncThunk<
  { leadId: number; notes: LeadNote[] },
  number
>("leads/fetchNotes", async (leadId) => {
  const notes = await LeadsService.getNotes(leadId);
  return { leadId, notes };
});

export const fetchLeadById = createAsyncThunk(
  "leads/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await LeadsService.getLeadById(id);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to fetch lead");
    }
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

      /* FETCH */
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to load leads";
      })

      /* CREATE */
      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })

      /* UPDATE */
      .addCase(updateLead.fulfilled, (state, action) => {
        const i = state.leads.findIndex((l) => l.id === action.payload.id);
        if (i !== -1) state.leads[i] = action.payload;
      })

      .addCase(fetchLeadById.pending, (state) => {
  state.loading = true;
})

.addCase(fetchLeadById.fulfilled, (state, action) => {
  state.loading = false;

  const idx = state.leads.findIndex(l => l.id === action.payload.id);
  if (idx !== -1) {
    state.leads[idx] = action.payload;
  } else {
    state.leads.push(action.payload);
  }
})

.addCase(fetchLeadById.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload as string;
})


      /* ARCHIVE */
      .addCase(archiveLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter((l) => l.id !== action.payload);
      })
       .addCase(fetchLeadNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeadNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes[action.payload.leadId] = action.payload.notes;
      })
      .addCase(fetchLeadNotes.rejected, (state) => {
        state.loading = false;
      });

  },
});

export default leadsSlice.reducer;
