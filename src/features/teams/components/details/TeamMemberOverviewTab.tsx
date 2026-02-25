import type { TeamMember } from "../../types";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef } from "react";
import { fetchCampaignsByTeamMember } from "../../../campaigns/slice";
import BrandLoader from "../../../../common/ui/BrandLoader";
import QRCode from "qrcode";
import { Copy, Download } from "lucide-react";

export default function TeamMemberOverviewTab({
  member,
}: {
  member: TeamMember;
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const qrRef = useRef<HTMLCanvasElement | null>(null);

  const { items, loading } = useAppSelector((s) => s.campaigns);
  const allCampaigns = items ?? [];

  const profileUrl = member?.username
    ? `${window.location.origin}/profile/${member.username}`
    : "";
  const directUrl = `${profileUrl}?type=direct`;
  const qrUrl = `${profileUrl}?type=qr`;
  const nfcUrl = `${profileUrl}?type=nfc`;

  const displayRole = useMemo(() => {
    switch (member.role) {
      case "sales_rep":
        return `${member.custom_job_role} (Sales Person)`;
      case "manager":
        return `${member.custom_job_role} (Manager)`;
      case "vendor_admin":
        return "Vendor Admin";
      default:
        return member.role
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }, [member.role]);

  /* ---------------- QR Render ---------------- */
  useEffect(() => {
    if (!profileUrl || !qrRef.current) return;

    QRCode.toCanvas(qrRef.current, profileUrl, {
      width: 140,
      margin: 2,
    });
  }, [profileUrl]);

  /* ---------------- Copy ---------------- */
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch { }
  };

  /* ---------------- Download QR ---------------- */
  const downloadQR = async () => {
    if (!profileUrl) return;

    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, qrUrl, {
      width: 512,
      margin: 2,
    });

    const link = document.createElement("a");
    link.download = `${member.username}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  /* ---------------- Campaigns ---------------- */
  useEffect(() => {
    if (!member?.id) return;

    dispatch(fetchCampaignsByTeamMember({ memberId: member.id }));
  }, [member.id, dispatch]);

  const campaigns = useMemo(() => {
    if (member.role === "manager") {
      return allCampaigns.filter((c) => c.manager_id === member.id);
    }
    return allCampaigns;
  }, [allCampaigns, member.role, member.id]);

  const formatDateTime = (iso?: string) => {
    if (!iso) return "-";

    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
      {/* ================= MEMBER DETAILS ================= */}
      <div className="bg-white rounded-2xl border p-6 space-y-5">
        <h3 className="text-base font-semibold">Member Details</h3>

        <div className="space-y-4">
          <Detail label="Email" value={member.email} />
          <Detail label="Phone" value={member.phone} />
          <Detail label="Role" value={displayRole} />

          <Detail label="Status" value={member.status} />
          <Detail
            label="Joined On"
            value={formatDateTime(member.created_at)}
          />

        </div>

        {/* ================= SHARE ================= */}
        {profileUrl && (
          <div className="pt-5 border-t space-y-4">
            <h4 className="text-sm font-medium">Share Profile</h4>

            {/* Direct Link */}
            <div className="space-y-1">
              <span className="text-xs text-gray-400">Direct Link</span>
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <input
                  readOnly
                  value={directUrl}
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 truncate"
                />
                <button
                  onClick={() => copy(directUrl)}
                  className="p-2 rounded-lg border hover:bg-gray-50 shrink-0"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {/* NFC Link */}
            <div className="space-y-1">
              <span className="text-xs text-gray-400">NFC Link</span>
              <div className="grid grid-cols-[1fr_auto] items-center gap-2">
                <input
                  readOnly
                  value={nfcUrl}
                  className="w-full text-xs px-3 py-2 rounded-lg border bg-gray-50 truncate"
                />
                <button
                  onClick={() => copy(nfcUrl)}
                  className="p-2 rounded-lg border hover:bg-gray-50 shrink-0"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-2">
              <span className="text-xs text-gray-400">QR Code</span>

              <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                <button
                  onClick={downloadQR}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border hover:bg-gray-50 text-sm"
                >
                  <Download size={16} />
                  Download QR
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ================= CAMPAIGNS ================= */}
      <div className="xl:col-span-2 bg-white rounded-2xl border p-6 flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-base font-semibold">Campaigns Assigned</h3>
            <p className="text-sm text-gray-500">
              Campaigns this member is involved in
            </p>
          </div>

          <button
            onClick={() =>
              navigate(`/admin/campaigns?teams_member_ids=${member.id}`)
            }
            className="text-sm text-purple-600 hover:underline"
          >
            View all →
          </button>
        </div>

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <BrandLoader message="Loading campaigns..." />
          </div>
        )}

        {!loading && campaigns.length === 0 && (
          <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
            No campaigns assigned
          </div>
        )}

        {!loading && campaigns.length > 0 && (
          <div className="space-y-3">
            {campaigns.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/admin/campaigns/${c.id}`)}
                className="p-4 rounded-xl border hover:border-purple-300 hover:bg-purple-50/40 cursor-pointer transition"
              >
                <div className="font-medium text-sm">{c.name}</div>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <span className="capitalize">{c.status}</span>
                  <span>
                    Budget: ₹{c.budget?.toLocaleString() ?? "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- DETAIL ROW ---------------- */

function Detail({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="text-sm font-medium text-gray-900">
        {value || "-"}
      </span>
    </div>
  );
}
