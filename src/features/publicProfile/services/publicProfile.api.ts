import axiosClient from "../../../services/axiosClient";

export const fetchPublicCard = (
  handle: string,
  type?: string
) => {
  const query = type ? `?type=${type}` : "";
  return axiosClient.get(`/card/${handle}${query}`);
};


export const fetchMyProfile = () =>
  axiosClient.get("/profile");

export const updatePublicProfile = (config: any) =>
  axiosClient.put(`/profile`, {
    configuration: config,
  });

  export const updatePublicProfileByUsername = (
  username: string,
  config: any
) => {
  return axiosClient.put(`/profile/edit/${username}`, {
    configuration: config,
  });
};


export const sendVisitorConnect = (handle: string, payload: any) => {
  return axiosClient.post(`/card/${handle}/connect`, payload);
};

export const uploadImage = (file: File) => {
  const form = new FormData();
  form.append("file", file);

  return axiosClient.post("/upload", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};