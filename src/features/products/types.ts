export interface Product {
  id: number;
  vendor_id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  sku: string;
  status: "active" | "inactive";
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  totalOpportunities: number; // backend does NOT give this
  totalRevenue: string;
}

export interface ProductState {
  products: Product[];
  loading: boolean;
}
