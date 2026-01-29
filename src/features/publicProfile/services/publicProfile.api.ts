import axiosClient from "../../../services/axiosClient";

export const fetchPublicCard = (handle: string) =>
  axiosClient.get(`/card/${handle}?type=direct`);

export const updatePublicProfile = (config: any) =>
  axiosClient.put(`/profile?type=individual`, {
    configuration: config,
  });
