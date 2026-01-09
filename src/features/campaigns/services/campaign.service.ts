import axiosClient from "../../../services/axiosClient";
import type {
  Campaign,
  CampaignListResponse,
} from "../types";
import type { PaginationParams } from "../../../common/types";

const BASE = "/vendor/campaigns";

export const CampaignService = {
  // existing
  getAll(
    params: PaginationParams = { page: 1, page_size: 10 }
  ): Promise<CampaignListResponse> {
    return axiosClient
      .get(BASE, { params })
      .then((res) => res.data);
  },

  // ✅ NEW: fetch campaigns by team member
getByTeamMember(
  memberId: number,
  params: PaginationParams = { page: 1, page_size: 10 }
): Promise<CampaignListResponse> {
  return axiosClient
    .get(BASE, {
      params: {
        ...params,
        teams_member_ids: String(memberId), // ✅ FORCE STRING
      },
    })
    .then((res) => ({
      data: res.data?.data ?? [],
      meta: res.data?.meta ?? null,
    }));
},


  getById(id: number): Promise<Campaign> {
    return axiosClient
      .get(`${BASE}/${id}`)
      .then((res) => res.data);
  },

  create(data: Partial<Campaign>): Promise<Campaign> {
    return axiosClient
      .post(BASE, data)
      .then((res) => res.data);
  },

  update(id: number, data: Partial<Campaign>): Promise<Campaign> {
    return axiosClient
      .put(`${BASE}/${id}`, data)
      .then((res) => res.data);
  },

  archive(id: number): Promise<Campaign> {
    return axiosClient
      .post(`${BASE}/${id}/archive`)
      .then((res) => res.data);
  },
};
