import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
import { archiveVendor, fetchVendorById } from "../slice";
import type { VendorItem } from "../types";

export default function VendorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();

  const passedVendor = (location.state as any)?.vendor as VendorItem | undefined;
  const { vendors, loading } = useAppSelector((s) => s.vendors);
  const vendor =
    vendors.find((v) => v.id === Number(id)) || passedVendor;

  useEffect(() => {
    if (!vendor && id) {
      dispatch(fetchVendorById(Number(id)));
    }
  }, [vendor, id, dispatch]);

  if (loading && !vendor)
    return <div className="p-8 text-sm text-gray-500">Loading vendor…</div>;
  if (!loading && !vendor)
    return <div className="p-8 text-sm text-red-500">Vendor not found</div>;
  if (!vendor) return null;

  return (
    <div className="p-6 space-y-6">

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700"
      >
        <ArrowLeft size={14} /> Back to Vendors
      </button>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 text-black flex justify-between items-center shadow">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold truncate">
            {vendor.legal_name}
          </h1>
          <p className="text-sm opacity-90 truncate">
            {vendor.primary_email}
          </p>
        </div>

        <div className="flex gap-2">
          <ActionButton icon={<Edit size={14} />} label="Edit" />
          <ActionButton icon={<Send size={14} />} label="Notify" />
          <ActionButton
            icon={<Trash2 size={14} />}
            label="Archive"
            danger
            onClick={async () => {
              if (confirm("Archive this vendor?")) {
                await dispatch(archiveVendor(vendor.id));
                navigate("/super/vendors");
              }
            }}
          />
        </div>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr">
        <Section title="Profile" icon={<Mail size={16} />}>
          <Info label="Email" value={vendor.primary_email} />
          <Info label="Phone" value={vendor.primary_phone} />
          <Info label="GST" value={vendor.gst || "—"} />
          <Info label="Status" value={<StatusBadge status={vendor.status} />} />
        </Section>

        <Section title="Business" icon={<Layers size={16} />}>
          <Info label="Seats" value={vendor.seats_appointed} />
          <Info label="Stage" value="On-boarded" />
          <Info label="POC Email" value={vendor.vendor_poc_email} />
        </Section>

        <Section title="Billing" icon={<BadgeIndianRupee size={16} />}>
          <Info label="Pricing / Card" value={`₹ ${vendor.pricing_per_card}`} />
          <Info label="Payment Terms" value={vendor.payment_terms} />
          <Info
            label="Joined"
            value={new Date(vendor.created_at).toDateString()}
          />
        </Section>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 auto-rows-fr">
        <Section title="CRM Integrations" icon={<Activity size={16} />}>
          <div className="flex flex-wrap gap-2 col-span-2">
            <Tag active={vendor.crm_manual_trigger} label="Manual Trigger" />
            <Tag active={vendor.crm_realtime_sync} label="Realtime Sync" />
            <Tag
              active={!!vendor.crm_system}
              label={vendor.crm_system || "No CRM"}
            />
          </div>
        </Section>

        <Section title="Usage Metrics" icon={<Activity size={16} />}>
          <Metric label="Total Leads" value={0} />
          <Metric label="Voice Time" value="0 m" />
        </Section>
      </div>
    </div>
  );
}

/* ---------- UI Components ---------- */

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow space-y-4 h-full min-w-0">
      <div className="flex items-center gap-2 text-purple-600 font-semibold">
        {icon} {title}
      </div>
      <div className="grid grid-cols-2 gap-4 min-w-0">{children}</div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <div className="font-medium text-gray-900 break-all whitespace-normal">
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs ${
        status === "active"
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function Tag({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs ${
        active
          ? "bg-purple-100 text-purple-700"
          : "bg-gray-100 text-gray-500"
      }`}
    >
      {label}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: any }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 min-w-0">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
function ActionButton({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition ${
        danger
          ? "border-red-200 text-red-600 hover:bg-red-50"
          : "border-purple-200 text-purple-600 hover:bg-purple-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
