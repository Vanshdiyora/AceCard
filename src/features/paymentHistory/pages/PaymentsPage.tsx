import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useNavigate } from "react-router-dom";

import {
  fetchPayments,
  archiveVendor,
  markVendorUnpaid,
  updateSubscription,
} from "../slice";

import {
  updatePriceLocal,
  markUnpaidLocal,
} from "../slice";

import PaymentsRowActionsDropdown from "../components/PaymentsRowActionsDropdown";
import UpdateSeatsSubscriptionModal from "../components/UpdateSeatsSubscriptionModal";
import UnpaidConfirmationModal from "../components/UnpaidConfirmationModal";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import ArchiveConfirmationModal from "../components/ArchiveConfirmationModal";
import UpdatePricePerSeatModal from "../components/UpdatePricePerSeatModal";

import type { VendorPayment } from "../types";

/* -------------------------------- helpers -------------------------------- */

function getErrorMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  return "Something went wrong";
}

/* -------------------------------------------------------------------------- */

export default function PaymentsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { list, loading, meta, error } = useAppSelector(
    (s: any) => s.payments
  );

  /* ------------------------------- query state ------------------------------ */

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<
    "days_left" | "total_amount" | "seats" | "alphabetical"
  >("days_left");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [unpaidOpen, setUnpaidOpen] = useState(false);
  const [unpaidVendor, setUnpaidVendor] =
    useState<VendorPayment | null>(null);

  /* ------------------------------- ui state -------------------------------- */

  const [processing, setProcessing] = useState(false);

  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  /* ------------------------------- modals ---------------------------------- */

  const [seatsOpen, setSeatsOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const [seatsVendor, setSeatsVendor] =
    useState<VendorPayment | null>(null);

  const [selectedVendor, setSelectedVendor] =
    useState<VendorPayment | null>(null);

  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiveVendorTarget, setArchiveVendorTarget] =
    useState<VendorPayment | null>(null);

  /* -------------------------------- fetch ---------------------------------- */

  useEffect(() => {
    dispatch(
      fetchPayments({
        page,
        page_size: pageSize,
        search: search.trim() || undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      })
    );
  }, [dispatch, page, pageSize, search, sortBy, sortOrder]);

  /* -------------------------------- columns -------------------------------- */

  const columns: Column<VendorPayment>[] = [
    { header: "Vendor", accessor: "vendor_name", width: "2fr" },
    { header: "Email", accessor: "email", width: "2fr" },
    { header: "Seats", accessor: "seats", width: "0.8fr" },
    {
      header: "Price / Seat",
      width: "1fr",
      render: (v) => `₹${v.price_per_card}`,
    },
    {
      header: "Total Amount",
      width: "1.2fr",
      render: (v) =>
        `₹${v.payment_amount_total.toLocaleString("en-IN")}`,
    },
    { header: "Days Left", accessor: "days_left", width: "1fr" },
    {
      header: "Status",
      width: "1fr",
      render: (v) =>
        v.status === "PAID" ? (
          <span className="text-green-600 font-medium">Paid</span>
        ) : (
          <span className="text-red-600 font-medium">Not Paid</span>
        ),
    },
    {
      header: "Actions",
      align: "right",
      render: (v) => (
        <div onClick={(e) => e.stopPropagation()}>
          <PaymentsRowActionsDropdown
            onPaid={() =>
              showResult(true, "Payment marked as paid.")
            }
            onMarkUnpaid={() => {
              setUnpaidVendor(v);
              setUnpaidOpen(true);
            }}
            onEditSeats={() => {
              setSeatsVendor(v);
              setSeatsOpen(true);
            }}
            onEditPrice={() => {
              setSelectedVendor(v);
              setPriceOpen(true);
            }}
            onArchive={() => {
              setArchiveVendorTarget(v);
              setArchiveOpen(true);
            }}
          />
        </div>
      ),
    },
  ];

  /* -------------------------------- render --------------------------------- */

  return (
    <div className="p-6">
      <PageHeader
        title="Payments"
        description="Manage vendor subscriptions & payments"
      />

      <ErrorAlert message={error} />
      <BlockingLoader show={processing} />

      <PageFilters
        searchPlaceholder="Search vendors..."
        onSearch={(v) => {
          const value = v.trim();
          setSearch((prev) => {
            if (prev === value) return prev;
            setPage(1);
            return value;
          });
        }}
        filters={[
          {
            key: "sortBy",
            title: "Sort By",
            placeholder: "Sort by",
            value: sortBy,
            onChange: (v) => {
              setSortBy((prev) => {
                if (prev === v) return prev;
                setPage(1);
                return v as any;
              });
            },
            options: [
              { label: "Expiry (Days Left)", value: "days_left" },
              { label: "Total Amount", value: "total_amount" },
              { label: "Seats", value: "seats" },
              { label: "Vendor Name", value: "alphabetical" },
            ],
          },
          {
            key: "order",
            title: "Order By",

            placeholder: "Order",
            value: sortOrder,
            onChange: (v) => {
              setSortOrder((prev) => {
                if (prev === v) return prev;
                setPage(1);
                return v as "asc" | "desc";
              });
            },
            options: [
              { label: "Ascending", value: "asc" },
              { label: "Descending", value: "desc" },
            ],
          },
        ]}
      />

      <div className="mt-6">
        <DataTable<VendorPayment>
          columns={columns}
          data={list}
          loading={loading}
          page={page}
          totalPages={meta?.total_pages ?? 1}
          onPageChange={setPage}
          emptyText="No payment records found"
          onRowClick={(v) =>
            navigate(`/super/vendors/${v.vendor_id}`)
          }
        />
      </div>

      {/* -------------------- UPDATE SEATS (NEW) -------------------- */}
      <UpdateSeatsSubscriptionModal
        open={seatsOpen}
        vendor={
          seatsVendor
            ? {
              vendor_id: seatsVendor.vendor_id,
              seats: seatsVendor.seats,
              price_per_card: seatsVendor.price_per_card,
              payment_terms: seatsVendor.payment_terms,
            }
            : null
        }
        onClose={() => {
          setSeatsOpen(false);
          setSeatsVendor(null);
        }}
        onSubmit={async (newSeats) => {
          if (!seatsVendor) return;

          try {
            setProcessing(true);

            await dispatch(
              updateSubscription({
                vendor_id: seatsVendor.vendor_id,
                payment_terms: seatsVendor.payment_terms,
                seats: newSeats,
                price_per_card: seatsVendor.price_per_card,
                payment_amount_total:
                  newSeats * seatsVendor.price_per_card,
              })
            ).unwrap();

            showResult(true, "Seats updated successfully.");
          } catch (err) {
            showResult(false, getErrorMessage(err));
          } finally {
            setProcessing(false);
          }
        }}
      />

      {/* -------------------- UPDATE PRICE -------------------- */}
      <UpdatePricePerSeatModal
        vendor={selectedVendor}
        open={priceOpen}
        onClose={() => {
          setPriceOpen(false);
          setSelectedVendor(null);
        }}
        onSuccess={(newPrice) => {
          if (!selectedVendor) return;

          dispatch(
            updatePriceLocal({
              vendor_id: selectedVendor.vendor_id,
              price_per_card: newPrice,
            })
          );

          showResult(true, "Price updated successfully.");
        }}
      />

{/* -------------------- MARK UNPAID CONFIRMATION -------------------- */}
<UnpaidConfirmationModal
  open={unpaidOpen}
  vendorName={unpaidVendor?.vendor_name}
  loading={processing}
  onCancel={() => {
    setUnpaidOpen(false);
    setUnpaidVendor(null);
  }}
  onConfirm={async () => {
    if (!unpaidVendor) return;

    try {
      setProcessing(true);

      // optimistic UI
      dispatch(
        markUnpaidLocal({ vendor_id: unpaidVendor.vendor_id })
      );

      await dispatch(
        markVendorUnpaid({ vendor_id: unpaidVendor.vendor_id })
      ).unwrap();

      // ✅ AUTO OPEN ARCHIVE CONFIRMATION
      setArchiveVendorTarget(unpaidVendor);
      setArchiveOpen(true);
    } catch (err) {
      showResult(false, getErrorMessage(err));
    } finally {
      setProcessing(false);
      setUnpaidOpen(false);
      setUnpaidVendor(null);
    }
  }}
/>

      {/* -------------------- ARCHIVE -------------------- */}
      <ArchiveConfirmationModal
        open={archiveOpen}
        vendorName={archiveVendorTarget?.vendor_name}
        loading={processing}
        onCancel={() => {
          setArchiveOpen(false);
          setArchiveVendorTarget(null);
        }}
        onConfirm={async () => {
          if (!archiveVendorTarget) return;

          try {
            setProcessing(true);
            await dispatch(
              archiveVendor(archiveVendorTarget.vendor_id)
            ).unwrap();
            showResult(true, "Vendor marked as unpaid and archived successfully.");
          } catch (err) {
            showResult(false, getErrorMessage(err));
          } finally {
            setProcessing(false);
            setArchiveOpen(false);
            setArchiveVendorTarget(null);
          }
        }}
      />

      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}
