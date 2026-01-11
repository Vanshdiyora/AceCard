import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchProductById, clearSelectedProduct } from "../slice";

import ProductOverviewTab from "../components/details/ProductOverviewTab";
import ProductLeadsTable from "../components/details/ProductLeadsTable";
import BrandLoader from "../../../common/ui/BrandLoader";

import type { Product } from "../types";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const passedProduct = (location.state as { product?: Product })?.product;

  const { selectedProduct, loading } = useAppSelector((s) => s.products);

  const product = selectedProduct || passedProduct;

  /**
   * Fetch only if product not already available
   */
  useEffect(() => {
    if (!product && id) {
      dispatch(fetchProductById(Number(id)));
    }

    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, product, dispatch]);

  /* -----------------------------
     Loading state
  ------------------------------ */
  if (loading && !product) {
    return (
      <div className="flex items-center justify-center h-full">
        <BrandLoader message="Loading product..." />
      </div>
    );
  }

  /* -----------------------------
     Not found state
  ------------------------------ */
  if (!loading && !product) {
    return (
      <>
        <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mt-6 text-sm text-gray-500 hover:text-black"
      >
        <ArrowLeft size={16} />
        Back to Products
      </button>
      <div className="flex items-center justify-center h-full text-red-500">
        Product not found
      </div>
      </>
    );
  }

  /* -----------------------------
     Render
  ------------------------------ */
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
      <div className="bg-white rounded-2xl border p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Identity */}
        <div>
          <h2 className="text-2xl font-semibold leading-tight">
            {product!.name}
          </h2>
        </div>

        {/* Status */}
        <div className="flex items-center">
          <span
            className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${
              product!.status === "active"
                ? "bg-green-100 text-green-700"
                : "bg-gray-300 text-gray-800"
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current opacity-70" />
            {product!.status}
          </span>
        </div>
      </div>

      {/* Overview */}
      <ProductOverviewTab product={product!} />

      {/* Leads Table */}
      <ProductLeadsTable productId={product!.id} />
    </div>
  );
}
