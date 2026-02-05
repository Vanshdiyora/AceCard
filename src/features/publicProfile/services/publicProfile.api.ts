import axiosClient from "../../../services/axiosClient";

export const fetchPublicCard = (
  handle: string,
  type?: string,
  lat?: number,
  lng?: number
) => {
  const params = new URLSearchParams();

  if (type) params.append("type", type);
  if (lat && lng) {
    params.append("lat", lat.toString());
    params.append("lng", lng.toString());
  }

  const query = params.toString() ? `?${params}` : "";
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

export const fetchProfileViewByUsername = (
  username: string,
) => {
  return axiosClient.get(`/view/${username}`);
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