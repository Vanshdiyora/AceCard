import type { RootState } from "../../app/store";

export const selectResults = (s: RootState) =>
  s.globalSearch.items;

export const selectLoading = (s: RootState) =>
  s.globalSearch.loading;
