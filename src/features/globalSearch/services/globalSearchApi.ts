import axiosClient from "../../../services/axiosClient";

type ApiResult = {
  id: number;
  name: string;
  type: string;
  description?: string;
};

export async function searchGlobal(
  query: string,
  mode: "admin" | "super_admin"
) {
  if (!query) return [];

  const endpoint = mode === "super_admin" ? "/vendor/search" : "/vendor/search";

  const { data } = await axiosClient.get(endpoint, {
    params: { q: query },
  });

 return (data.results as ApiResult[]).map(item => ({
  id: String(item.id),
  label: item.name,
  type: item.type as any,
  route: buildRoute(item, mode),
  description: item.description,
}));

}
function buildRoute(item: ApiResult, mode: "admin" | "super_admin") {
  const base = mode === "super_admin" ? "/super_admin" : "/admin";

  switch (item.type) {
    case "campaign":
      return `${base}/campaigns/${item.id}`;
    case "lead":
      return `${base}/leads/${item.id}`;
    case "vendor":
      return `${base}/vendors/${item.id}`;
    case "team":
      return `${base}/team/${item.id}`;
    case "product":
      return `${base}/products/${item.id}`;
    default:
      return base;
  }
}
