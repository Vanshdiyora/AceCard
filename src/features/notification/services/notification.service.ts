import axiosClient from "../../../services/axiosClient";
import type { Notification } from "../types";

const BASE = "/notifications";

export const notificationService = {
  getMyNotifications: async (): Promise<{
    data: Notification[];
    meta: any;
  }> => {
    const res = await axiosClient.get(BASE);
    return res.data;
  },

  markAsRead: async (id: number) => {
    await axiosClient.put(`${BASE}/${id}/read`);
  },

  markAllAsRead: async () => {
    await axiosClient.put(`${BASE}/read-all`);
  },

  // 🔹 Admin → Vendors
  sendToVendors: async (payload: {
    vendor_ids: number[];
    title: string;
    body: string;
    in_app: boolean;
    email: boolean;
  }) => {
    await axiosClient.post("/admin/vendors/notify", payload);
  },
  markAsArchived: async (id: number) => {
  await axiosClient.put(`${BASE}/${id}/archive`);
},
markAllAsArchived: async () => {
  await axiosClient.put(`${BASE}/archive-all`);
},
sendToTeam: async (payload: {
  recipient_type: string;
  target_user_ids?: number[];
  category?: string;
  message_title: string;
  message_body: string;
}) => {
  await axiosClient.post("/vendor/notifications/send", payload);
},

};
