import axios from "../../../services/axiosClient";

export const getVendorMetrics = async (period: string) => {
  const res = await axios.get(
    `/vendor/metrics?pipeline_period=${period}`
  );
  return res.data;
};
