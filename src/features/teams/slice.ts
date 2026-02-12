import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { teamService } from "./services/teams.service";
import type {
  TeamMember,
  TeamMeta,
  CreateTeamMemberDTO,
  UpdateTeamMemberDTO,
  UpdatePermissionsDTO,
} from "./types";

/* ======================================================
   NORMALIZER
====================================================== */

const normalizeMember = (m: any): TeamMember => ({
  ...m,

  website: m.website || m.profile_website || undefined,

  // 👇 ADD THIS BLOCK
  avatar:
    m.avatar ||
    m.profile?.avatar ||
    m.image,

  permissions: m.permissions ?? {},
  manager_id: m.assigned_manager?.id ?? m.manager_id ?? null,
  leads: m.total_leads ?? m.leads ?? 0,
  pipeline: m.total_deal_amount
    ? `$${m.total_deal_amount}`
    : m.pipeline ?? "$0",
  conversion: m.conversion ?? "0%",
  lastActive: m.lastActive ?? "Recently",
});

/* ======================================================
   STATE
====================================================== */

interface TeamState {
  members: TeamMember[];      // ✅ combined (keep this)
  managers: TeamMember[];     // ✅ new
  salesReps: TeamMember[];    // ✅ new
  meta: {
    members?: TeamMeta;
    managers?: TeamMeta;
    salesReps?: TeamMeta;
  };
  analytics: any | null;   // 👈 ADD
  analyticsLoading: boolean; // 👈 ADD

  loading: boolean;
  error?: string;
}

const initialState: TeamState = {
  members: [],
  managers: [],
  salesReps: [],
  meta: {},
  analytics: null,
  analyticsLoading: false,
  loading: false,
  error: undefined,
};


/* ======================================================
   HELPERS
====================================================== */

const extractApiError = (err: any, fallback: string) =>
  err?.response?.data?.error ||
  err?.response?.data?.message ||
  err?.message ||
  fallback;

/* ======================================================
   THUNKS
====================================================== */
export type FetchTeamParams = {
  page?: number;
  page_size?: number;
  search?: string;
  role?: "manager" | "sales_rep";
  status?: "active" | "suspended";
  sort_by?: "total_leads" | "total_deal_amount" | "meeting_booked"; // 👈
  sort_order?: "asc" | "desc"; // 👈
  append?: boolean;
};

export const fetchMemberAnalytics = createAsyncThunk(
  "team/fetchMemberAnalytics",
  async (
    {
      id,
      pipeline_period,
    }: { id: number; pipeline_period: "day" | "week" | "month" | "year" },
    { rejectWithValue }
  ) => {
    try {
      const res = await teamService.getMemberAnalytics(
        id,
        pipeline_period
      );
      return res;
    } catch (err: any) {
      return rejectWithValue(
        extractApiError(err, "Failed to load analytics")
      );
    }
  }
);

export const fetchTeam = createAsyncThunk(
  "team/fetch",
  async (params: FetchTeamParams | undefined, { rejectWithValue }) => {
    try {
      const res = await teamService.getTeam(params);
      const membersArray = Array.isArray(res.data) ? res.data : [];

      return {
        members: membersArray.map(normalizeMember),
        meta: res.meta,
        append: params?.append ?? false,
      };
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, "Failed to fetch team"));
    }
  }
);

export const fetchMemberById = createAsyncThunk(
  "team/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return normalizeMember(await teamService.getMemberById(id));
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, "Failed to fetch member"));
    }
  }
);

export const createMember = createAsyncThunk(
  "team/create",
  async (body: CreateTeamMemberDTO, { rejectWithValue }) => {
    try {
      return normalizeMember(await teamService.createMember(body));
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, "Failed to create member"));
    }
  }
);

/* 🔴 FIXED THUNK */
export const updateMember = createAsyncThunk(
  "team/update",
  async (
    { id, data }: { id: number; data: UpdateTeamMemberDTO },
    { rejectWithValue }
  ) => {
    try {
      await teamService.updateMember(id, data);

      // 👇 ALWAYS re-fetch full member
      const fresh = await teamService.getMemberById(id);
      return normalizeMember(fresh);
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, "Failed to update member"));
    }
  }
);


export const updatePermissions = createAsyncThunk(
  "team/permissions",
  async (
    { id, data }: { id: number; data: UpdatePermissionsDTO },
    { rejectWithValue }
  ) => {
    try {
      await teamService.updatePermissions(id, data);

      // Backend returns only status, so we return what we already know
      return { id, permissions: data };
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, "Failed to update permissions"));
    }
  }
);

export const transferLeads = createAsyncThunk(
  "team/transferLeads",
  async (
    payload: {
      from_rep_id: number;
      to_rep_id: number;
      lead_ids: number[];
    },
    { rejectWithValue }
  ) => {
    try {
      await teamService.transferLeads(payload);
      return payload;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Lead transfer failed"
      );
    }
  }
);

export const deleteMember = createAsyncThunk(
  "team/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await teamService.deleteMember(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(extractApiError(err, "Failed to delete member"));
    }
  }
);

/* ======================================================
   SLICE
====================================================== */

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeam.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.loading = false;

        const { role, append } = action.meta.arg || {};
        const incoming = action.payload.members;

        /* ---------- ROLE-SPECIFIC STORAGE ---------- */
        if (role === "manager") {
          const ids = new Set(state.managers.map(m => m.id));
          state.managers = append
            ? [...state.managers, ...incoming.filter(m => !ids.has(m.id))]
            : incoming;

          state.meta.managers = action.payload.meta;
        }

        if (role === "sales_rep") {
          const ids = new Set(state.salesReps.map(m => m.id));
          state.salesReps = append
            ? [...state.salesReps, ...incoming.filter(m => !ids.has(m.id))]
            : incoming;

          state.meta.salesReps = action.payload.meta;
        }

        /* ---------- COMBINED STORAGE (ONLY WHEN NO SEARCH) ---------- */
        if (!action.meta.arg?.search) {
          const ids = new Set(state.members.map(m => m.id));

          const newOnes = incoming.filter(m => !ids.has(m.id));
          state.members = append
            ? [...state.members, ...newOnes]
            : incoming;

          state.meta.members = action.payload.meta;
        }
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchMemberById.fulfilled, (state, action) => {
        const idx = state.members.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.members[idx] = action.payload;
        else state.members.push(action.payload);
      })

      .addCase(createMember.fulfilled, (state, action) => {
        state.members.unshift(action.payload);
      })

      .addCase(updateMember.fulfilled, (state, action) => {
        const idx = state.members.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) {
          state.members[idx] = normalizeMember({
            ...state.members[idx],
            ...action.payload,
          });
        }
      })
      .addCase(updatePermissions.fulfilled, (state, action) => {
        const idx = state.members.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) {
          state.members[idx].permissions = action.payload.permissions;
        }
      })


      .addCase(deleteMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m.id !== action.payload);
      })
      .addCase(fetchMemberAnalytics.pending, (state) => {
        state.analyticsLoading = true;
      })
      .addCase(fetchMemberAnalytics.fulfilled, (state, action) => {
        state.analyticsLoading = false;
        state.analytics = action.payload;
      })
      .addCase(fetchMemberAnalytics.rejected, (state) => {
        state.analyticsLoading = false;
      });

  },
});

export default teamSlice.reducer;
