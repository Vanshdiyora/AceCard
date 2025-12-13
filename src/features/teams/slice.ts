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

export const createMember = createAsyncThunk(
  "team/create",
  async (body: CreateTeamMemberDTO) => {
    return await teamService.createMember(body);
  }
);

export const updateMember = createAsyncThunk(
  "team/update",
  async ({ id, data }: { id: number; data: UpdateTeamMemberDTO }) => {
    return await teamService.updateMember(id, data);
  }
);

export const updatePermissions = createAsyncThunk(
  "team/permissions",
  async ({ id, data }: { id: number; data: UpdatePermissionsDTO }) => {
    return await teamService.updatePermissions(id, data);
  }
);

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
      .addCase(fetchTeam.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
      })
      .addCase(fetchTeam.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default teamSlice.reducer;
