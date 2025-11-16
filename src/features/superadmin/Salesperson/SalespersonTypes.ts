export interface Salesperson {
  id: number;
  name: string;
  email: string;
  phone: string;
  vendor: string;
  manager: string;
  role: string;
  registered: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface SalespersonStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export interface SalespersonState {
  stats: SalespersonStats;
  list: Salesperson[];
}
