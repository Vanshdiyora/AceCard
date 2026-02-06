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

  if (params.search) {
    query.append("search", params.search);
  }

  if (params.sort) {
    query.append("sort", params.sort);
  }

  const res = await axiosClient.get(
    `/admin/payments?${query.toString()}`
  );

  return res.data;
};

/* -------------------- UPDATE SUBSCRIPTION -------------------- */
export const updateVendorSubscriptionApi = async (
  payload: UpdateSubscriptionPayload
) => {
  const res = await axiosClient.post(
    "/admin/payments/update",
    payload
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
