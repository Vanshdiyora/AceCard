import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  SettingsState,
  SuggestedQuestion,
  AccountProfile,
  UpdateAccountProfilePayload,
  LeadFormConfig,
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

export const saveLeadConfig = createAsyncThunk<LeadFormConfig, LeadFormConfig>(
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

/* ======================================================
   SLICE
====================================================== */

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
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
      });
  },
});

export default settingsSlice.reducer;
