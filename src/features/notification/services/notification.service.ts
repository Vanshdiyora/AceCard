import axiosClient from "../../../services/axiosClient";
import type { Notification } from "../types";

const BASE = "/notifications";

export const notificationService = {
  getMyNotifications: async (): Promise<Notification[]> => {
    const res = await axiosClient.get(BASE);
    return res.data;
  },

  markAsRead: async (id: number) => {
    await axiosClient.post(`${BASE}/${id}/read`);
  },

  markAsUnread: async (id: number) => {
    await axiosClient.post(`${BASE}/${id}/unread`);
  },

  markAllAsRead: async () => {
    await axiosClient.post(`${BASE}/read-all`);
  },

  delete: async (id: number) => {
    await axiosClient.delete(`${BASE}/${id}`);
  },
};
