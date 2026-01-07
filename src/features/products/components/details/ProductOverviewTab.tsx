import type { Product } from "../../types";

export default function ProductOverviewTab({
  product,
}: {
  product: Product;
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-gray-500 text-sm">Price</p>
        <p className="text-2xl font-semibold">₹{product.price}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-gray-500 text-sm">Category</p>
        <p className="text-2xl font-semibold">{product.category}</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-gray-500 text-sm">Status</p>
        <p className="text-2xl font-semibold capitalize">
          {product.status}
        </p>
      </div>
    </div>
  );
}
