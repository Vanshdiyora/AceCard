import axios from "../../../services/axiosClient";
import type {
  AccountProfileResponse,
  AccountProfile,
  UpdateAccountProfilePayload,
} from "../types";

const BASE_URL = "/profile";

export const settingsService = {
  async getAccountProfile(): Promise<AccountProfile> {
    const res = await axios.get<AccountProfileResponse>(BASE_URL);

    const data = res.data;

    return {
      vendorName: data.name,
      pocName: data.job_title ?? "",
      email: data.email,
      phone: data.phone,
    };
  },

  async updateAccountProfile(payload: UpdateAccountProfilePayload): Promise<AccountProfile> {
    const apiBody = {
      name: payload.vendorName,
      job_title: payload.pocName,
      email: payload.email,
      phone: payload.phone,
    };

    const res = await axios.put<AccountProfileResponse>(BASE_URL, apiBody);

    const data = res.data;

    return {
      vendorName: data.name,
      pocName: data.job_title ?? "",
      email: data.email,
      phone: data.phone,
    };
  },
};
