import axios from "../../../services/axiosClient";

export const getVendorMetrics = async () => {
  const res = await axios.get("/vendor/metrics");
  return res.data;
};
