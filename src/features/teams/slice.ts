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
  permissions: m.permissions ?? {},
  manager_id: m.assigned_manager?.id ?? m.manager_id ?? null,
  leads: m.total_leads ?? m.leads ?? 0,
  pipeline: m.total_deal_amount ? `$${m.total_deal_amount}` : m.pipeline ?? "$0",
  conversion: m.conversion ?? "0%",
  lastActive: m.lastActive ?? "Recently",
});


/* ======================================================
   STATE
====================================================== */

interface TeamState {
  members: TeamMember[];
  meta: TeamMeta | null;
  loading: boolean;
  error?: string;
}

const initialState: TeamState = {
  members: [],
  meta: null,
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
};

export const fetchTeam = createAsyncThunk(
  "team/fetch",
  async (params: FetchTeamParams | undefined, { rejectWithValue }) => {
    try {
      const res = await teamService.getTeam(params);
      const membersArray = Array.isArray(res.data) ? res.data : [];

      return {
        members: membersArray.map(normalizeMember),
        meta: res.meta,
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
      const res = await teamService.updateMember(id, data);

      // 👇 Safely detect { status: "updated" } response
      if (
        res &&
        typeof res === "object" &&
        "status" in res &&
        (res as any).status === "updated"
      ) {
        return { id, ...data };
      }

      return normalizeMember(res);
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
        state.members = action.payload.members;
        state.meta = action.payload.meta;
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

      /* 🔴 FIXED MERGE */
      .addCase(updateMember.fulfilled, (state, action) => {
        const idx = state.members.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) {
          state.members[idx] = {
            ...state.members[idx],
            ...action.payload,
          };
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
      });
  },
});

export default teamSlice.reducer;
