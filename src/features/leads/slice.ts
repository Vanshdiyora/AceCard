import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  PaginationMeta,
  LeadsApiResponse,
  LeadNote,
  TimelineItem,
  Meeting,
  LeadStage,
  SortBy,
  SortOrder
} from "./types";
import { LeadsService } from "./services/leads.service";
import { formatStage } from "../../common/components/formatStage";

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
  timeline: Record<number, TimelineItem[]>;
  meetings: Record<number, Meeting[]>;

  // 👇 ADD THIS
  transferLoading: boolean;
}

const initialState: LeadsState = {
  leads: [],
  meta: null,
  notes: {},
  loading: false,
  error: null,
  timeline: {},
  meetings: {},
  transferLoading: false,
};

/* -----------------------------------------------------
   THUNKS
----------------------------------------------------- */

export const fetchLeads = createAsyncThunk<
  LeadsApiResponse,
  {
    page?: number;
    pageSize?: number;
    team_member_id?: number;
    memberId?: number;
    search?: string;
    stage?: LeadStage;

    // 👇 ADD
    sort_by?: SortBy;
    sort_order?: SortOrder;
  },
  { rejectValue: string }
>(
  "leads/fetch",
  async (
    {
      page = 1,
      pageSize = 10,
      memberId,
      team_member_id,
      search,
      stage,

      // 👇 ADD
      sort_by,
      sort_order,
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await LeadsService.getLeads(
        page,
        pageSize,
        team_member_id,
        memberId,
        search,
        stage,
        sort_by,
        sort_order
      );

      return {
        data: Array.isArray(res.data) ? res.data : [],
        meta: res.meta,
      };
    } catch (err) {
      return rejectWithValue(extractApiError(err, "Failed to load leads"));
    }
  }
);

export const transferLead = createAsyncThunk<
  Lead,
  { id: number; to_rep_id: number },
  { rejectValue: string }
>("leads/transfer", async ({ id, to_rep_id }, { rejectWithValue }) => {
  try {
    return await LeadsService.transferLead(id, to_rep_id);
  } catch (err) {
    return rejectWithValue(
      extractApiError(err, "Failed to transfer lead")
    );
  }
});

export const fetchLeadMeetings = createAsyncThunk<
  { leadId: number; meetings: Meeting[] },
  number,
  { rejectValue: string }
>("leads/fetchMeetings", async (leadId, { rejectWithValue }) => {
  try {
    const meetings = await LeadsService.getMeetings(leadId);
    return { leadId, meetings };
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to load meetings"));
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

export const fetchLeadTimeline = createAsyncThunk<
  { leadId: number; timeline: TimelineItem[] },
  number,
  { rejectValue: string }
>("leads/fetchTimeline", async (leadId, { rejectWithValue }) => {
  try {
    const raw = await LeadsService.getTimeline(leadId);

    const filtered = raw.filter((e: any) => {
      // ❌ remove activity note wrapper
      if (e.type === "note" && e.data?.metadata?.note_id) return false;

      // ❌ remove system created duplicate
      if (e.type === "created" && e.data?.actor === "System") return false;

      if (e.type === "meeting" && !e.data.title) return false;
      return true;
    });

    const normalized: TimelineItem[] = filtered.map((e: any) => {
      switch (e.type) {
        case "note":
          return {
            id: e.id,
            type: "note",
            timestamp: e.timestamp,
            title: "Note Added",
            description: e.data?.body ?? "",
            actor: e.data?.author_name,
          };

      case "meeting":
  return {
    id: e.id,
    type: "meeting",
    timestamp: e.timestamp,
    scheduled_at: e.data?.scheduled_at,
    title: `Meeting: ${e.data?.title}`,
    description: `${e.data?.location} • ${e.data?.duration_min} min`,
    actor: e.data?.created_by_name, // ✅ show real name
  };
        case "created":
          return {
            id: e.id,
            type: "created",
            timestamp: e.timestamp,
            title: "Lead Created",
            description: `Source: ${e.data?.metadata?.source ?? "manual"}`,
            actor: e.data?.actor_id ? `User #${e.data.actor_id}` : undefined,
          };

        case "stage_change":
          return {
            id: e.id,
            type: "stage_change",
            timestamp: e.timestamp,
            title: "Stage Updated",
            description: `${formatStage(e.data?.metadata?.from)} → ${formatStage(e.data?.metadata?.to)}`,
            actor: e.data?.actor_id ? `User #${e.data.actor_id}` : undefined,
          };

      case "meeting_status_update":
  return {
    id: e.id,
    type: "meeting_status_update",
    timestamp: e.timestamp,
    title: "Meeting Status Updated",
    description: `Meeting marked as ${e.data?.metadata?.status}`,
    actor: e.data?.actor_name ?? (e.data?.actor_id ? `User #${e.data.actor_id}` : undefined),
  };
        case "assignment_change":
          return {
            id: e.id,
            type: "assignment_change",
            timestamp: e.timestamp,
            title: "Assignment Updated",
            description: `Assigned from ${e.data?.metadata?.from ?? "none"} to ${e.data?.metadata?.to ?? "unassigned"
              }`,
            actor: e.data?.actor_id ? `User #${e.data.actor_id}` : undefined,
          };

        default:
          return {
            id: e.id,
            type: "activity",
            timestamp: e.timestamp,
            title: "Activity",
            description: "Activity occurred",
          };
      }
    });

    return { leadId, timeline: normalized };
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to load timeline"));
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
      .addCase(transferLead.pending, (state) => {
        state.transferLoading = true;
        state.error = null;
      })

      .addCase(transferLead.fulfilled, (state, action) => {
        state.transferLoading = false;

        const index = state.leads.findIndex(
          (l) => l.id === action.payload.id
        );

        if (index !== -1) {
          state.leads[index] = action.payload;
        }
      })

      .addCase(transferLead.rejected, (state, action) => {
        state.transferLoading = false;
        state.error = action.payload ?? "Failed to transfer lead";
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
      .addCase(fetchLeadTimeline.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeadTimeline.fulfilled, (state, action) => {
        state.loading = false;
        state.timeline[action.payload.leadId] = action.payload.timeline;
      })
      .addCase(fetchLeadTimeline.rejected, (state) => {
        state.loading = false;
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
      })
      .addCase(fetchLeadMeetings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLeadMeetings.fulfilled, (state, action) => {
        state.loading = false;
        state.meetings[action.payload.leadId] = action.payload.meetings;
      })
      .addCase(fetchLeadMeetings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to load meetings";
      });

  },
});

export default leadsSlice.reducer;
