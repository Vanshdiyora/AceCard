import axios from "../../../services/axiosClient";
import type {
  CreateTeamMemberDTO,
  UpdatePermissionsDTO,
  UpdateTeamMemberDTO,
  TeamMember,
} from "../types";

const BASE_URL = "/vendor/team";

export const teamService = {
  async getTeam(): Promise<TeamMember[]> {
    const res = await axios.get(BASE_URL);
    return res.data;
  },

  async createMember(data: CreateTeamMemberDTO): Promise<TeamMember> {
    const res = await axios.post(BASE_URL, data);
    return res.data;
  },

  async updateMember(id: number, data: UpdateTeamMemberDTO) {
    const res = await axios.put(`${BASE_URL}/${id}`, data);
    return res.data;
  },

  async updatePermissions(id: number, data: UpdatePermissionsDTO) {
    const res = await axios.put(`${BASE_URL}/${id}/permissions`, data);
    return res.data;
  },

  async suspendMember(id: number) {
    const res = await axios.delete(`${BASE_URL}/${id}`);
    return res.data;
  },
};
