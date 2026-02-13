import { useParams, useNavigate } from "react-router-dom";
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
  Users,
  ChevronRight,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  archiveVendor,
  fetchVendorById,
  fetchVendors,
  unarchiveVendor,
  searchVendorTeam,
} from "../slice";

import { fetchPaymentHistory } from "../../paymentHistory/slice";

import EditVendorModal from "../components/EditVendorModal";
import NotifyVendorModal from "../components/NotifyVendorModal";
import UpdateSeatsModal from "../components/UpdateSeatModal";
import PaymentHistoryModal from "../components/PaymentHistoryModal";

import DetailPageHeader from "../../../common/components/layout/DetailPageHeader";
import BrandLoader from "../../../common/ui/BrandLoader";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import ResultModal from "../../../common/ui/ResultModal";
import ConfirmationModal from "../../../common/ui/ConfirmationModal";

/* -------------------------------------------------------------------------- */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getAvatarColor(seed: string) {
  const colors = [
    "bg-purple-100 text-purple-700",
    "bg-blue-100 text-blue-700",
    "bg-green-100 text-green-700",
    "bg-orange-100 text-orange-700",
    "bg-pink-100 text-pink-700",
  ];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export default function VendorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { vendors } = useAppSelector((s: any) => s.vendors);
  const {
    history: paymentHistory,
    loading: paymentHistoryLoading,
  } = useAppSelector((s: any) => s.payments);

  const vendorFromStore = vendors.find((v: any) => v.id === Number(id));
  const vendor = vendorFromStore ?? null;

  /* ------------------------------- modals -------------------------------- */

  const [editOpen, setEditOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [seatsOpen, setSeatsOpen] = useState(false);
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false);
  const [paymentHistoryOpen, setPaymentHistoryOpen] = useState(false);

  /* ------------------------------- ui state ------------------------------- */

  const [processing, setProcessing] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultSuccess, setResultSuccess] = useState(true);
  const [resultMessage, setResultMessage] = useState("");

  const showResult = (success: boolean, message: string) => {
    setResultSuccess(success);
    setResultMessage(message);
    setResultOpen(true);
  };

  /* ------------------------------- effects -------------------------------- */

  useEffect(() => {
    if (id) dispatch(fetchVendorById(Number(id)));
  }, [id, dispatch]);

  useEffect(() => {
    if (vendor?.id) {
      dispatch(
        searchVendorTeam({
          vendorId: vendor.id,
          params: { page: 1, page_size: 10 },
        })
      );
    }
  }, [vendor?.id, dispatch]);

  const openPaymentHistory = () => {
    if (!vendor?.id) return;
    setPaymentHistoryOpen(true);
    dispatch(fetchPaymentHistory(vendor.id));
  };

  const anyModalOpen =
    editOpen ||
    notifyOpen ||
    seatsOpen ||
    confirmArchiveOpen ||
    paymentHistoryOpen ||
    processing;

  useEffect(() => {
    document.body.style.overflow = anyModalOpen ? "hidden" : "";
    document.documentElement.style.overflow = anyModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [anyModalOpen]);

  /* ------------------------------- guards -------------------------------- */

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

  const CRMS = ["zoho", "hubspot", "salesforce", "odoo"];

  const formatDate = (value?: string) => {
    if (!value) return "—";
    const d = new Date(value);
    return isNaN(d.getTime()) ? "—" : d.toDateString();
  };

  /* ------------------------------- render -------------------------------- */
const formatPaymentTerm = (term?: string) => {
  const map: Record<string, string> = {
    monthly: "Monthly",
    quarterly: "Quarterly",
    semiannually: "Semi-Annually",
    annually: "Annually",
  };

  return term ? map[term.toLowerCase()] || term : "—";
};

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700"
      >
        <ArrowLeft size={14} /> Back to Vendors
      </button>

      <div className="mt-6" />

      <DetailPageHeader
        title={vendor.legal_name}
        subtitle={vendor.primary_email}
        avatar={
          vendor.avatar ? (
            <img
              src={vendor.avatar}
              alt={vendor.legal_name}
              className="w-12 h-12 rounded-full object-cover border"
            />
          ) : (
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${getAvatarColor(
                vendor.legal_name
              )}`}
            >
              {getInitials(vendor.legal_name)}
            </div>
          )
        }

        status={{
          label: vendor.status === "active" ? "Active" : "Archived",
        }}
        actions={
          <>
            <ActionButton icon={<Edit size={14} />} label="Edit" onClick={() => setEditOpen(true)} />
            <ActionButton icon={<Layers size={14} />} label="Update Seats" onClick={() => setSeatsOpen(true)} />
            <ActionButton icon={<Send size={14} />} label="Notify" onClick={() => setNotifyOpen(true)} />
            <ActionButton icon={<Users size={14} />} label="Team Detail" onClick={() => navigate(`/super/vendors/${vendor.id}/team`)} />
            <ActionButton
              icon={vendor.status === "active" ? <Trash2 size={14} /> : <Activity size={14} />}
              label={vendor.status === "active" ? "Archive" : "Unarchive"}
              danger={vendor.status === "active"}
              onClick={() => setConfirmArchiveOpen(true)}
            />
          </>
        }
      />

      <div className="mt-6" />

      {/* -------------------- ROW 1 -------------------- */}
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
          <Info label="POC Name" value={vendor.vendor_poc_name} />
          <Info label="POC Email" value={vendor.vendor_poc_email} />
        </Section>

        <Section
          title={
            <div className="flex items-center justify-between w-full">
              <span>Billing</span>
              <button onClick={openPaymentHistory} className="text-purple-600 hover:text-purple-800">
                <ChevronRight size={18} />
              </button>
            </div>
          }
          icon={<BadgeIndianRupee size={16} />}
        >
          <Info label="Pricing / Card" value={`₹ ${vendor.pricing_per_card}`} />
          <Info label="Payment Terms" value={formatPaymentTerm(vendor.payment_terms)} />
          <Info label="Joined" value={new Date(vendor.created_at).toDateString()} />
          <Info label="Subscription End" value={formatDate(vendor.subscription_end_date)} />
        </Section>
      </div>

      {/* -------------------- ROW 2 -------------------- */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Section title="CRM Integrations" icon={<Activity size={16} />}>
          <div className="flex flex-wrap gap-2 col-span-2">
            {CRMS.map((crm) => (
              <Tag
                key={crm}
                active={vendor.allowed_crm_integrations?.includes(crm)}
                label={crm.charAt(0).toUpperCase() + crm.slice(1)}
              />
            ))}
          </div>
        </Section>

        <Section title="Usage Metrics" icon={<Activity size={16} />}>
          <div className="col-span-2 flex gap-4 w-full">
            <Metric label="Total Leads" value={vendor.total_leads ?? 0} />
            <Metric label="Seats Used" value={vendor.seats_used ?? 0} />
            <Metric label="Voice Time" value={formatMinutes(vendor.total_voice_time ?? 0)} />
          </div>
        </Section>
      </div>

      {/* -------------------- MODALS -------------------- */}
      <EditVendorModal vendor={vendor} open={editOpen} onClose={() => setEditOpen(false)} />
      <NotifyVendorModal vendor={vendor} open={notifyOpen} onClose={() => setNotifyOpen(false)} />
      <UpdateSeatsModal vendor={vendor} open={seatsOpen} onClose={() => setSeatsOpen(false)} />

      <PaymentHistoryModal
        open={paymentHistoryOpen}
        loading={paymentHistoryLoading}
        history={paymentHistory}
        onClose={() => setPaymentHistoryOpen(false)}
      />

      <ConfirmationModal
        open={confirmArchiveOpen}
        title={vendor.status === "active" ? "Archive Vendor" : "Unarchive Vendor"}
        message={
          vendor.status === "active"
            ? `Are you sure you want to archive ${vendor.legal_name}?`
            : `Are you sure you want to unarchive ${vendor.legal_name}?`
        }
        confirmLabel={vendor.status === "active" ? "Archive" : "Unarchive"}
        confirmVariant={vendor.status === "active" ? "danger" : "primary"}
        loading={processing}
        onClose={() => setConfirmArchiveOpen(false)}
        onConfirm={async () => {
          setConfirmArchiveOpen(false);
          setProcessing(true);
          try {
            if (vendor.status === "active") {
              await dispatch(archiveVendor(vendor.id)).unwrap();
              showResult(true, "Vendor archived successfully.");
            } else {
              await dispatch(unarchiveVendor(vendor.id)).unwrap();
              showResult(true, "Vendor unarchived successfully.");
            }
            await dispatch(fetchVendors());
            await dispatch(fetchVendorById(vendor.id));
          } catch (err: any) {
            showResult(false, err?.message || "Operation failed.");
          } finally {
            setProcessing(false);
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

/* -------------------- UI HELPERS -------------------- */

function Section({ title, icon, children }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-4 min-w-0 overflow-hidden">
      <div className="flex items-center gap-2 text-purple-600 font-semibold">
        {icon} {title}
      </div>
      <div className="grid grid-cols-2 gap-4 min-w-0">{children}</div>
    </div>
  );
}

function Info({ label, value }: any) {
  return (
    <div className="min-w-0 overflow-hidden">
      <p className="text-xs text-gray-400">{label}</p>
      <div className="font-medium break-all leading-snug">{value}</div>
    </div>
  );
}

function StatusBadge({ status }: any) {
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs ${status === "active"
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
      className={`px-3 py-1 rounded-full text-xs ${active ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-500"
        }`}
    >
      {label}
    </span>
  );
}

function Metric({ label, value }: any) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 flex-1">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

export function ActionButton({ icon, label, onClick, danger }: any) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm ${danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-purple-200 text-purple-600 hover:bg-purple-50"
        }`}
    >
      {icon} {label}
    </button>
  );
}

function formatMinutes(totalMinutes: number): string {
  if (!totalMinutes || totalMinutes <= 0) return "0m";
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const days = Math.floor(totalMinutes / (60 * 24));
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  return parts.join(" ");
}
