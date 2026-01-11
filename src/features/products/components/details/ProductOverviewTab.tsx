import type { Product } from "../../types";

export default function ProductOverviewTab({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="bg-white rounded-2xl border p-6 space-y-6">

      {/* Description + Status */}
      <div className="relative">

        <p className="text-xs uppercase tracking-wide text-gray-400">
          Description
        </p>

        <p className="text-sm text-gray-700 mt-2 pr-24">
          {product.description || "No description provided."}
        </p>
      </div>

      <Divider />

      {/* Bottom row: Price + Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <OverviewItem label="Price">
          <span className="text-xl font-medium">₹{product.price}</span>
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
