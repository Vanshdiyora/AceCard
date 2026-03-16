import { useNavigate } from "react-router-dom";
import type { Lead } from "../../types";
import { formatRupees } from "../../../../common/utils/ruppeeFormater";

interface Props {
  lead: Lead;
}

export default function LeadProductsTab({ lead }: Props) {
  const navigate = useNavigate();

  const products = lead.products || [];

  return (
    <div className="space-y-4">
      {products.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-sm text-gray-500 text-center">
          No products added to this lead yet.
        </div>
      )}

      {products.length > 0 && (
        <div className="space-y-3">
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              onClick={() =>
                navigate(`/admin/products/${product.product_id ?? product.id}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ======================================================
   PRODUCT ROW
====================================================== */

const ProductRow = ({
  product,
  onClick,
}: {
  product: {
    id: number;
    product_id?: number;
    name: string;
    quantity?: number;
    price?: number;
  };
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

          <div className="text-xs text-gray-500 mt-1">
            {product.quantity != null && (
              <span className="mr-3">Qty: {product.quantity}</span>
            )}
            {product.price != null && (
              <span>Price: {formatRupees(product.price)}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
