import type { FetchVendorsParams } from "../slice";
import type { VendorListResponse, VendorItem, SearchVendorTeamParams, VendorTeamResponse } from "../types";
import api from "../../../services/axiosClient"; // adjust path if needed
import type { AxiosResponse } from "axios";

export const vendorsService = {
  list: async (params: FetchVendorsParams & { search?: string }): Promise<VendorListResponse> => {
    const res = await api.get("/admin/vendors", { params });
    return res.data;
  },

  getById: async (id: number): Promise<VendorItem> => {
    const res: AxiosResponse<VendorItem> = await api.get(`/admin/vendors/${id}`);
    return res.data;
  },

  create: async (data: Partial<VendorItem>): Promise<VendorItem> => {
    const res: AxiosResponse<VendorItem> = await api.post("/admin/vendors", data);
    return res.data;
  },

  update: async (id: number, data: Partial<VendorItem>): Promise<VendorItem> => {
    const res: AxiosResponse<VendorItem> = await api.put(`/admin/vendors/${id}`, data);
    return res.data;
  },

  updateSeats: async (id: number, seats: number): Promise<VendorItem> => {
    const res: AxiosResponse<VendorItem> = await api.patch(`/admin/vendors/${id}/seats`, { seats_appointed: seats });
    return res.data;
  },

  archive: async (id: number): Promise<void> => {
    await api.post(`/admin/vendors/${id}/archive`);
  },

  unarchive: async (id: number) => {
    await api.post(`/admin/vendors/${id}/unarchive`);
  },

  notify: async (payload: any): Promise<void> => {
    await api.post(`/admin/vendors/notify`, payload);
  },

  teamSearch: async (
    vendorId: number,
    params: SearchVendorTeamParams
  ): Promise<VendorTeamResponse> => {
    const res = await api.post(
      `/admin/vendors/${vendorId}/team/search`,
      params
    );
    return res.data;
  },

  search: async (
    params: FetchVendorsParams & { q?: string }
  ): Promise<VendorListResponse> => {
    const res = await api.get("/admin/search", {
      params: {
        q: params.q,
        page: params.page,
        page_size: params.page_size,
        sort_by: params.sort_by,
        sort_order: params.sort_order,
      },
    });

    const response = res.data;

    return {
      data: response.results ?? [],
      meta: {
        page: response.page ?? 1,
        page_size: response.limit ?? 10,
        total_count: response.total ?? 0,
        total_pages: Math.ceil(
          (response.total ?? 0) / (response.limit ?? 10)
        ),
        has_next:
          (response.page ?? 1) <
          Math.ceil((response.total ?? 0) / (response.limit ?? 10)),
        has_previous: (response.page ?? 1) > 1,
      },
    };
  },
};
