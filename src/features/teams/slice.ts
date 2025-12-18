import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { teamService } from "./services/teams.service";
import type {
  TeamMember,
  CreateTeamMemberDTO,
  UpdateTeamMemberDTO,
  UpdatePermissionsDTO,
} from "./types";

/* ------------------ STATE ------------------ */

interface TeamState {
  members: TeamMember[];
  loading: boolean;
  error?: string;
}

const initialState: TeamState = {
  members: [],
  loading: false,
  error: undefined,
};

/* ------------------ THUNKS ------------------ */

export const fetchTeam = createAsyncThunk(
  "team/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const data = await teamService.getTeam();
      return data.map((m) => ({
        ...m,
        leads: 0,
        pipeline: "$0",
        conversion: "0%",
        lastActive: "Recently",
      }));
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to fetch team");
    }
  }
);

export const createMember = createAsyncThunk(
  "team/create",
  async (body: CreateTeamMemberDTO, { rejectWithValue }) => {
    try {
      return await teamService.createMember(body);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to create member");
    }
  }
);

export const fetchMemberById = createAsyncThunk(
  "team/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await teamService.getMemberById(id);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to fetch member");
    }
  }
);

export const updateMember = createAsyncThunk(
  "team/update",
  async (
    { id, data }: { id: number; data: UpdateTeamMemberDTO },
    { rejectWithValue }
  ) => {
    try {
      return await teamService.updateMember(id, data);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to update member");
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
      return await teamService.updatePermissions(id, data);
    } catch (err: any) {
      return rejectWithValue(err?.message ?? "Failed to update permissions");
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
      return rejectWithValue(err?.message ?? "Failed to delete member");
    }
  }
);

/* ------------------ SLICE ------------------ */

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* -------- FETCH TEAM -------- */
      .addCase(fetchTeam.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchTeam.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* -------- CREATE MEMBER -------- */
      .addCase(createMember.fulfilled, (state, action) => {
        state.members.push({
          ...action.payload,
          leads: 0,
          pipeline: "$0",
          conversion: "0%",
          lastActive: "Just now",
        });
      })

      /* -------- FETCH MEMBER BY ID -------- */
      .addCase(fetchMemberById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMemberById.fulfilled, (state, action) => {
        state.loading = false;

        const idx = state.members.findIndex(
          (m) => m.id === action.payload.id
        );

        if (idx !== -1) {
          state.members[idx] = {
            ...state.members[idx],
            ...action.payload,
          };
        } else {
          state.members.push({
            ...action.payload,
            leads: 0,
            pipeline: "$0",
            conversion: "0%",
            lastActive: "Recently",
          });
        }
      })
      .addCase(fetchMemberById.rejected, (state) => {
        state.loading = false;
      })

      /* -------- UPDATE MEMBER -------- */
      .addCase(updateMember.fulfilled, (state, action) => {
        const idx = state.members.findIndex(
          (m) => m.id === action.payload.id
        );
        if (idx !== -1) {
          state.members[idx] = {
            ...state.members[idx],
            ...action.payload,
          };
        }
      })

      /* -------- UPDATE PERMISSIONS -------- */
      .addCase(updatePermissions.fulfilled, (state, action) => {
        const idx = state.members.findIndex(
          (m) => m.id === action.payload.id
        );
        if (idx !== -1) {
          state.members[idx].permissions = action.payload.permissions;
        }
      })

      /* -------- DELETE MEMBER -------- */
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.members = state.members.filter(
          (m) => m.id !== action.payload
        );
      });
  },
});

export default teamSlice.reducer;
