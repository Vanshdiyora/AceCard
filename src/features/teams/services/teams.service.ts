import axios from "../../../services/axiosClient";
import type {
  TeamMember,
  TeamListResponse,
  CreateTeamMemberDTO,
  UpdateTeamMemberDTO,
  UpdatePermissionsDTO,
} from "../types";
import type { PaginationParams } from "../../../common/types";

const BASE_URL = "/vendor/team";

export interface SubscriptionResponse {
  vendor_id: number;
  seats_purchased: number;
  seats_used: number;
  seats_free: number;
  subscription_status: "active" | "expired" | string;
  renewal_date: string;
  payment_status: string;
}


export const teamService = {
  async getTeam(
    params: PaginationParams & {
      search?: string;
      role?: "manager" | "sales_rep";
      status?: string;
    } = { page: 1, page_size: 10 }
  ): Promise<TeamListResponse> {
    const res = await axios.get(BASE_URL, { params });
    return res.data;
  },

  async getMemberById(id: number): Promise<TeamMember> {
    const res = await axios.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  async createMember(
    data: CreateTeamMemberDTO
  ): Promise<TeamMember> {
    const res = await axios.post(BASE_URL, data);
    return res.data;
  },

  async updateMember(
    id: number,
    data: UpdateTeamMemberDTO
  ): Promise<TeamMember> {
    const res = await axios.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async updatePermissions(
    id: number,
    data: UpdatePermissionsDTO
  ): Promise<TeamMember> {
    const res = await axios.put(
      `${BASE_URL}/${id}/permissions`,
      { permissions: data }
    );
    return res.data;
  },

  async deleteMember(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
  },

  async getSubscription(): Promise<SubscriptionResponse> {
    const res = await axios.get("/vendor/subscription");
    return res.data;
  },

  async transferLeads(payload: {
    from_rep_id: number;
    to_rep_id: number;
    lead_ids: number[];
  }) {
    const res = await axios.post("/vendor/leads/transfer", payload);
    return res.data;
  },
  async getMemberAnalytics(
    id: number,
    pipeline_period: "day" | "week" | "month" | "year" = "month"
  ) {
    const res = await axios.get(`${BASE_URL}/${id}`, {
      params: { pipeline_period },
    });
    return res.data;
  },
async transferSalespersons(payload: {
  from_manager_id: number;
  to_manager_id: number;
}) {
  const res = await axios.post(
    `${BASE_URL}/transfer-salespersons`,
    payload
  );
  return res.data;
}
};
