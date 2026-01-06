import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type {
  Campaign,
  CampaignState,
  CampaignListResponse,
} from "./types";
import { CampaignService } from "./services/campaign.service";

// -----------------------------
// THUNKS
// -----------------------------

export const fetchCampaigns = createAsyncThunk<
  CampaignListResponse
>("campaigns/fetchAll", async () => {
  return await CampaignService.getAll();
});

export const createCampaign = createAsyncThunk<
  Campaign,
  Partial<Campaign>
>("campaigns/create", async (data) => {
  return await CampaignService.create(data);
});

export const fetchCampaignsByTeamMember = createAsyncThunk<
  CampaignListResponse,
  { memberId?: number; page?: number; page_size?: number },
  { rejectValue: string }
>(
  "campaigns/fetchByTeamMember",
  async ({ memberId, page, page_size }, { rejectWithValue }) => {
    if (!memberId) {
      return rejectWithValue("Member ID is required to fetch campaigns");
    }

    const params: { page?: number; page_size?: number } = {};
    if (page !== undefined) params.page = page;
    if (page_size !== undefined) params.page_size = page_size;

    try {
      return await CampaignService.getByTeamMember(memberId, params);
    } catch (err: any) {
      return rejectWithValue(
        err?.message ?? "Failed to fetch campaigns for team member"
      );
    }
  }
);


export const fetchCampaignById = createAsyncThunk<
  Campaign,
  number
>("campaigns/fetchById", async (id) => {
  return await CampaignService.getById(id);
});

export const updateCampaign = createAsyncThunk<
  Campaign,
  { id: number; data: Partial<Campaign> }
>("campaigns/update", async ({ id, data }) => {
  return await CampaignService.update(id, data);
});

export const archiveCampaign = createAsyncThunk<
  Campaign,
  number
>("campaigns/archive", async (id) => {
  return await CampaignService.archive(id);
});

// -----------------------------
// INITIAL STATE
// -----------------------------

const initialState: CampaignState = {
  items: [],
  meta: null,
  loading: false,
  error: null,
};

// -----------------------------
// SLICE
// -----------------------------

const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    // -----------------------------
    // FETCH CAMPAIGNS
    // -----------------------------
    builder.addCase(fetchCampaigns.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchCampaigns.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.data;
      state.meta = action.payload.meta;
    });

    builder.addCase(fetchCampaigns.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.error.message ?? "Failed to fetch campaigns";
    });

    // -----------------------------
    // CREATE CAMPAIGN
    // -----------------------------
    builder.addCase(createCampaign.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
    });

    // -----------------------------
    // UPDATE CAMPAIGN
    // -----------------------------
    builder.addCase(updateCampaign.fulfilled, (state, action) => {
      const idx = state.items.findIndex(
        (c) => c.id === action.payload.id
      );
      if (idx !== -1) state.items[idx] = action.payload;
    });

    // -----------------------------
    // FETCH CAMPAIGNS BY TEAM MEMBER
    // -----------------------------
    builder.addCase(fetchCampaignsByTeamMember.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchCampaignsByTeamMember.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.data;
      state.meta = action.payload.meta;
    });

    builder.addCase(fetchCampaignsByTeamMember.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.error.message ?? "Failed to fetch member campaigns";
    });

    // -----------------------------
    // ARCHIVE CAMPAIGN
    // -----------------------------
    builder.addCase(archiveCampaign.fulfilled, (state, action) => {
      const idx = state.items.findIndex(
        (c) => c.id === action.payload.id
      );
      if (idx !== -1) state.items[idx] = action.payload;
    });

    // -----------------------------
    // FETCH CAMPAIGN BY ID
    // -----------------------------
    builder.addCase(fetchCampaignById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchCampaignById.fulfilled, (state, action) => {
      state.loading = false;

      const idx = state.items.findIndex(
        (c) => c.id === action.payload.id
      );

      if (idx !== -1) {
        state.items[idx] = action.payload;
      } else {
        state.items.push(action.payload);
      }
    });

    builder.addCase(fetchCampaignById.rejected, (state, action) => {
      state.loading = false;
      state.error =
        action.error.message ?? "Failed to fetch campaign";
    });
  },
});

export default campaignSlice.reducer;
