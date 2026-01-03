import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ProductsAPI } from "./services/products.service";
import type {
  ProductState,
} from "./types";

/* ---------- THUNKS ---------- */

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await ProductsAPI.getAll();
    } catch (err: any) {
      return rejectWithValue(
        err?.message ?? "Failed to fetch products"
      );
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id: number, { rejectWithValue }) => {
    try {
      return await ProductsAPI.getById(id);
    } catch (err: any) {
      return rejectWithValue(
        err?.message ?? "Failed to fetch product"
      );
    }
  }
);

/* ---------- INITIAL STATE ---------- */

const initialState: ProductState = {
  products: [],
  meta: null,
  selectedProduct: null,
  loading: false,
};

/* ---------- SLICE ---------- */

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
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      })

      /* -------- SINGLE PRODUCT -------- */
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state) => {
        state.loading = false;
        state.selectedProduct = null;
      });
  },
});

export const { clearSelectedProduct } =
  productsSlice.actions;

export default productsSlice.reducer;
