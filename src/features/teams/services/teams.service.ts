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

};
