import type { FetchVendorsParams } from "../slice";
import type { VendorListResponse, VendorItem } from "../types";
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
};
