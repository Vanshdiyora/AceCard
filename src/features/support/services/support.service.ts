import axiosClient from "../../../services/axiosClient";

// GET — Admin fetch vendor-specific support tickets
export const getVendorSupportTickets = async (vendorId: number) => {
  const res = await axiosClient.get(`/admin/vendors/${vendorId}/support`);
  return res.data;
};

// POST — Vendor create a new support ticket
export const createSupportTicket = async (payload: any) => {
  const res = await axiosClient.post("/vendor/support", payload);
  return res.data;
};
