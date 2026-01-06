export type GlobalSearchType =
  | "campaign"
  | "lead"
  | "vendor"
  | "team"
  | "product";

export interface GlobalSearchItem {
  id: string;
  label: string;
  type: GlobalSearchType;
  route: string;
  description?: string;
}
