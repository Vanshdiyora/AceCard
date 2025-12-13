import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { teamService } from "./services/teams.service";
import type {
  TeamMember,
  CreateTeamMemberDTO,
  UpdateTeamMemberDTO,
  UpdatePermissionsDTO,
} from "./types";

interface TeamState {
  members: TeamMember[];
  loading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  members: [],
  loading: false,
  error: null,
};

// Fetch Team
export const fetchTeam = createAsyncThunk("team/fetch", async () => {
  const data = await teamService.getTeam();
  return data.map((m) => ({
    ...m,
    leads: 0,
    pipeline: "$0",
    conversion: "0%",
    lastActive: "Active now",
  }));
});

// Create Member
export const createMember = createAsyncThunk(
  "team/create",
  async (body: CreateTeamMemberDTO) => {
    return await teamService.createMember(body);
  }
);

// Update Member
export const updateMember = createAsyncThunk(
  "team/update",
  async ({ id, data }: { id: number; data: UpdateTeamMemberDTO }) => {
    return await teamService.updateMember(id, data);
  }
);

// Update Permissions
export const updatePermissions = createAsyncThunk(
  "team/permissions",
  async ({ id, data }: { id: number; data: UpdatePermissionsDTO }) => {
    return await teamService.updatePermissions(id, data);
  }
);

// Suspend Member
export const suspendMember = createAsyncThunk(
  "team/suspend",
  async (id: number) => {
    return await teamService.suspendMember(id);
  }
);

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ----- FETCH TEAM -----
      .addCase(fetchTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchTeam.rejected, (state) => {
        state.loading = false;
      })

      // ----- CREATE MEMBER -----
      .addCase(createMember.fulfilled, (state, action) => {
        state.members.push({
          ...action.payload,
          leads: 0,
          pipeline: "$0",
          conversion: "0%",
          lastActive: "Active now",
        });
      })

      // ----- UPDATE MEMBER -----
      .addCase(updateMember.fulfilled, (state, action) => {
        const index = state.members.findIndex(
          (m) => m.id === action.payload.id
        );
        if (index !== -1) {
          state.members[index] = {
            ...state.members[index],
            ...action.payload,
          };
        }
      })

      // ----- UPDATE PERMISSIONS -----
      .addCase(updatePermissions.fulfilled, (state, action) => {
        const index = state.members.findIndex(
          (m) => m.id === action.payload.id
        );
        if (index !== -1) {
          state.members[index].permissions = action.payload.permissions;
        }
      })

      // ----- SUSPEND MEMBER -----
      .addCase(suspendMember.fulfilled, (state, action) => {
        // Remove suspended user from list
        state.members = state.members.filter(
          (m) => m.id !== action.meta.arg
        );
      });
  },
});

export default teamSlice.reducer;
