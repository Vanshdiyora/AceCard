import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { fetchProducts } from "../../../products/slice";
import type { Lead } from "../../types";

interface Props {
  lead: Lead;
}

export default function LeadProductsTab({ lead }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { products, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts({ page: 1, page_size: 10 }));
    }
  }, [dispatch, products.length]);

  const leadProducts = products.filter((p) =>
    lead.products?.includes(p.id)
  );

  return (
    <div className="space-y-4">
      {loading && (
        <div className="text-sm text-gray-500">Loading products ...</div>
      )}

      {!loading && leadProducts.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-500 text-center">
          No products added to this lead yet.
        </div>
      )}

      {!loading && leadProducts.length > 0 && (
        <div className="space-y-3">
          {leadProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onClick={() => navigate(`/admin/products/${product.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const ProductRow = ({
  product,
  onClick,
}: {
  product: any;
  onClick: () => void;
}) => {
  const currencySymbol =
    product.currency === "INR"
      ? "₹"
      : product.currency === "RUB"
      ? "₽"
      : "$";

  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer bg-white border border-gray-100 rounded-2xl
        px-5 py-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition
      "
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-gray-900">
            {product.name}
          </span>
          <span className="text-xs text-gray-500 mt-1 line-clamp-2">
            {product.description || "No description available"}
          </span>
        </div>

        <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">
          {currencySymbol}
          {product.price?.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
