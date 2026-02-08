import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ProductsAPI } from "./services/products.service";
import type { ExtendedProductState, ProductListResponse, Product, ProductLookup } from "./types";

type ApiError = { response?: { data?: { error?: string; message?: string } } };
type FetchMode = "paginate" | "infinite";

const extractApiError = (err: unknown, fallback: string): string =>
  (err as ApiError)?.response?.data?.error ||
  (err as ApiError)?.response?.data?.message ||
  (err as Error)?.message ||
  fallback;

/* ---------------- THUNKS ---------------- */
export const fetchProducts = createAsyncThunk<
  ProductListResponse,
  { page?: number; page_size?: number; search?: string; status?: "active" | "archived"; mode?: FetchMode },
  { rejectValue: string }
>("products/fetchProducts", async (args, { rejectWithValue }) => {
  try {
    return await ProductsAPI.getAll(args);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to fetch products"));
  }
});
type LeadRow = {
  id: number;
  lead_name: string;
  campaign_name?: string;
  owner_name?: string;
  manager_name?: string;
};

export const fetchProductLeads = createAsyncThunk<
  LeadRow[],
  number,
  { rejectValue: string }
>("products/fetchProductLeads", async (productId, { rejectWithValue }) => {
  try {
    const res = await ProductsAPI.getProductLeads(productId);

    // 🔑 FIX: ensure array
    const list = Array.isArray(res) ? res : [res];

    return list.map((l: any) => ({
      id: l.lead_id,
      lead_name: l.Lead_Name,
      campaign_name: l.Campaign_name || undefined,
      owner_name: l.Sales_person || undefined,
      manager_name: l.Manager_name || undefined,
    }));
  } catch (err) {
    console.error("fetchProductLeads error", err);
    return rejectWithValue("Failed to fetch product leads");
  }
});



export const fetchSalesProducts = createAsyncThunk<
  ProductListResponse,
  { page?: number; page_size?: number; search?: string; status?: "active" | "archived"; mode?: FetchMode },
  { rejectValue: string }
>("products/fetchSalesProducts", async (args, { rejectWithValue }) => {
  try {
    return await ProductsAPI.getAllSales({ ...args, status: "active" });
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to fetch sales products"));
  }
});


export const fetchProductById = createAsyncThunk<Product, number, { rejectValue: string }>(
  "products/fetchById",
  async (id, { rejectWithValue }) => {
    try {
      return await ProductsAPI.getById(id);
    } catch (err) {
      return rejectWithValue(extractApiError(err, "Failed to fetch product"));
    }
  }
);

export const createProduct = createAsyncThunk<Product, Partial<Product>, { rejectValue: string }>(
  "products/create",
  async (data, { rejectWithValue }) => {
    try {
      return await ProductsAPI.createProduct(data);
    } catch (err) {
      return rejectWithValue(extractApiError(err, "Failed to create product"));
    }
  }
);

export const updateProduct = createAsyncThunk<
  Product,
  { id: number; data: Partial<Product> },
  { rejectValue: string }
>("products/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await ProductsAPI.updateProduct(id, data);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to update product"));
  }
});

/* -------- Optimistic Archive -------- */

export const archiveProduct = createAsyncThunk<
  { id: number },
  number,
  { rejectValue: string }
>("products/archive", async (id, { rejectWithValue }) => {
  try {
    await ProductsAPI.archiveProduct(id); // returns { status: "updated" }
    return { id };
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to archive product"));
  }
});

export const lookupProducts = createAsyncThunk<
  ProductLookup[],
  number[],
  { rejectValue: string }
>("products/lookup", async (ids, { rejectWithValue }) => {
  try {
    return await ProductsAPI.lookupByIds(ids);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to lookup products"));
  }
});


export const unarchiveProduct = createAsyncThunk<
  { id: number },
  number,
  { rejectValue: string }
