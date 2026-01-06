import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { GlobalSearchItem } from "./types";
import { searchGlobal } from "./services/globalSearchApi";

interface State {
  items: GlobalSearchItem[];
  loading: boolean;
}

const initialState: State = {
  items: [],
  loading: false,
};

export const fetchGlobalSearch = createAsyncThunk(
  "globalSearch/search",
  async ({ query, mode }: { query: string; mode: "admin" | "super_admin" }) => {
    return await searchGlobal(query, mode);
  }
);

const slice = createSlice({
  name: "globalSearch",
  initialState,
  reducers: {
    clearResults(state) {
      state.items = [];
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchGlobalSearch.pending, state => {
        state.loading = true;
      })
      .addCase(fetchGlobalSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchGlobalSearch.rejected, state => {
        state.loading = false;
        state.items = [];
      });
  },
});

export const { clearResults } = slice.actions;
export default slice.reducer;
