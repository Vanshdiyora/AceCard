import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { searchVendorTeam } from "../slice";
import { ArrowLeft } from "lucide-react";
import PageHeader from "../../../common/components/layout/PageHeader";
import PageFilters from "../../../common/components/layout/PageFilter";
import DataTable, { type Column } from "../../../common/components/table/DataTable";
import ErrorAlert from "../../../common/ui/ErrorAlert";
import QRCode from "qrcode";

const downloadQR = async (username: string) => {
  const url = `${window.location.origin}/profile/${username}`; // change if needed

  const dataUrl = await QRCode.toDataURL(url, {
    width: 300,
    margin: 2,
  });

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = `${username}-qr.png`;
  link.click();
};

type TeamRow = {
  name: string;
  role: string
  username: string;
};

export default function VendorTeamPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { teamActivity, teamLoading, teamMeta, error } = useAppSelector(
    (s) => s.vendors
  );

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  useEffect(() => {
    if (!id) return;
    dispatch(
      searchVendorTeam({
        vendorId: Number(id),
        params: { page, page_size: pageSize, username: search || undefined },
      })
    );
  }, [dispatch, id, page, pageSize, search]);

  const rows = useMemo<TeamRow[]>(() => {
    return teamActivity.map((t) => ({
      name: t.name,
      role: t.role,
      username: t.username,
    }));
  }, [teamActivity]);

  const columns: Column<TeamRow>[] = [
    { header: "Name", accessor: "name", width: "1fr" },
    { header: "Role", accessor: "role", width: "1fr" },
    {
      header: "",
      width: "120px",
      align: "center",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation(); // prevent row click
            downloadQR(row.username);
          }}
          className="px-3 py-1 text-xs rounded bg-purple-600 text-white hover:bg-indigo-700"
        >
          Download QR
        </button>
      ),
    },
  ];


  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-700"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <div className="mt-3" />
      <PageHeader
        title="Vendor Team"
        description="Team members linked to this vendor"
      />

      <ErrorAlert message={error} />

      <PageFilters
        searchPlaceholder="Search team by username..."
        onSearch={(v) => {
          setSearch((prev) => {
            if (prev === v) return prev; // 👈 prevents reset
            setPage(1);
            return v;
          });
        }}

      />

      <div className="mt-6">
        <DataTable<TeamRow>
          columns={columns}
          data={rows}
          loading={teamLoading}
          page={page}                    // ✅ use local state only
          totalPages={teamMeta?.total_pages ?? 1}
          onPageChange={setPage}
          emptyText="No team members found"
        />

      </div>
    </div>
  );
}
