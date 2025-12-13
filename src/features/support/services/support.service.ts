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

// POST — Reply to a support ticket
export const replyToSupportTicket = async (
  ticketId: number,
  payload: { message: string; status: string }
) => {
  const res = await axiosClient.post(
    `/admin/support/${ticketId}/reply`,
    payload
  );
  return res.data;
};


// GET — Admin fetch all support tickets
export const getAllSupportTickets = async () => {
  const res = await axiosClient.get(`/admin/support/requests`);
  return res.data;
};
