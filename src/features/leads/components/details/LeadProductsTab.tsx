// components/details/LeadProductsTab.tsx
import { useEffect } from "react";
import { Plus } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchProducts } from "../../../products/slice";
import type { Lead } from "../../types";

interface Props {
  lead: Lead;
}

export default function LeadProductsTab({ lead }: Props) {
  const dispatch = useAppDispatch();
  const { products, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  const leadProducts = products.filter((p) =>
    lead.products?.includes(p.id)
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Products</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm flex items-center gap-2">
          <Plus size={14} /> Add Product
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Loading products...</div>
      )}

      {!loading && leadProducts.length === 0 && (
        <div className="bg-white border rounded-xl p-6 text-sm text-gray-500 text-center">
          No products added to this lead yet.
        </div>
      )}

      {!loading && leadProducts.length > 0 && (
        <div className="bg-white border rounded-xl divide-y">
          {leadProducts.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

const ProductRow = ({ product }: any) => (
  <div className="px-5 py-4">
    {/* Top Row: Name + Price */}
    <div className="flex justify-between items-center">
      <p className="font-medium text-sm">{product.name}</p>
      <p className="font-medium text-sm">
        ${product.price?.toLocaleString()}
      </p>
    </div>

    {/* Description */}
    <p className="text-xs text-gray-500 mt-1">
      {product.description || "No description available"}
    </p>
  </div>
);
