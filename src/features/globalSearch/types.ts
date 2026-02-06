export type GlobalSearchType =
  | "campaign"
  | "lead"
  | "vendor"
  | "team"
  | "product";

export interface GlobalSearchItem {
  id: number | string;
  label: string;
  type: string;
  route: string;
}