>("products/unarchive", async (id, { rejectWithValue }) => {
  try {
    await ProductsAPI.unarchiveProduct(id);
    return { id };
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to activate product"));
  }
});

/* ---------------- STATE ---------------- */

const initialState: ExtendedProductState & {
  error: string | null;
  productLeads: any[];
  productLeadsLoading: boolean;
} = {
  products: [],
  salesProducts: [],
  meta: null,
  salesMeta: null,
  selectedProduct: null,
  loading: false,
  error: null,
  lookup: [],
  productLeads: [],
  productLeadsLoading: false,
};

/* ---------------- SLICE ---------------- */

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearSelectedProduct(state) {
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ---------- FETCH LIST ---------- */
      /* NORMAL */
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;

        const page = action.meta.arg.page ?? 1;
        const mode = action.meta.arg.mode ?? "paginate";
        const newItems = action.payload.data ?? [];

        if (mode === "paginate" || page === 1) {
          state.products = newItems;
        } else {
          const ids = new Set(state.products.map(p => p.id));
          state.products.push(...newItems.filter(p => !ids.has(p.id)));
        }

        state.meta = action.payload.meta ?? null;
      })

      /* SALES */
      .addCase(fetchSalesProducts.fulfilled, (state, action) => {
        state.loading = false;

        const page = action.meta.arg.page ?? 1;
        const mode = action.meta.arg.mode ?? "paginate";
        const newItems = action.payload.data ?? [];

        if (mode === "paginate" || page === 1) {
          state.salesProducts = newItems;
        } else {
          const ids = new Set(state.salesProducts.map(p => p.id));
          state.salesProducts.push(...newItems.filter(p => !ids.has(p.id)));
        }

        state.salesMeta = action.payload.meta ?? null;
      })

      /* ---------- FETCH SINGLE ---------- */
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.selectedProduct = null;
        state.error = action.payload ?? "Failed to fetch product";
      })

      /* ---------- CREATE ---------- */
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;

        if (!Array.isArray(state.products)) {
          state.products = [];
        }

        if (!state.meta || state.meta.page === 1) {
          state.products.unshift(action.payload);
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to create product";
      })

      /* ---------- UPDATE ---------- */
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        const i = state.products.findIndex(p => p.id === action.payload.id);
        if (i !== -1) state.products[i] = action.payload;
        if (state.selectedProduct?.id === action.payload.id) {
          state.selectedProduct = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to update product";
      })

      /* ---------- ARCHIVE (OPTIMISTIC) ---------- */
      .addCase(archiveProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(archiveProduct.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload.id;

        const p = state.products.find(p => p.id === id);
        if (p) p.status = p.status === "active" ? "archived" : "active";

        if (state.selectedProduct?.id === id) {
          state.selectedProduct.status =
            state.selectedProduct.status === "active" ? "archived" : "active";
        }
      })
      .addCase(archiveProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to archive product";
      })
      // LOOK UP
      .addCase(lookupProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(lookupProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.lookup = action.payload;
      })

      .addCase(lookupProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to lookup products";
      })
      /* ---------- UNARCHIVE ---------- */
      .addCase(unarchiveProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unarchiveProduct.fulfilled, (state, action) => {
        state.loading = false;
        const id = action.payload.id;

        const p = state.products.find(p => p.id === id);
        if (p) p.status = "active";

        if (state.selectedProduct?.id === id) {
          state.selectedProduct.status = "active";
        }
      })
      .addCase(unarchiveProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to activate product";
      })
      .addCase(fetchProductLeads.pending, (state) => {
        state.productLeadsLoading = true;
      })
      .addCase(fetchProductLeads.fulfilled, (state, action) => {
        state.productLeadsLoading = false;
        state.productLeads = action.payload;
      })
      .addCase(fetchProductLeads.rejected, (state, action) => {
        state.productLeadsLoading = false;
        state.error = action.payload ?? "Failed to load product leads";
      });
  },
});

export const { clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
