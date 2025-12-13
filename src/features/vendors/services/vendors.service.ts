import axios from "../../../services/axiosClient";
import type { VendorItem } from "../types";

const BASE = "/admin/vendors";

export const vendorsService = {
  async list(): Promise<VendorItem[]> {
    const res = await axios.get(BASE);
    return res.data;
  },

  async create(data: any): Promise<VendorItem> {
    const res = await axios.post(BASE, data);
    return res.data;
  },

  async update(id: number, data: any): Promise<VendorItem> {
    const res = await axios.put(`${BASE}/${id}`, data);
    return res.data;
  },

  async updateSeats(id: number, seats: number): Promise<VendorItem> {
    const res = await axios.patch(`${BASE}/${id}/seats`, { seats_appointed:seats });
    return res.data;
  },

  async archive(id: number): Promise<void> {
    await axios.post(`${BASE}/${id}/archive`);
  },

  async notify(payload: any): Promise<any> {
    const res = await axios.post(`${BASE}/notify`, payload);
    return res.data;
  }
};
