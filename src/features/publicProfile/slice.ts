import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPublicCard, updatePublicProfile } from "./services/publicProfile.api";
import type { PublicProfileApi } from "./types";

interface State {
  data: PublicProfileApi | null;
  loading: boolean;
  saving: boolean;
  error?: string;
}

const initialState: State = {
  data: null,
  loading: false,
  saving: false,
};

export const loadPublicProfile = createAsyncThunk(
  "publicProfile/load",
  async (handle: string) => {
    const res = await fetchPublicCard(handle);
    return res.data;
  }
);

export const savePublicProfile = createAsyncThunk(
  "publicProfile/save",
  async ({ config }: { config: any }) => {
    const res = await updatePublicProfile(config);
    return res.data;
  }
);

const publicProfileSlice = createSlice({
  name: "publicProfile",
  initialState,
  reducers: {
    previewPublicProfile(state, action) {
      if (state.data?.configuration) {
        state.data.configuration = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPublicProfile.pending, (s) => {
        s.loading = true;
      })
      .addCase(loadPublicProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(loadPublicProfile.rejected, (s) => {
        s.loading = false;
      })

      .addCase(savePublicProfile.pending, (s) => {
        s.saving = true;
      })
      .addCase(savePublicProfile.fulfilled, (s, a) => {
        s.saving = false;
        s.data = a.payload;
      })
      .addCase(savePublicProfile.rejected, (s) => {
        s.saving = false;
      });
  },
});

export const { previewPublicProfile } = publicProfileSlice.actions;
export default publicProfileSlice.reducer;
