import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit2, Archive, CheckCircle } from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  fetchProductById,
  clearSelectedProduct,
  updateProduct,
  archiveProduct,
  unarchiveProduct
} from "../slice";

import ProductOverviewTab from "../components/details/ProductOverviewTab";
import ProductLeadsTable from "../components/details/ProductLeadsTable";
import BrandLoader from "../../../common/ui/BrandLoader";
import DetailPageHeader from "../../../common/components/layout/DetailPageHeader";
import ConfirmationModal from "../../../common/ui/ConfirmationModal";
import ProductFormModal from "../components/ProductFormModal";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";

export default function ProductDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedProduct: product, loading } = useAppSelector((s) => s.products);

  const [processing, setProcessing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [result, setResult] = useState({
    open: false,
    success: true,
    message: "",
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(Number(id))).finally(() => {
        setHasFetched(true);
      });
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch]);

  /* ---------- Initial load ---------- */
  if ((!hasFetched || loading) && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BrandLoader message="Loading product..." />
      </div>
    );
  }

  /* ---------- Not found ---------- */
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

  const isArchived = product!.status === "archived";

  const handleConfirm = async () => {
    try {
      setProcessing(true);

      if (isArchived) {
        await dispatch(unarchiveProduct(product!.id)).unwrap();
      } else {
        await dispatch(archiveProduct(product!.id)).unwrap();
      }

      setResult({
        open: true,
        success: true,
        message: isArchived
          ? "Product activated successfully"
          : "Product archived successfully",
      });
    } catch (err: any) {
      setResult({
        open: true,
        success: false,
        message: err?.message ?? "Action failed",
      });
    } finally {
      setProcessing(false);
      setConfirmOpen(false);
    }
  };


  return (
    <div className="p-6">
      <BlockingLoader show={processing} />

      <ResultModal
        open={result.open}
        success={result.success}
        message={result.message}
        onClose={() => setResult({ ...result, open: false })}
      />

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-6"
      >
        <ArrowLeft size={16} />
        Back to Products
      </button>

      <DetailPageHeader
        title={product!.name}
        subtitle="Product"
        avatar={product!.name[0]}
        status={{
          label: product!.status,
          variant: isArchived ? "archived" : "active",
        }}
        actions={
          <>
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50"
            >
              <Edit2 size={16} /> Edit
            </button>

            <button
              onClick={() => setConfirmOpen(true)}
              disabled={processing}
              className={`flex items-center gap-2 px-4 py-2 text-sm border rounded-lg disabled:opacity-50 ${isArchived
                ? "text-green-600 border-green-200 hover:bg-green-50"
                : "text-red-600 border-red-200 hover:bg-red-50"
                }`}
            >
              {isArchived ? (
                <>
                  <CheckCircle size={16} /> Activate
                </>
              ) : (
                <>
                  <Archive size={16} /> Archive
                </>
              )}
            </button>
          </>
        }
      />

      <div className="mb-6" />

      <ProductOverviewTab product={product!} />
      <ProductLeadsTable productId={product!.id} />

      <ProductFormModal
        open={editOpen}
        product={product!}
        onClose={() => setEditOpen(false)}
        onSubmit={async (data) => {
          try {
            setProcessing(true);
            await dispatch(updateProduct({ id: product!.id, data })).unwrap();
            setResult({
              open: true,
              success: true,
              message: "Product updated successfully",
            });
            setEditOpen(false);
          } catch (err: any) {
            setResult({
              open: true,
              success: false,
              message: err?.message ?? "Update failed",
            });
          } finally {
            setProcessing(false);
          }
        }}
      />

      <ConfirmationModal
        open={confirmOpen}
        title={isArchived ? "Activate Product" : "Archive Product"}
        message={
          isArchived
            ? `Are you sure you want to activate "${product!.name}"?`
            : `Are you sure you want to archive "${product!.name}"?`
        }
        confirmLabel={isArchived ? "Activate" : "Archive"}
        confirmVariant={isArchived ? "success" : "danger"}
        loading={processing}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
