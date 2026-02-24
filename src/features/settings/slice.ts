import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  SettingsState,
  SuggestedQuestion,
  AccountProfile,
  UpdateAccountProfilePayload,
  UpdateMyAccountProfilePayload,
  LeadFormConfig,
  TrackingPixels
} from "./types";
import { settingsService } from "./services/settings.service";

/* ======================================================
  INITIAL STATE
====================================================== */

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
  suggestedQuestions: {
    data: [],
    loading: false,
    saving: false,
    error: null,
  },
  integrations: {
    data: [],
    loading: false,
    error: null,
  },
  trackingPixels: {
    data: null,
    loading: false,
    saving: false,
    error: null,
  },
};

/* ======================================================
  THUNKS
====================================================== */

// ---------- Account ----------
export const fetchAccountProfile = createAsyncThunk<AccountProfile>(
  "settings/fetchAccountProfile",
  async (_, thunkAPI) => {
    try {
      return await settingsService.getAccountProfile();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load profile"
      );
    }
  }
);

export const updateMyAccountProfile = createAsyncThunk<
  AccountProfile,
  UpdateMyAccountProfilePayload
>("settings/updateMyAccountProfile", async (payload, thunkAPI) => {
  try {
    const data = await settingsService.updateMyAccountProfile(payload);
    console.log("API response in thunk:", data);
    // map API response -> AccountProfile
    const mapped: AccountProfile = {
      username: (data as any).username,
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      role: data.role ?? "",
      avatar_url: data.avatar_url ?? "",
      bio: data.bio ?? "",
      company_description: data.company_description ?? "",
      socials: data.socials ?? null,
      other_links: data.other_links ?? null,
      display_settings: data.display_settings ?? null,
      address: (data as any).address ?? "",
      custom_job_role: data.custom_job_role ?? "",
      vendor_name: data.vendor_name ?? "",
    };

    return mapped;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.message || "Failed to update profile"
    );
  }
});


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
// ---------- Tracking Pixels ----------
export const fetchTrackingPixels = createAsyncThunk(
  "settings/fetchTrackingPixels",
  async (_, thunkAPI) => {
    try {
      return await settingsService.getTrackingPixels();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load tracking pixels"
      );
    }
  }
);

export const saveTrackingPixels = createAsyncThunk(
  "settings/saveTrackingPixels",
  async (payload: TrackingPixels, thunkAPI) => {
    try {
      return await settingsService.saveTrackingPixels(payload);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to save tracking pixels"
      );
    }
  }
);

// ---------- Lead Config ----------
export const fetchLeadConfig = createAsyncThunk<LeadFormConfig>(
  "settings/fetchLeadConfig",
  async (_, thunkAPI) => {
    try {
      return await settingsService.getLeadsConfig();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to load lead config"
      );
    }
  }
);

export const saveLeadConfig = createAsyncThunk<
  LeadFormConfig,
  LeadFormConfig
>(
  "settings/saveLeadConfig",
  async (payload, thunkAPI) => {
    try {
      return await settingsService.updateLeadsConfig(payload);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to save lead config"
      );
    }
  }
);

// ---------- Suggested Questions ----------
export const fetchSuggestedQuestions = createAsyncThunk<SuggestedQuestion[]>(
  "settings/fetchSuggestedQuestions",
  async (_, thunkAPI) => {
    try {
      return await settingsService.listSuggestedQuestions();
    } catch {
      return thunkAPI.rejectWithValue("Failed to load suggested questions");
    }
  }
);

export const addSuggestedQuestion = createAsyncThunk<SuggestedQuestion, string>(
  "settings/addSuggestedQuestion",
  async (question, thunkAPI) => {
    try {
      return await settingsService.createSuggestedQuestion(question);
    } catch {
      return thunkAPI.rejectWithValue("Failed to add question");
    }
  }
);

export const editSuggestedQuestion = createAsyncThunk<
  SuggestedQuestion,
  { id: number; question: string }
>("settings/editSuggestedQuestion", async ({ id, question }, thunkAPI) => {
  try {
    return await settingsService.updateSuggestedQuestion(id, question);
  } catch {
    return thunkAPI.rejectWithValue("Failed to update question");
  }
});

export const removeSuggestedQuestion = createAsyncThunk<number, number>(
  "settings/removeSuggestedQuestion",
  async (id, thunkAPI) => {
    try {
      await settingsService.deleteSuggestedQuestion(id);
      return id;
    } catch {
      return thunkAPI.rejectWithValue("Failed to delete question");
    }
  }
);

// ---------- Password ----------
export const resetPassword = createAsyncThunk<
  void,
  { old_password: string; new_password: string }
