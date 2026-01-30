import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchPublicCard, updatePublicProfile, fetchMyProfile, sendVisitorConnect } from "./services/publicProfile.api";
import type { PublicProfileApi } from "./types";

interface State {
  data: PublicProfileApi | null;
  loading: boolean;
  saving: boolean;
  connecting: boolean;   // 👈
}

const initialState: State = {
  data: null,
  loading: false,
  saving: false,
  connecting: false,
};

export const loadPublicProfile = createAsyncThunk(
  "publicProfile/load",
  async (handle: string) => {
    const res = await fetchPublicCard(handle);
    return res.data;
  }
);

export const sendConnectRequest = createAsyncThunk(
  "publicProfile/connect",
  async (
    { handle, payload }: { handle: string; payload: any }
  ) => {
    const res = await sendVisitorConnect(handle, payload);
    return res.data;
  }
);

export const loadMyProfile = createAsyncThunk(
  "publicProfile/loadMy",
  async () => {
    const res = await fetchMyProfile();
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
      if (state.data) {
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

        if (s.data) {
          // merge instead of replace
          s.data.configuration = a.payload.configuration;
        }
      })
      .addCase(savePublicProfile.rejected, (s) => {
        s.saving = false;
      })
      .addCase(loadMyProfile.pending, (s) => {
        s.loading = true;
      })
      .addCase(loadMyProfile.fulfilled, (s, a) => {
        s.loading = false;
        s.data = a.payload;
      })
      .addCase(loadMyProfile.rejected, (s) => {
        s.loading = false;
      })
      .addCase(sendConnectRequest.pending, (s) => {
  s.connecting = true;
})
.addCase(sendConnectRequest.fulfilled, (s) => {
  s.connecting = false;
})
.addCase(sendConnectRequest.rejected, (s) => {
  s.connecting = false;
});


  },
});

export const { previewPublicProfile } = publicProfileSlice.actions;
export default publicProfileSlice.reducer;
