import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchAccountProfile } from "../slice";
import BrandLoader from "../../../common/ui/BrandLoader";
import ResetPasswordSection from "./ResetPasswordSection";
import EditAccountModal from "./EditAccountModal";

export default function AccountSettings() {
  const dispatch = useAppDispatch();
  const { data, loading } = useAppSelector((s) => s.settings.account);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchAccountProfile());
  }, [dispatch]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <BrandLoader />
      </div>
    );

  if (!data) return null;

  return (
    <div className="bg-white shadow p-8 rounded-xl">
      <h2 className="text-xl font-semibold mb-6">Account Settings</h2>

      <div className="space-y-2">
        {renderView("Name", data.name)}
        {renderView("Email", data.email)}
        {renderView("Phone", data.phone)}
        {renderView("Role", data.role)}
        {/* {renderView("Avatar URL", data.avatar_url)} */}
        {/* {renderView("Bio", data.bio)} */}
        {renderView("Company Description", data.company_description)}
        {renderView("Address", data.address)}

        <button
          onClick={() => setEditOpen(true)}
          className="mt-6 px-6 py-2 bg-purple-600 text-white rounded-lg"
        >
          Edit
        </button>
      </div>

      <ResetPasswordSection />

      <EditAccountModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  );
}

function renderView(label: string, value: string) {
  return (
    <p>
      <strong>{label}:</strong>{" "}
      {value || <span className="text-gray-400">—</span>}
    </p>
  );
}
