// src/features/settings/slice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  AccountProfile,
  SettingsState,
  UpdateAccountProfilePayload,
} from "./types";
import { settingsService } from "./services/settings.service";

const initialState: SettingsState = {
  account: {
    data: null,
    loading: false,
    saving: false,
    error: null,
  },
};

// ---------- Thunks ----------
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
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to update profile");
  }
});

// ---------- Slice ----------
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Fetch Profile
    builder.addCase(fetchAccountProfile.pending, (state) => {
      state.account.loading = true;
      state.account.error = null;
    });
    builder.addCase(fetchAccountProfile.fulfilled, (state, action) => {
      state.account.loading = false;
      state.account.data = action.payload;
    });
    builder.addCase(fetchAccountProfile.rejected, (state, action) => {
      state.account.loading = false;
      state.account.error = action.payload as string;
    });

    // Update Profile
    builder.addCase(updateAccountProfile.pending, (state) => {
      state.account.saving = true;
      state.account.error = null;
    });
    builder.addCase(updateAccountProfile.fulfilled, (state, action) => {
      state.account.saving = false;
      state.account.data = action.payload;
    });
    builder.addCase(updateAccountProfile.rejected, (state, action) => {
      state.account.saving = false;
      state.account.error = action.payload as string;
    });
  },
});

export default settingsSlice.reducer;
