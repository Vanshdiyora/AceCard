import axiosClient from "../../../services/axiosClient";
import type {
  UpdateSubscriptionPayload,
  PaymentsQuery,
} from "../types";

/* -------------------- GET PAYMENTS (PAGINATED) -------------------- */
export const getPaymentsSummaryApi = async (
  params: PaymentsQuery
) => {
  const query = new URLSearchParams();

  query.append("page", params.page.toString());
  query.append("page_size", params.page_size.toString());

  if (params.search) query.append("search", params.search);
  if (params.sort_by) query.append("sort_by", params.sort_by);
  if (params.sort_order) query.append("sort_order", params.sort_order);
  if (params.status) query.append("status", params.status);

  const res = await axiosClient.get(
    `/admin/payments?${query.toString()}`
  );

  return res.data;
};

/* -------------------- MARK PAID -------------------- */
export const markVendorPaidApi = async (paymentId: number) => {
  const res = await axiosClient.post(
    `/admin/payments/${paymentId}/mark-paid`
  );
  return res.data;
};

/* -------------------- MARK UNPAID -------------------- */
export const markVendorUnpaidApi = async (
  paymentId: number
) => {
  const res = await axiosClient.post(
    `/admin/payments/${paymentId}/mark-unpaid`
  );
  return res.data;
};

/* -------------------- UPDATE SUBSCRIPTION -------------------- */
export const updateVendorSubscriptionApi = async (
  payload: UpdateSubscriptionPayload
) => {
  const res = await axiosClient.post(
    "/admin/payments/update-subscription",
    payload
  );
  return res.data;
};

/* -------------------- UPDATE SEATS -------------------- */
export const updateSeatsApi = async (
  vendorId: number,
  seats: number
) => {
  const res = await axiosClient.patch(
    `/admin/vendors/${vendorId}/seats`,
    { seats }
  );
  return res.data;
};

/* -------------------- PAYMENT HISTORY -------------------- */
export const getPaymentHistoryApi = async (vendorId: number) => {
  const res = await axiosClient.get(
    `/admin/payments/history/${vendorId}`
  );
  return res.data;
};

/* -------------------- ARCHIVE VENDOR -------------------- */
export const archiveVendorApi = async (vendorId: number) => {
  const res = await axiosClient.post(
    `/admin/payments/archive/${vendorId}`
  );
  return res.data;
};