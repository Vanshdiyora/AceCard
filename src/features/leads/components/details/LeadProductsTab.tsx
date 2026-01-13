import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { lookupProducts } from "../../../products/slice";
import type { Lead } from "../../types";
import BrandLoader from "../../../../common/ui/BrandLoader";
import type { ProductLookup } from "../../../products/types";

interface Props {
  lead: Lead;
}

export default function LeadProductsTab({ lead }: Props) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { lookup: products, loading } = useAppSelector((s) => s.products);

  useEffect(() => {
    if (lead.products?.length) {
      dispatch(lookupProducts(lead.products));
    }
  }, [dispatch, lead.products]);

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex items-center justify-center min-h-[350px]">
          <BrandLoader />
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-500 text-center">
          No products added to this lead yet.
        </div>
      )}

      {!loading && products.length > 0 && (
        <div className="space-y-3">
          {products.map((product) => (
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
  product: ProductLookup;
  onClick: () => void;
}) => {
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
        </div>
      </div>
    </div>
  );
};
