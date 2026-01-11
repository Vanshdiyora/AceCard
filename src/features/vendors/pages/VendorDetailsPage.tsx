import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  Mail,
  Layers,
  BadgeIndianRupee,
  Activity,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  archiveVendor,
  fetchVendorById,
  fetchVendors,
} from "../slice";
import type { VendorItem } from "../types";

import EditVendorModal from "../components/EditVendorModal";
import NotifyVendorModal from "../components/NotifyVendorModal";
import UpdateSeatsModal from "../components/UpdateSeatModal";

import DetailPageHeader from "../../../common/components/layout/DetailPageHeader";
import BrandLoader from "../../../common/ui/BrandLoader";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import ConfirmationModal from "../../../common/ui/ConfirmationModal";

export default function VendorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const passedVendor = (location.state as any)?.vendor as VendorItem | undefined;
  const { vendors } = useAppSelector((s) => s.vendors);

  const vendorFromStore = vendors.find((v) => v.id === Number(id));
  const vendor = vendorFromStore ?? passedVendor ?? null;

  const [editOpen, setEditOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [seatsOpen, setSeatsOpen] = useState(false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  useEffect(() => {
    if (!vendorFromStore && id) {
      dispatch(fetchVendorById(Number(id)));
    }
  }, [vendorFromStore, id, dispatch]);

  const anyModalOpen =
    editOpen || notifyOpen || seatsOpen || confirmArchiveOpen || processing;

  useEffect(() => {
    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [anyModalOpen]);

  if (!vendorFromStore) {
    return (
    <div className="min-h-screen flex items-center justify-center">
        <BrandLoader message="Loading vendor..." />
      </div>
    );
  }

  if (!vendor) {
    return <div className="p-8 text-sm text-red-500">Vendor not found</div>;
  }

  const initials = vendor.legal_name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="p-6 space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700"
      >
        <ArrowLeft size={14} /> Back to Vendors
      </button>

      <DetailPageHeader
        title={vendor.legal_name}
        subtitle={vendor.primary_email}
        avatar={initials}
        status={{
          label: vendor.status === "active" ? "Active" : "Archived",
          variant: vendor.status === "active" ? "active" : "archived",
        }}
        actions={
          <>
            <ActionButton icon={<Edit size={14} />} label="Edit" onClick={() => setEditOpen(true)} />
            <ActionButton icon={<Layers size={14} />} label="Update Seats" onClick={() => setSeatsOpen(true)} />
            <ActionButton icon={<Send size={14} />} label="Notify" onClick={() => setNotifyOpen(true)} />
            <ActionButton icon={<Trash2 size={14} />} label="Archive" danger onClick={() => setConfirmArchiveOpen(true)} />
          </>
        }
      />

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Section title="Profile" icon={<Mail size={16} />}>
          <Info label="Email" value={vendor.primary_email} />
          <Info label="Phone" value={vendor.primary_phone} />
          <Info label="GST" value={vendor.gst || "—"} />
          <Info label="Status" value={<StatusBadge status={vendor.status} />} />
        </Section>

        <Section title="Business" icon={<Layers size={16} />}>
          <Info label="Seats" value={vendor.seats_appointed} />
          <Info label="Stage" value={vendor.status === "active" ? "On-boarded" : "Suspended"} />
          <Info label="POC Email" value={vendor.vendor_poc_email} />
        </Section>

        <Section title="Billing" icon={<BadgeIndianRupee size={16} />}>
          <Info label="Pricing / Card" value={`₹ ${vendor.pricing_per_card}`} />
          <Info label="Payment Terms" value={vendor.payment_terms} />
          <Info label="Joined" value={new Date(vendor.created_at).toDateString()} />
        </Section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="CRM Integrations" icon={<Activity size={16} />}>
          <div className="flex flex-wrap gap-2 col-span-2">
            <Tag active={vendor.crm_manual_trigger} label="Manual Trigger" />
            <Tag active={vendor.crm_realtime_sync} label="Realtime Sync" />
            <Tag active={!!vendor.crm_system} label={vendor.crm_system || "No CRM"} />
          </div>
        </Section>

        <Section title="Usage Metrics" icon={<Activity size={16} />}>
          <Metric label="Total Leads" value={0} />
          <Metric label="Voice Time" value="0 m" />
        </Section>
      </div>

      {/* Modals */}
      <EditVendorModal vendor={vendor} open={editOpen} onClose={() => setEditOpen(false)} />
      <NotifyVendorModal vendor={vendor} open={notifyOpen} onClose={() => setNotifyOpen(false)} />
      <UpdateSeatsModal vendor={vendor} open={seatsOpen} onClose={() => setSeatsOpen(false)} />

      <ConfirmationModal
        open={confirmArchiveOpen}
        title="Archive Vendor"
        message={`Are you sure you want to archive ${vendor.legal_name}?`}
        confirmLabel="Archive"
        confirmVariant="danger"
        loading={processing}
        onClose={() => setConfirmArchiveOpen(false)}
        onConfirm={async () => {
          try {
            setProcessing(true);
            await dispatch(archiveVendor(vendor.id)).unwrap();
            showResult(true, "Vendor archived successfully.");
            dispatch(fetchVendors());
            navigate("/super/vendors");
          } catch (err: any) {
            showResult(false, err?.message || "Failed to archive vendor.");
          } finally {
            setProcessing(false);
            setConfirmArchiveOpen(false);
          }
        }}
      />

      <BlockingLoader show={processing} />

      <ResultModal
        open={resultOpen}
        success={resultSuccess}
        message={resultMessage}
        onClose={() => setResultOpen(false)}
      />
    </div>
  );
}

/* ---------- Small UI helpers ---------- */

function Section({ title, icon, children }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-4">
      <div className="flex items-center gap-2 text-purple-600 font-semibold">
        {icon} {title}
      </div>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: any) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function Tag({ active, label }: any) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs ${
        active ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {label}
    </span>
  );
}

function Metric({ label, value }: any) {
  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function ActionButton({ icon, label, onClick, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-purple-200 text-purple-600 hover:bg-purple-50"
      }`}
    >
      {icon} {label}
    </button>
  );
}
