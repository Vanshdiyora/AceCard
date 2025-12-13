import axiosClient from "../../../services/axiosClient";
import type { Product } from "../types";

export const ProductsAPI = {
  /**
   * Get all products
   */
  async getAll(): Promise<Product[]> {
    const res = await axiosClient.get("/vendor/products");
    return res.data;
  },

  /**
   * Create product
   * Requires:
   * {
   *   name, price, category, sku, description,
   *   extra_properties: {}
   * }
   */
  async createProduct(data: any) {
    const res = await axiosClient.post("/vendor/products", data);
    return res.data;
  },

  /**
   * Update product by ID
   * PUT /vendor/products/:id
   * Must send the FULL product object as backend requires:
   * {
   *   id, vendor_id, name, price, category, sku, status,
   *   created_at, updated_at, description, extra_properties
   * }
   */
  async updateProduct(id: number, data: any) {
    const res = await axiosClient.put(`/vendor/products/${id}`, data);
    return res.data;
  },

  /**
   * NEW — Archive OR Activate product
   * POST /vendor/products/{id}/archive
   */
  async toggleArchive(id: number) {
    const res = await axiosClient.post(`/vendor/products/${id}/archive`);
    return res.data;
  }
};
