import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  PaginationMeta,
  LeadsApiResponse,
  LeadNote,
} from "./types";
import { LeadsService } from "./services/leads.service";

/* -----------------------------------------------------
   ERROR HANDLER
----------------------------------------------------- */

type ApiError = { response?: { data?: { error?: string; message?: string } } };

const extractApiError = (err: unknown, fallback: string): string =>
  (err as ApiError)?.response?.data?.error ||
  (err as ApiError)?.response?.data?.message ||
  (err as Error)?.message ||
  fallback;

/* -----------------------------------------------------
   STATE
----------------------------------------------------- */

interface LeadsState {
  leads: Lead[];
  meta: PaginationMeta | null;
  notes: Record<number, LeadNote[]>;
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
  { page?: number; pageSize?: number; memberId?: number },
  { rejectValue: string }
>("leads/fetch", async ({ page = 1, pageSize = 10, memberId }, { rejectWithValue }) => {
  try {
    const res = await LeadsService.getLeads(page, pageSize, memberId);
    return {
      data: Array.isArray(res.data) ? res.data : [],
      meta: res.meta,
    };
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to load leads"));
  }
});



export const createLead = createAsyncThunk<
  Lead,
  CreateLeadDto,
  { rejectValue: string }
>("leads/create", async (payload, { rejectWithValue }) => {
  try {
    return await LeadsService.createLead(payload);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to create lead"));
  }
});

export const updateLead = createAsyncThunk<
  Lead,
  { id: number; data: UpdateLeadDto },
  { rejectValue: string }
>("leads/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await LeadsService.updateLead(id, data);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to update lead"));
  }
});

export const archiveLead = createAsyncThunk<
  number,
  number,
  { rejectValue: string }
>("leads/archive", async (id, { rejectWithValue }) => {
  try {
    await LeadsService.archiveLead(id);
    return id;
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to archive lead"));
  }
});

export const fetchLeadNotes = createAsyncThunk<
  { leadId: number; notes: LeadNote[] },
  number,
  { rejectValue: string }
>("leads/fetchNotes", async (leadId, { rejectWithValue }) => {
  try {
    const notes = await LeadsService.getNotes(leadId);
    return { leadId, notes };
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to load lead notes"));
  }
});

export const fetchLeadById = createAsyncThunk<
  Lead,
  number,
  { rejectValue: string }
>("leads/fetchById", async (id, { rejectWithValue }) => {
  try {
    const res = await LeadsService.getLeadById(id);
    return res.data;
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to fetch lead"));
  }
});

/* -----------------------------------------------------
   SLICE
----------------------------------------------------- */

const leadsSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
        state.error = action.payload ?? "Failed to load leads";
      })

      .addCase(createLead.fulfilled, (state, action) => {
        state.leads.unshift(action.payload);
      })

      .addCase(updateLead.fulfilled, (state, action) => {
        const i = state.leads.findIndex((l) => l.id === action.payload.id);
        if (i !== -1) state.leads[i] = action.payload;
      })

      .addCase(fetchLeadById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadById.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.leads.findIndex((l) => l.id === action.payload.id);
        if (idx !== -1) state.leads[idx] = action.payload;
        else state.leads.push(action.payload);
      })
      .addCase(fetchLeadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch lead";
      })

      .addCase(archiveLead.fulfilled, (state, action) => {
        state.leads = state.leads.filter((l) => l.id !== action.payload);
      })
      .addCase(archiveLead.rejected, (state, action) => {
        state.error = action.payload ?? "Failed to archive lead";
      })

      .addCase(fetchLeadNotes.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeadNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes[action.payload.leadId] = action.payload.notes;
      })
      .addCase(fetchLeadNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load notes";
      });
  },
});

export default leadsSlice.reducer;
