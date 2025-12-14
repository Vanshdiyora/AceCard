import axios from "../../../services/axiosClient";
import type { Notification } from "../types";

const BASE_URL = "/notifications"; // vendor/admin default

export const notificationService = {
  async getMyNotifications(): Promise<Notification[]> {
    const res = await axios.get(BASE_URL);
    return res.data;
  },

  async markAsRead(id: number): Promise<void> {
    await axios.post(`${BASE_URL}/${id}/read`);
  },

  async markAsUnread(id: number): Promise<void> {
    await axios.post(`${BASE_URL}/${id}/unread`);
  },

  async markAllAsRead(): Promise<void> {
    await axios.post(`${BASE_URL}/mark-all-read`);
  },

  async delete(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/${id}`);
  },

  // SUPERADMIN: send notifications
  async sendToTeam(payload: any) {
    await axios.post("/vendor/notifications/send", payload);
  },
};
