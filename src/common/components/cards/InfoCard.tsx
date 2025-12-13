import { Edit2 } from "lucide-react";

export function InfoCard({ product, onEdit, onToggleArchive }: any) {
  return (
    <div className="bg-white shadow-sm p-5 rounded-xl border hover:shadow-md transition relative">
      <div className="flex justify-between">
        <div>
          <h3 className="text-xl font-semibold">{product.name}</h3>
          <p className="text-gray-500">{product.description}</p>

          <div className="mt-2 text-sm">
            <p><b>Price:</b> ₹{product.price}</p>
            <p><b>SKU:</b> {product.sku}</p>
          </div>
        </div>

        {/* STATUS BADGE */}
        <span
          className={`px-3 py-1 text-xs rounded-full h-fit ${
            product.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {product.status}
        </span>
      </div>

      {/* EDIT BUTTON */}
      <button
        onClick={onEdit}
        className="text-purple-600 flex gap-2 mt-4 font-medium"
      >
        <Edit2 size={16} /> Edit
      </button>

      {/* NEW — ARCHIVE TOGGLE BUTTON */}
      <button
        onClick={onToggleArchive}
        className={`mt-2 w-full py-2 rounded-lg border font-medium transition ${
          product.status === "active"
            ? "text-red-600 border-red-600 hover:bg-red-50"
            : "text-green-600 border-green-600 hover:bg-green-50"
        }`}
      >
        {product.status === "active" ? "Archive Product" : "Activate Product"}
      </button>
    </div>
  );
}
