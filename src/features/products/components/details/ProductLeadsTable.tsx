import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../../app/hooks";

type Props = {
  productId: number;
};

export default function ProductLeadsTable({ productId }: Props) {
  const navigate = useNavigate();

  /**
   * TEMP:
   * Backend does not yet provide leads per product.
   * Using full leads list for now.
   * Replace with API: /products/:id/leads later.
   */
  const { leads } = useAppSelector((s) => s.leads);

  if (!leads.length) {
    return (
      <div className="bg-white p-8 rounded-xl text-center text-gray-500">
        No leads associated with this product.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold text-lg">Associated Leads</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Lead Name</th>
              <th className="px-6 py-3 text-left">Campaign</th>
              <th className="px-6 py-3 text-left">Owner</th>
              <th className="px-6 py-3 text-left">Manager</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((l) => (
              <tr
                key={l.id}
                className="border-t hover:bg-gray-50 transition cursor-pointer"
                onClick={() => navigate(`/admin/leads/${l.id}`)}
              >
                <td className="px-6 py-4 font-medium text-purple-600">
                  {l.lead_name}
                </td>
                <td className="px-6 py-4">
                  {l.campaign_name || "—"}
                </td>
                <td className="px-6 py-4">
                  {l.owner_name || "—"}
                </td>
                <td className="px-6 py-4">
                  {l.manager_name || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
