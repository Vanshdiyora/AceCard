import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ProductsAPI } from "./services/products.service";
import type { ProductState, ProductListResponse, Product } from "./types";

/* -----------------------------------------------------
   ERROR HANDLER
----------------------------------------------------- */

type ApiError = { response?: { data?: { error?: string; message?: string } } };

const extractApiError = (err: unknown, fallback: string): string =>
  (err as ApiError)?.response?.data?.error ||
  (err as ApiError)?.response?.data?.message ||
  (err as Error)?.message ||
  fallback;

/* -----------------------------------------------------
   THUNKS
----------------------------------------------------- */

export const fetchProducts = createAsyncThunk<
  ProductListResponse,
  { page?: number; page_size?: number },
  { rejectValue: string }
>("products/fetchAll", async ({ page = 1, page_size = 10 }, { rejectWithValue }) => {
  try {
    return await ProductsAPI.getAll({ page, page_size });
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to fetch products"));
  }
});

export const fetchProductById = createAsyncThunk<
  Product,
  number,
  { rejectValue: string }
>("products/fetchById", async (id, { rejectWithValue }) => {
  try {
    return await ProductsAPI.getById(id);
  } catch (err) {
    return rejectWithValue(extractApiError(err, "Failed to fetch product"));
  }
});

/* -----------------------------------------------------
   INITIAL STATE
----------------------------------------------------- */

const initialState: ProductState & { error: string | null } = {
  products: [],
  meta: null,
  selectedProduct: null,
  loading: false,
  error: null,
};

/* -----------------------------------------------------
   SLICE
----------------------------------------------------- */

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
      /* -------- ALL PRODUCTS -------- */
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch products";
      })

      /* -------- SINGLE PRODUCT -------- */
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
      });
  },
});

export const { clearSelectedProduct } = productsSlice.actions;
export default productsSlice.reducer;
