import axios from "../../../services/axiosClient";

export const getVendorMetrics = async (period: string) => {
  const apiPeriod = period === "today" ? "day" : period;

  const res = await axios.get(
    `/vendor/metrics?pipeline_period=${apiPeriod}`
  );

  return res.data;
};