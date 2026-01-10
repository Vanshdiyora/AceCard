import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { SettingsState, AccountProfile, UpdateAccountProfilePayload, LeadFormConfig } from "./types";
import { settingsService } from "./services/settings.service";

const initialState: SettingsState = {
  account: {
    data: null,
    loading: false,
    saving: false,
    error: null,
  },
  leadConfig: {
    data: null,
    loading: false,
    saving: false,
    error: null,
  },
};

export const fetchAccountProfile = createAsyncThunk<AccountProfile>(
  "settings/fetchAccountProfile",
  async (_, thunkAPI) => {
    try {
      return await settingsService.getAccountProfile();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load profile");
    }
  }
);

export const updateAccountProfile = createAsyncThunk<
  AccountProfile,
  UpdateAccountProfilePayload
>("settings/updateAccountProfile", async (payload, thunkAPI) => {
  try {
    return await settingsService.updateAccountProfile(payload);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to update profile"
    );
  }
});

export const fetchLeadConfig = createAsyncThunk<LeadFormConfig>(
  "settings/fetchLeadConfig",
  async (_, thunkAPI) => {
    try {
      return await settingsService.getLeadsConfig();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to load lead config");
    }
  }
);

export const saveLeadConfig = createAsyncThunk<LeadFormConfig, LeadFormConfig>(
  "settings/saveLeadConfig",
  async (payload, thunkAPI) => {
    try {
      return await settingsService.updateLeadsConfig(payload);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to save lead config");
    }
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccountProfile.pending, (state) => {
        state.account.loading = true;
      })
      .addCase(fetchAccountProfile.fulfilled, (state, action) => {
        state.account.loading = false;
        state.account.data = action.payload;
      })
      .addCase(fetchAccountProfile.rejected, (state, action) => {
        state.account.loading = false;
        state.account.error = action.payload as string;
      })
      .addCase(updateAccountProfile.pending, (state) => {
        state.account.saving = true;
      })
      .addCase(updateAccountProfile.fulfilled, (state, action) => {
        state.account.saving = false;
        state.account.data = action.payload;
      })
      .addCase(updateAccountProfile.rejected, (state, action) => {
        state.account.saving = false;
        state.account.error = action.payload as string;
      })

      // Lead Config
      .addCase(fetchLeadConfig.pending, (state) => {
        state.leadConfig.loading = true;
      })
      .addCase(fetchLeadConfig.fulfilled, (state, action) => {
        state.leadConfig.loading = false;
        state.leadConfig.data = action.payload;
      })
      .addCase(fetchLeadConfig.rejected, (state, action) => {
        state.leadConfig.loading = false;
        state.leadConfig.error = action.payload as string;
      })
      .addCase(saveLeadConfig.pending, (state) => {
        state.leadConfig.saving = true;
      })
      .addCase(saveLeadConfig.fulfilled, (state, action) => {
        state.leadConfig.saving = false;
        state.leadConfig.data = action.payload;
      })
      .addCase(saveLeadConfig.rejected, (state, action) => {
        state.leadConfig.saving = false;
        state.leadConfig.error = action.payload as string;
      });
  },
});

export default settingsSlice.reducer;
