/* ---------- PRODUCT ---------- */
export interface Product {
  id: number;
  vendor_id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  status: "active" | "archived";
  created_at: string;
  updated_at: string;
  product_img_url?: string; 
}

export interface ExtendedProductState extends ProductState {
  salesProducts: Product[];
  salesMeta: any;
  error: string | null;
}


/* ---------- PAGINATION ---------- */
export interface ProductMeta {
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface ProductListResponse {
  data: Product[];
  meta: ProductMeta;
}
/* ---------- PRODUCT LOOKUP ---------- */
export interface ProductLookup {
  id: number;
  name: string;
  category: string;
  price: number;
}

/* ---------- STATE ---------- */
export interface ProductState {
  products: Product[];
  meta: ProductMeta | null;

  /**
   * Single product for details page
   */
  selectedProduct: Product | null;

  loading: boolean;
  lookup: ProductLookup[];
}
