import axiosClient from "../../../services/axiosClient";
import type {
  SupportListResponse,
  SupportTicket,
  SupportReply,
} from "../types";

import type { PaginationParams } from "../../../common/types";

/* -------- ADMIN: Vendor-specific tickets -------- */
export const getVendorSupportTickets = async (
  vendorId: number,
    params: PaginationParams = { page: 1, page_size: 10 }
): Promise<SupportListResponse> => {
  const res = await axiosClient.get(
    `/admin/vendors/${vendorId}/support`,
    {params}
  );
  return res.data;
};

/* -------- VENDOR: Create ticket -------- */
export const createSupportTicket = async (
  payload: Partial<SupportTicket>
): Promise<SupportTicket> => {
  const res = await axiosClient.post(
    "/vendor/support",
    payload
  );
  return res.data;
};

/* -------- ADMIN: Reply to ticket -------- */
export const replyToSupportTicket = async (
  ticketId: number,
  payload: { message: string; status: string }
): Promise<SupportReply> => {
  const res = await axiosClient.post(
    `/admin/support/${ticketId}/reply`,
    payload
  );
  return res.data;
};

/* -------- ADMIN: All tickets -------- */
export const getAllSupportTickets = async ( params: PaginationParams = { page: 1, page_size: 10 } ): Promise<SupportListResponse> => {
  const res = await axiosClient.get(
    `/admin/support/requests` , {params}
  );
  return res.data;
};
