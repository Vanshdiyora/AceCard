import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { Campaign, CampaignState, CampaignListResponse } from "./types";
import { CampaignService } from "./services/campaign.service";

/* ---------------------------------------
   ERROR HELPER
---------------------------------------- */

const extractApiError = (err: unknown, fallback: string): string =>
  (err as any)?.response?.data?.error ||
  (err as any)?.response?.data?.message ||
  (err as any)?.message ||
  fallback;

/* ---------------------------------------
   THUNKS
---------------------------------------- */

export const fetchCampaigns = createAsyncThunk<
  CampaignListResponse,
  { page?: number; page_size?: number },
  { rejectValue: string }
>("campaigns/fetchAll", async ({ page = 1, page_size = 10 }, { rejectWithValue }) => {
  try {
    return await CampaignService.getAll({ page, page_size });
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to fetch campaigns"));
  }
});

export const createCampaign = createAsyncThunk<
  Campaign,
  Partial<Campaign>,
  { rejectValue: string }
>("campaigns/create", async (data, { rejectWithValue }) => {
  try {
    return await CampaignService.create(data);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to create campaign"));
  }
});

export const duplicateCampaign = createAsyncThunk<
  Campaign,
  Campaign,
  { rejectValue: string }
>("campaigns/duplicate", async (campaign, { rejectWithValue }) => {
  try {
    const payload: Partial<Campaign> = {
      vendor_id: campaign.vendor_id,
      name: `${campaign.name} Copy`,
      description: campaign.description,
      manager_id: campaign.manager_id,
      assigned_reps: campaign.assigned_reps,
      products: campaign.products,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
      status: "active",
      budget: campaign.budget,
    };

    return await CampaignService.create(payload);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to duplicate campaign"));
  }
});

export const fetchCampaignsByTeamMember = createAsyncThunk<
  CampaignListResponse,
  { memberId?: number; page?: number; page_size?: number },
  { rejectValue: string }
>(
  "campaigns/fetchByTeamMember",
  async ({ memberId, page, page_size }, { rejectWithValue }) => {
    if (!memberId) return rejectWithValue("Member ID is required");

    try {
      return await CampaignService.getByTeamMember(memberId, { page, page_size });
    } catch (err) {
      return rejectWithValue(extractApiError(err, "Failed to fetch member campaigns"));
    }
  }
);

export const fetchCampaignById = createAsyncThunk<
  Campaign,
  number,
  { rejectValue: string }
>("campaigns/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await CampaignService.getById(id);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to fetch campaign"));
  }
});

export const updateCampaign = createAsyncThunk<
  Campaign,
  { id: number; data: Partial<Campaign> },
  { rejectValue: string }
>("campaigns/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await CampaignService.update(id, data);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to update campaign"));
  }
});

export const archiveCampaign = createAsyncThunk<
  Campaign,
  number,
  { rejectValue: string }
>("campaigns/archive", async (id, { rejectWithValue }) => {
  try {
    return await CampaignService.archive(id);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to archive campaign"));
  }
});

/* ---------------------------------------
   STATE
---------------------------------------- */

const initialState: CampaignState = {
  items: [],
  meta: null,
  loading: false,
  error: null,
};

/* ---------------------------------------
   SLICE
---------------------------------------- */

const campaignSlice = createSlice({
  name: "campaigns",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* ---------- FETCH ALL ---------- */
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch campaigns";
      })

      /* ---------- CREATE ---------- */
      .addCase(createCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create campaign";
      })

      /* ---------- DUPLICATE ---------- */
      .addCase(duplicateCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(duplicateCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload);
      })
      .addCase(duplicateCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to duplicate campaign";
      })

      /* ---------- UPDATE ---------- */
      .addCase(updateCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCampaign.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update campaign";
      })

      /* ---------- ARCHIVE ---------- */
      .addCase(archiveCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveCampaign.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(archiveCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to archive campaign";
      })

      /* ---------- FETCH BY ID ---------- */
      .addCase(fetchCampaignById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaignById.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.items.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        else state.items.push(action.payload);
      })
      .addCase(fetchCampaignById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch campaign";
      })

      /* ---------- FETCH BY TEAM MEMBER ---------- */
      .addCase(fetchCampaignsByTeamMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaignsByTeamMember.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchCampaignsByTeamMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch member campaigns";
      });
  },
});

export default campaignSlice.reducer;
