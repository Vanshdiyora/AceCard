import { formatRupees } from "../../../../common/utils/ruppeeFormater";
import type { Product } from "../../types";

export default function ProductOverviewTab({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="bg-white rounded-2xl border p-6 space-y-6">

      {/* Description + Image Row */}
      <div className="flex flex-col md:flex-row gap-6">

        {/* LEFT: Description */}
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-gray-400">
            Description
          </p>

          <p className="text-sm text-gray-700 mt-2">
            {product.description || "No description provided."}
          </p>
        </div>

        {/* RIGHT: Rectangular Image */}
        <div className="w-full md:w-64 aspect-[16/9] max-h-44 rounded-xl overflow-hidden border bg-gray-100 flex items-center justify-center shrink-0">
          {product.product_img_url ? (
            <img
              src={product.product_img_url}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            <span className="text-sm text-gray-400">
              No Image
            </span>
          )}
        </div>
      </div>

      <Divider />

      {/* Bottom row: Price + Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OverviewItem label="Price">
          <span className="text-xl font-medium">{formatRupees(product.price)}</span>
        </OverviewItem>

        <OverviewItem label="Category">
          <span className="text-xl font-medium">
            {product.category || "-"}
          </span>
        </OverviewItem>
      </div>
    </div>
  );
}

function OverviewItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </span>
      {children}
    </div>
  );
}

function Divider() {
  return <div className="w-full h-px bg-gray-200" />;
}
