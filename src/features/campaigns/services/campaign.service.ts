import axiosClient from "../../../services/axiosClient";
import type { Campaign } from "../types";

const BASE = "/vendor/campaigns";

export const CampaignService = {
  getAll(): Promise<Campaign[]> {
    return axiosClient.get(BASE).then((res) => res.data);
  },

  getById(id: number): Promise<Campaign> {
    return axiosClient.get(`${BASE}/${id}`).then((res) => res.data);
  },

  create(data: Partial<Campaign>): Promise<Campaign> {
    return axiosClient.post(BASE, data).then((res) => res.data);
  },

  update(id: number, data: Partial<Campaign>): Promise<Campaign> {
    return axiosClient.put(`${BASE}/${id}`, data).then((res) => res.data);
  },

  archive(id: number): Promise<Campaign> {
    return axiosClient.post(`${BASE}/${id}/archive`).then((res) => res.data);
  },
};