>("settings/resetPassword", async (payload, thunkAPI) => {
  try {
    await settingsService.resetPassword(payload);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Failed to update password"
    );
  }
});

// ---------- Integrations ----------
export const fetchIntegrations = createAsyncThunk(
  "settings/fetchIntegrations",
  async (_, thunkAPI) => {
    try {
      return await settingsService.listIntegrations();
    } catch {
      return thunkAPI.rejectWithValue("Failed to load integrations");
    }
  }
);

export const connectIntegration = createAsyncThunk<
  void,
  { provider: string; payload: any }
>("settings/connectIntegration", async ({ provider, payload }, thunkAPI) => {
  try {
    await settingsService.exchangeCode(provider, payload);
  } catch {
    return thunkAPI.rejectWithValue("Failed to connect integration");
  }
});

export const disconnectIntegration = createAsyncThunk<string, string>(
  "settings/disconnectIntegration",
  async (provider, thunkAPI) => {
    try {
      await settingsService.disconnectIntegration(provider);
      return provider;
    } catch {
      return thunkAPI.rejectWithValue("Failed to disconnect integration");
    }
  }
);

export const syncIntegration = createAsyncThunk<string, string>(
  "settings/syncIntegration",
  async (provider, thunkAPI) => {
    try {
      await settingsService.syncIntegration(provider);
      return provider;
    } catch {
      return thunkAPI.rejectWithValue("Failed to sync integration");
    }
  }
);

