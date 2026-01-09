import axios from "../../../services/axiosClient";
import type {
  VendorItem,
  VendorListResponse,
} from "../types";

const BASE = "/admin/vendors";

export const vendorsService = {
  async list(
    params: { page?: number; page_size?: number } = {
      page: 1,
      page_size: 10,
    }
  ): Promise<VendorListResponse> {
    const res = await axios.get(BASE, { params });
    return res.data; // { data, meta }
  },

  async getById(id: number): Promise<VendorItem> {
  const res = await axios.get(`${BASE}/${id}`);
  return res.data;
},


  async create(data: Partial<VendorItem>): Promise<VendorItem> {
    const res = await axios.post(BASE, data);
    return res.data;
  },

  async update(
    id: number,
    data: Partial<VendorItem>
  ): Promise<VendorItem> {
    const res = await axios.put(`${BASE}/${id}`, data);
    return res.data;
  },

  async updateSeats(
    id: number,
    seats: number
  ): Promise<VendorItem> {
    const res = await axios.patch(
      `${BASE}/${id}/seats`,
      { seats_appointed: seats }
    );
    return res.data;
  },

  async archive(id: number): Promise<void> {
    await axios.post(`${BASE}/${id}/archive`);
  },

  async notify(payload: any): Promise<any> {
    const res = await axios.post(`${BASE}/notify`, payload);
    return res.data;
  },
};
