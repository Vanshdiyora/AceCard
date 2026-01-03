import axiosClient from "../../../services/axiosClient";
import type {
  Lead,
  CreateLeadDto,
  UpdateLeadDto,
  LeadsApiResponse,
  LeadNote
} from "../types";

const BASE = "/vendor/leads";

export const LeadsService = {
  async getLeads(page = 1, pageSize = 10): Promise<LeadsApiResponse> {
    const res = await axiosClient.get(BASE, {
      params: {
        page,
        page_size: pageSize,
      },
    });

    if (!res.data?.data || !res.data?.meta) {
      throw new Error("Invalid leads response");
    }

    return res.data;
  },

  async createLead(data: CreateLeadDto): Promise<Lead> {
    const res = await axiosClient.post(BASE, data);
    return res.data;
  },

  async updateLead(id: number, data: UpdateLeadDto): Promise<Lead> {
    const res = await axiosClient.put(`${BASE}/${id}`, data);
    return res.data;
  },

  async archiveLead(id: number): Promise<void> {
    await axiosClient.post(`${BASE}/${id}/archive`);
  },

  async addNote(id: number, note: string): Promise<Lead> {
    const res = await axiosClient.post(`${BASE}/${id}/notes`, { note });
    console.log(res)
    return res.data;
  },

  async getLeadById(id: number) {
  return axiosClient.get(`/vendor/leads/${id}`);
},

  
  async getNotes(leadId: number): Promise<LeadNote[]> {
    const res = await axiosClient.get(`${BASE}/${leadId}/notes`);

    if (!Array.isArray(res.data?.data)) {
      console.error("Invalid notes response:", res.data);
      return [];
    }

    return res.data.data;
  },
};
