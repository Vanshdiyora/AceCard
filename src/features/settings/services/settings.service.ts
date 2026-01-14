import axios from "../../../services/axiosClient";
import type {
  AccountProfileResponse,
  AccountProfile,
  UpdateAccountProfilePayload,
  LeadFormConfig,
  CRMIntegration
} from "../types";

const BASE_URL = "/profile";

export const settingsService = {
  async getAccountProfile(): Promise<AccountProfile> {
    const res = await axios.get<AccountProfileResponse>(BASE_URL);
    const data = res.data;

    return {
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      role: data.role ?? "",
      avatar_url: data.avatar_url ?? "",
      bio: data.bio ?? "",
      company_description: data.company_description ?? "",
      socials: data.socials ?? null,
      other_links: data.other_links ?? null,
      display_settings: data.display_settings ?? null,
      address: (data as any).address ?? "",
    };
  },

  async updateAccountProfile(
    payload: UpdateAccountProfilePayload
  ): Promise<AccountProfile> {
    const res = await axios.put<AccountProfileResponse>(BASE_URL, payload);
    const data = res.data;

    return {
      name: data.name ?? "",
      email: data.email ?? "",
      phone: data.phone ?? "",
      role: data.role ?? "",
      avatar_url: data.avatar_url ?? "",
      bio: data.bio ?? "",
      company_description: data.company_description ?? "",
      socials: data.socials ?? null,
      other_links: data.other_links ?? null,
      display_settings: data.display_settings ?? null,
      address: (data as any).address ?? "",
    };
  },

  // ---------- Lead Configuration ----------
  async getLeadsConfig(): Promise<LeadFormConfig> {
    const res = await axios.get<any>("/vendor/leads-config");
    const raw = res.data || {};
    const cfg = raw.config || {};

    return {
      customFields: cfg.customFields ?? [],
    };
  },

  async updateLeadsConfig(payload: LeadFormConfig): Promise<LeadFormConfig> {
    const res = await axios.put<any>("/vendor/leads-config", payload);
    const raw = res.data || {};
    const cfg = raw.config || payload;

    return {
      customFields: cfg.customFields ?? payload.customFields,
    };
  },

  // ---------- Suggested Questions ----------
  async listSuggestedQuestions() {
    const res = await axios.get("/vendor/suggested-questions/");
    return res.data ?? [];
  },

  async createSuggestedQuestion(question: string) {
    const res = await axios.post("/vendor/suggested-questions/", { question });
    return res.data;
  },

  async updateSuggestedQuestion(id: number, question: string) {
    const res = await axios.put(`/vendor/suggested-questions/${id}`, { question });
    return res.data;
  },

  async deleteSuggestedQuestion(id: number) {
    await axios.delete(`/vendor/suggested-questions/${id}`);
    return id;
  },
  async resetPassword(payload: { old_password: string; new_password: string }) {
    await axios.put("/profile/password", payload);
  },
  // ---------- CRM Integrations ----------

async listIntegrations(): Promise<CRMIntegration[]> {
  const res = await axios.get("/vendor/integrations");
  return res.data;
},

async getAuthUrl(provider: string) {
  const res = await axios.get(`/vendor/integrations/${provider}/auth-url`);
  return res.data.url;
},

async exchangeCode(provider: string, payload: any) {
  const res = await axios.post(`/vendor/integrations/${provider}/exchange`, payload);
  return res.data;
},

async disconnectIntegration(provider: string) {
  await axios.delete(`/vendor/integrations/${provider}`);
},

};