/* ======================================================
  SLICE
====================================================== */

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    resetSettings: () => initialState,
  },
  extraReducers: (builder) => {
    builder

      // ---------- Account ----------
      .addCase(fetchAccountProfile.pending, (s) => {
        s.account.loading = true;
        s.account.error = null;
      })
      .addCase(fetchAccountProfile.fulfilled, (s, a) => {
        s.account.loading = false;
        s.account.data = a.payload;
      })
      .addCase(fetchAccountProfile.rejected, (s, a) => {
        s.account.loading = false;
        s.account.error = a.payload as string;
      })

      .addCase(updateAccountProfile.pending, (s) => {
        s.account.saving = true;
        s.account.error = null;
      })
      .addCase(updateAccountProfile.fulfilled, (s, a) => {
        s.account.saving = false;
        s.account.data = a.payload;
      })
      .addCase(updateAccountProfile.rejected, (s, a) => {
        s.account.saving = false;
        s.account.error = a.payload as string;
      })

      // ---------- Lead Config ----------
      .addCase(fetchLeadConfig.pending, (s) => {
        s.leadConfig.loading = true;
        s.leadConfig.error = null;
      })
      .addCase(fetchLeadConfig.fulfilled, (s, a) => {
        s.leadConfig.loading = false;
        s.leadConfig.data = a.payload;
      })
      .addCase(fetchLeadConfig.rejected, (s, a) => {
        s.leadConfig.loading = false;
        s.leadConfig.error = a.payload as string;
      })

      .addCase(saveLeadConfig.pending, (s) => {
        s.leadConfig.saving = true;
        s.leadConfig.error = null;
      })
      .addCase(saveLeadConfig.fulfilled, (s, a) => {
        s.leadConfig.saving = false;
        s.leadConfig.data = a.payload;
      })
      .addCase(saveLeadConfig.rejected, (s, a) => {
        s.leadConfig.saving = false;
        s.leadConfig.error = a.payload as string;
      })
      .addCase(updateMyAccountProfile.pending, (s) => {
        s.account.saving = true;
        s.account.error = null;
      })
      .addCase(updateMyAccountProfile.fulfilled, (s, a) => {
        s.account.saving = false;

        if (s.account.data) {
          s.account.data = {
            ...s.account.data,   // 👈 keep old fields
            ...a.payload,        // 👈 override only changed ones
          };
        } else {
          s.account.data = a.payload;
        }
      })

      .addCase(updateMyAccountProfile.rejected, (s, a) => {
        s.account.saving = false;
        s.account.error = a.payload as string;
      })

      // ---------- Suggested Questions ----------
      .addCase(fetchSuggestedQuestions.pending, (s) => {
        s.suggestedQuestions.loading = true;
        s.suggestedQuestions.error = null;
      })
      .addCase(fetchSuggestedQuestions.fulfilled, (s, a) => {
        s.suggestedQuestions.loading = false;
        s.suggestedQuestions.data = a.payload;
      })
      .addCase(fetchSuggestedQuestions.rejected, (s, a) => {
        s.suggestedQuestions.loading = false;
        s.suggestedQuestions.error = a.payload as string;
      })

      .addCase(addSuggestedQuestion.pending, (s) => {
        s.suggestedQuestions.saving = true;
      })
      .addCase(addSuggestedQuestion.fulfilled, (s, a) => {
        s.suggestedQuestions.saving = false;
        s.suggestedQuestions.data.push(a.payload);
      })
      .addCase(addSuggestedQuestion.rejected, (s, a) => {
        s.suggestedQuestions.saving = false;
        s.suggestedQuestions.error = a.payload as string;
      })

      .addCase(editSuggestedQuestion.fulfilled, (s, a) => {
        const idx = s.suggestedQuestions.data.findIndex(
          (q) => q.id === a.payload.id
        );
        if (idx !== -1) s.suggestedQuestions.data[idx] = a.payload;
      })

      .addCase(removeSuggestedQuestion.fulfilled, (s, a) => {
        s.suggestedQuestions.data = s.suggestedQuestions.data.filter(
          (q) => q.id !== a.payload
        );
      })

      // ---------- Integrations ----------
      .addCase(fetchIntegrations.pending, (s) => {
        s.integrations.loading = true;
        s.integrations.error = null;
      })
      .addCase(fetchIntegrations.fulfilled, (s, a) => {
        s.integrations.loading = false;
        s.integrations.data = a.payload;
      })
      .addCase(fetchIntegrations.rejected, (s, a) => {
        s.integrations.loading = false;
        s.integrations.error = a.payload as string;
      })

      // CONNECT loading
      .addCase(connectIntegration.pending, (s, a) => {
        const i = s.integrations.data.find(
          x => x.provider === a.meta.arg.provider
        );
        if (i) i.connecting = true;
      })
      .addCase(connectIntegration.fulfilled, (s, a) => {
        const i = s.integrations.data.find(
          x => x.provider === a.meta.arg.provider
        );
        if (i) {
          i.connecting = false;
          i.connected = true;
        }
      })
      .addCase(connectIntegration.rejected, (s, a) => {
        const i = s.integrations.data.find(
          x => x.provider === a.meta.arg.provider
        );
        if (i) i.connecting = false;
        s.integrations.error = a.payload as string;
      })

      // DISCONNECT loading
      .addCase(disconnectIntegration.pending, (s, a) => {
        const i = s.integrations.data.find(
          x => x.provider === a.meta.arg
        );
        if (i) i.disconnecting = true;
      })
      .addCase(disconnectIntegration.fulfilled, (s, a) => {
        const i = s.integrations.data.find(
          x => x.provider === a.payload
        );
        if (i) {
          i.disconnecting = false;
          i.connected = false;
        }
      })
      .addCase(disconnectIntegration.rejected, (s, a) => {
        const i = s.integrations.data.find(
          x => x.provider === a.meta.arg
        );
        if (i) i.disconnecting = false;
        s.integrations.error = a.payload as string;
      })

      // SYNC loading (existing)
      .addCase(syncIntegration.pending, (s, a) => {
        const i = s.integrations.data.find(x => x.provider === a.meta.arg);
        if (i) i.syncing = true;
      })
      .addCase(syncIntegration.fulfilled, (s, a) => {
        const i = s.integrations.data.find(x => x.provider === a.payload);
        if (i) i.syncing = false;
      })
      .addCase(syncIntegration.rejected, (s, a) => {
        const i = s.integrations.data.find(x => x.provider === a.meta.arg);
        if (i) i.syncing = false;
        s.integrations.error = a.payload as string;
      })
      // ---------- Tracking Pixels ----------
      .addCase(fetchTrackingPixels.pending, (s) => {
        s.trackingPixels.loading = true;
        s.trackingPixels.error = null;
      })
      .addCase(fetchTrackingPixels.fulfilled, (s, a) => {
        s.trackingPixels.loading = false;
        s.trackingPixels.data = a.payload;
      })
      .addCase(fetchTrackingPixels.rejected, (s, a) => {
        s.trackingPixels.loading = false;
        s.trackingPixels.error = a.payload as string;
      })

      .addCase(saveTrackingPixels.pending, (s) => {
        s.trackingPixels.saving = true;
        s.trackingPixels.error = null;
      })
      .addCase(saveTrackingPixels.fulfilled, (s, a) => {
        s.trackingPixels.saving = false;
        s.trackingPixels.data = a.payload;
      })
      .addCase(saveTrackingPixels.rejected, (s, a) => {
        s.trackingPixels.saving = false;
        s.trackingPixels.error = a.payload as string;
      });

  },
});

export const { resetSettings } = settingsSlice.actions;
export default settingsSlice.reducer;
