export interface Product {
  id: number;
  name: string;
  sku: string;
  price: string;
  status: "active" | "inactive";
  statusColor: string;
  leads: number;
  opportunities: number;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  totalOpportunities: number;
  totalRevenue: string;
}
