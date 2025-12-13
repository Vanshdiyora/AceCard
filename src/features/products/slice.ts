import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ProductsAPI } from "./services/products.service";
import type { ProductState } from "./types";

export const fetchProducts = createAsyncThunk("products/fetchAll", async () => {
  return await ProductsAPI.getAll();
});

const initialState: ProductState = {
  products: [],
  loading: false
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state) => {
        state.loading = false;
      });
  }
});

export default productsSlice.reducer;
