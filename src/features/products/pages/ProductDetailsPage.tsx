import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchProductById, clearSelectedProduct } from "../slice";

import ProductOverviewTab from "../components/details/ProductOverviewTab";
import ProductLeadsTable from "../components/details/ProductLeadsTable";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedProduct, loading } = useAppSelector(
    (s) => s.products
  );

  /**
   * ✅ Fetch product on page load / refresh
   */
  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(Number(id)));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch]);

  if (loading || !selectedProduct) {
    return <div className="p-6">Loading product...</div>;
  }

  const product = selectedProduct;

  return (
    <div className="p-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black"
      >
        <ArrowLeft size={16} />
        Back to Products
      </button>

      {/* Header */}
      <div>
        <h2 className="text-3xl font-semibold">{product.name}</h2>
        <p className="text-gray-500">
          {product.category}
        </p>
      </div>

      {/* Overview */}
      <ProductOverviewTab product={product} />

      {/* Leads Table */}
      <ProductLeadsTable productId={product.id} />
    </div>
  );
}
