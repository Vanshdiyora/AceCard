import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { useNavigate } from "react-router-dom";

import {
    fetchPayments,
    archiveVendor,
    updateSubscription,
} from "../slice";
import { updateSeatsLocal, updatePriceLocal } from "../slice";
import PaymentsRowActionsDropdown from "../components/PaymentsRowActionsDropdown";

import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import ArchiveConfirmationModal from "../components/ArchiveConfirmationModal";

import UpdateSeatsModal from "../../vendors/components/UpdateSeatModal";
import type { VendorSeatsTarget } from "../../vendors/types";
import type { VendorPayment } from "../types";
import UpdatePricePerSeatModal from "../components/UpdatePricePerSeatModal";

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

    const [page, setPage] = useState(1);
    const pageSize = 10;

    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<"recent" | "name">("recent");

    const [processing, setProcessing] = useState(false);
    const [resultOpen, setResultOpen] = useState(false);
    const [resultSuccess, setResultSuccess] = useState(true);
    const [resultMessage, setResultMessage] = useState("");

    /* -------- Seats Modal State -------- */
    const [seatsOpen, setSeatsOpen] = useState(false);
    const [priceOpen, setPriceOpen] = useState(false);

    const [seatsVendor, setSeatsVendor] =
        useState<VendorSeatsTarget | null>(null);
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [archiveVendorTarget, setArchiveVendorTarget] =
        useState<VendorPayment | null>(null);

    /* -------- Subscription Edit Modal -------- */
    const [editOpen, setEditOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] =
        useState<VendorPayment | null>(null);

    const showResult = (success: boolean, message: string) => {
        setResultSuccess(success);
        setResultMessage(message);
        setResultOpen(true);
    };

    /* -------------------------------- fetch -------------------------------- */

    useEffect(() => {
        dispatch(
            fetchPayments({
                page,
                page_size: pageSize,
                search: search.trim() || undefined,
                sort: sort === "name" ? "name" : undefined,
            })
        );
    }, [dispatch, page, pageSize, search, sort]);

    /* ------------------------------ derived data ----------------------------- */

    const finalList = useMemo(() => {
        const data = [...list];
        if (sort === "name") {
            data.sort((a, b) =>
                a.vendor_name.localeCompare(b.vendor_name)
            );
        }
        return data;
    }, [list, sort]);

    /* --------------------- VendorPayment → SeatsTarget --------------------- */

    const mapPaymentToSeatsTarget = (
        v: VendorPayment
    ): VendorSeatsTarget => ({
        id: v.vendor_id,
        seats_appointed: v.seats,
    });

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
            header: "Actions",
            align: "right",
            render: (v) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <PaymentsRowActionsDropdown
                        onPaid={() =>
                            showResult(true, "Payment marked as paid.")
                        }
                        onEditSeats={() => {
                            setSeatsVendor(mapPaymentToSeatsTarget(v));
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

    /* -------------------------- subscription update -------------------------- */

    const [form, setForm] = useState({
        payment_terms: "monthly",
        seats: 0,
        price_per_card: 0,
    });

    const submitUpdate = async () => {
        if (!selectedVendor) return;

        try {
            setProcessing(true);

            await dispatch(
                updateSubscription({
                    vendor_id: selectedVendor.vendor_id,
                    ...form,
                    payment_amount_total:
                        form.seats * form.price_per_card,
                })
            ).unwrap();

            showResult(true, "Subscription updated successfully.");
            setEditOpen(false);
        } catch (err) {
            showResult(false, getErrorMessage(err));
        } finally {
            setProcessing(false);
        }
    };

    /* -------------------------------- render -------------------------------- */

    return (
        <div className="p-6">
            <PageHeader
                title="Payments History"
                description="Manage vendor subscriptions & payments"
            />

            <ErrorAlert message={error} />
            <BlockingLoader show={processing} />

            <PageFilters
                searchPlaceholder="Search vendors..."
                onSearch={(v) => {
                    setSearch(v);
                    setPage(1);
                }}
                filters={[
                    {
                        key: "sort",
                        placeholder: "Sort by",
                        value: sort,
                        onChange: (v) => {
                            setSort(v as "recent" | "name");
                            setPage(1);
                        },
                        options: [
                            { label: "Recent", value: "recent" },
                            { label: "Vendor Name A–Z", value: "name" },
                        ],
                    },
                ]}
            />

            <div className="mt-6">
                <DataTable<VendorPayment>
                    columns={columns}
                    data={finalList}
                    loading={loading}
                    page={meta?.page ?? page}
                    totalPages={meta?.total_pages ?? 1}
                    onPageChange={setPage}
                    emptyText="No payment records found"
                    onRowClick={(v) =>
                        navigate(`/super/vendors/${v.vendor_id}`)
                    }
                />
            </div>

            {/* -------------------- UPDATE SEATS MODAL -------------------- */}
            <UpdateSeatsModal
                vendor={seatsVendor}
                open={seatsOpen}
                onClose={() => {
                    setSeatsOpen(false);
                    setSeatsVendor(null);
                }}
                onSuccess={(newSeats) => {
                    if (!seatsVendor) return;

                    dispatch(
                        updateSeatsLocal({
                            vendor_id: seatsVendor.id,
                            seats: newSeats,
                        })
                    );

                    showResult(true, "Seats updated successfully.");
                }}
            />

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

                        showResult(true, "Vendor archived successfully.");
                    } catch (err) {
                        showResult(false, getErrorMessage(err));
                    } finally {
                        setProcessing(false);
                        setArchiveOpen(false);
                        setArchiveVendorTarget(null);
                    }
                }}
            />

            {/* -------------------- UPDATE PRICE / SUBSCRIPTION -------------------- */}
            {editOpen && selectedVendor && (
                <div className="modal">
                    <h3 className="font-semibold mb-4">
                        Update Subscription
                    </h3>

                    <input
                        type="number"
                        placeholder="Seats"
                        className="input"
                        onChange={(e) =>
                            setForm({ ...form, seats: +e.target.value })
                        }
                    />

                    <input
                        type="number"
                        placeholder="Price per card"
                        className="input"
                        onChange={(e) =>
                            setForm({
                                ...form,
                                price_per_card: +e.target.value,
                            })
                        }
                    />

                    <div className="flex gap-3 mt-4">
                        <button
                            className="btn-primary"
                            onClick={submitUpdate}
                        >
                            Save
                        </button>
                        <button
                            className="btn-secondary"
                            onClick={() => setEditOpen(false)}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <ResultModal
                open={resultOpen}
                success={resultSuccess}
                message={resultMessage}
                onClose={() => setResultOpen(false)}
            />
        </div>
    );
}
