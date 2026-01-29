import axiosClient from "../../../services/axiosClient";

export const fetchPublicCard = (handle: string) =>
  axiosClient.get(`/card/${handle}?type=direct`);

export const fetchMyProfile = () =>
  axiosClient.get("/profile");

export const updatePublicProfile = (config: any) =>
  axiosClient.put(`/profile?type=individual`, {
    configuration: config,
  });

export const uploadImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);

  return axiosClient.post("/upload", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};