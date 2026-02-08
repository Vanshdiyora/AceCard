import axiosClient from "../../../services/axiosClient";
import type {
  Product,
  ProductListResponse,
} from "../types";
import type { PaginationParams } from "../../../common/types";

export const ProductsAPI = {
  /* -------- GET ALL PRODUCTS -------- */
async getAll(
  params: PaginationParams & { search?: string,status?: "active" | "archived";} = { page: 1, page_size: 10 }
): Promise<ProductListResponse> {
  const res = await axiosClient.get("/vendor/products", { params });
  return res.data;
},

async getAllSales(
  params: PaginationParams & { search?: string,status?: "active" | "archived";} = { page: 1, page_size: 10 }
): Promise<ProductListResponse> {
  const res = await axiosClient.get("/sales/products", { params });
  return res.data;
},
  /* -------- GET PRODUCT BY ID -------- */
  async getById(id: number): Promise<Product> {
    const res = await axiosClient.get(
      `/vendor/products/${id}`
    );
    return res.data;
  },

  /* -------- CREATE PRODUCT -------- */
  async createProduct(data: Partial<Product>): Promise<Product> {
    const res = await axiosClient.post(
      "/vendor/products",
      data
    );
    return res.data;
  },

  /* -------- UPDATE PRODUCT -------- */
  async updateProduct(
    id: number,
    data: Partial<Product>
  ): Promise<Product> {
    const res = await axiosClient.put(
      `/vendor/products/${id}`,
      data
    );
    return res.data;
  },

  /* -------- ARCHIVE / ACTIVATE -------- */
  async archiveProduct(id: number): Promise<Product> {
    const res = await axiosClient.post(
      `/vendor/products/${id}/archive`
    );
    return res.data;
  },
  /* -------- LOOKUP PRODUCTS BY IDS -------- */
  async lookupByIds(ids: number[]): Promise<Product[]> {
    const res = await axiosClient.post("/vendor/products/lookup", { ids });
    return res.data;
  },
/* -------- UNARCHIVE -------- */
async unarchiveProduct(id: number): Promise<Product> {
  const res = await axiosClient.post(`/vendor/products/${id}/unarchive`);
  return res.data;
},
/* -------- GET LEADS BY PRODUCT -------- */
async getProductLeads(productId: number): Promise<any[]> {
  const res = await axiosClient.get(
    `/vendor/products/${productId}/lead-details`
  );
  return res.data;
},

};
