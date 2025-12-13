import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Campaign, CampaignState } from "./types";
import { CampaignService } from "./services/campaign.service";

// Fetch all campaigns
export const fetchCampaigns = createAsyncThunk(
  "campaigns/fetchAll",
  async () => {
    return await CampaignService.getAll();
  }
);

// Create a new campaign
export const createCampaign = createAsyncThunk(
  "campaigns/create",
  async (data: Partial<Campaign>) => {
    return await CampaignService.create(data);
  }
);

// Update a campaign
export const updateCampaign = createAsyncThunk(
  "campaigns/update",
  async ({ id, data }: { id: number; data: Partial<Campaign> }) => {
    return await CampaignService.update(id, data);
  }
);

// Archive a campaign
export const archiveCampaign = createAsyncThunk(
  "campaigns/archive",
  async (id: number) => {
    return await CampaignService.archive(id);
  }
);

const initialState: CampaignState = {
  items: [],
  loading: false,
  error: null,
};

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
    });

    builder.addCase(fetchCampaigns.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload;
    });

    builder.addCase(fetchCampaigns.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message ?? "Failed to fetch campaigns";
    });

    // -----------------------------
    // CREATE CAMPAIGN
    // -----------------------------
    builder.addCase(createCampaign.fulfilled, (state, action) => {
      state.items.push(action.payload);
    });

    // -----------------------------
    // UPDATE CAMPAIGN
    // -----------------------------
    builder.addCase(updateCampaign.fulfilled, (state, action) => {
      const idx = state.items.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    });

    // -----------------------------
    // ARCHIVE CAMPAIGN
    // -----------------------------
    builder.addCase(archiveCampaign.fulfilled, (state, action) => {
      const idx = state.items.findIndex(c => c.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload; // new archived status
    });
  },
});

export default campaignSlice.reducer;
