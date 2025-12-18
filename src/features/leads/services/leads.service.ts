import axiosClient from "../../../services/axiosClient";
import type { CreateLeadDto, UpdateLeadDto } from "../types";

const BASE = "/vendor/leads";

export const LeadsService = {
  getLeads: async () => {
    const res = await axiosClient.get(BASE);
    return res.data;
  },

  createLead: async (data: CreateLeadDto) => {
    const res = await axiosClient.post(BASE, data);
    return res.data;
  },

  updateLead: async (id: number, data: UpdateLeadDto) => {
    const res = await axiosClient.put(`${BASE}/${id}`, data);
    return res.data;
  },

  archiveLead: async (id: number) => {
    const res = await axiosClient.post(`${BASE}/${id}/archive`);
    return res.data;
  },
  // services/leads.service.ts
  addNote: async (id: number, note: string) => {
    const res = await axiosClient.post(`${BASE}/vendor/leads/${id}/notes`, { note });
    return res.data;
  }

};
