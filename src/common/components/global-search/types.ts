export type GlobalSearchType =
  | "campaign"
  | "lead"
  | "team"
  | "product"
  | "vendor";

export interface GlobalSearchItem {
  id: number | string;
  label: string;
  type: GlobalSearchType;
  route: string;
}

export type GroupedSearchResults = Partial<
  Record<GlobalSearchType, GlobalSearchItem[]>
>;
