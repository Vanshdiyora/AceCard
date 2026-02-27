import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useNavigate } from "react-router-dom";
import MarkPaidOptionsModal from "../components/MarkPaidOptionsModal";
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

  const { list, loading, listMeta, error } = useAppSelector(
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
  const [archiveFromUnpaid, setArchiveFromUnpaid] = useState(false);
  const [unpaidCompletedVendor, setUnpaidCompletedVendor] =
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
  const [paidFlowOpen, setPaidFlowOpen] = useState(false);

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
        `₹${v.payment_amount_total}`,
    },
    { header: "Days Left", accessor: "days_left", width: "1fr" },
    {
      header: "Status",
      width: "1fr",
      render: (v) => {
        if (v.status === "Paid") {
          return (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
              Paid
            </span>
          );
        }

        if (v.status === "Pending") {
          return (
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
              Pending
            </span>
          );
        }

        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
            Not Paid
          </span>
        );
      },
    },
    {
      header: "Actions",
      align: "right",
      render: (v) => (
        <div onClick={(e) => e.stopPropagation()}>
          <PaymentsRowActionsDropdown
            onPaid={() => {
              setSelectedVendor(v);
              setPaidFlowOpen(true);
            }}
            onUpdateSubscription={() => {
              setSeatsVendor(v);
              setSeatsOpen(true);
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
  const lockScroll = () => {
    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    // only add padding if scrollbar exists
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
  };

  const unlockScroll = () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  };
  const isAnyModalOpen =
    seatsOpen ||
    priceOpen ||
    paidFlowOpen ||
    unpaidOpen ||
    archiveOpen ||
    resultOpen;

  useEffect(() => {
    if (isAnyModalOpen) {
      lockScroll();
    } else {
      unlockScroll();
    }

    return () => {
      unlockScroll();
    };
  }, [isAnyModalOpen]);
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
          totalPages={listMeta?.total_pages ?? 1}
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
        onSubmit={async ({ seats, price_per_card, payment_terms }: any) => {
          if (!seatsVendor) return;

          try {
            setProcessing(true);

            await dispatch(
              updateSubscription({
                vendor_id: seatsVendor.vendor_id,
                payment_terms,
                seats,
                price_per_card,
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

      <MarkPaidOptionsModal
        open={paidFlowOpen}
        vendor={selectedVendor}
        onClose={() => {
          setPaidFlowOpen(false);
          setSelectedVendor(null);
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

            // optimistic update
            dispatch(
              markUnpaidLocal({ payment_id: unpaidVendor.id })
            );

            await dispatch(
              markVendorUnpaid({ payment_id: unpaidVendor.id })
            ).unwrap();

            // close unpaid modal FIRST
            setUnpaidOpen(false);

            // mark flow
            setArchiveFromUnpaid(true);
            setUnpaidCompletedVendor(unpaidVendor);

            // open archive modal
            setArchiveVendorTarget(unpaidVendor);
            setArchiveOpen(true);

            // clear unpaid vendor
            setUnpaidVendor(null);

          } catch (err) {
            showResult(false, getErrorMessage(err));
          } finally {
            setProcessing(false);
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

          // 👇 If archive was triggered from unpaid flow
          if (archiveFromUnpaid && unpaidCompletedVendor) {
            showResult(
              true,
              `${unpaidCompletedVendor.vendor_name} marked as unpaid successfully.`
            );

            setArchiveFromUnpaid(false);
            setUnpaidCompletedVendor(null);
          }

          setArchiveVendorTarget(null);
        }}
        onConfirm={async () => {
          if (!archiveVendorTarget) return;

          try {
            setProcessing(true);

            await dispatch(
              archiveVendor(archiveVendorTarget.vendor_id)
            ).unwrap();

            showResult(true, "Vendor archived successfully.");

          } catch (err) {
            showResult(false, getErrorMessage(err));
          } finally {
            setProcessing(false);
            setArchiveOpen(false);
            setArchiveVendorTarget(null);
            setArchiveFromUnpaid(false);
            setUnpaidCompletedVendor(null);
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
