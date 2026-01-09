import { useState, useEffect } from "react";
import DynamicForm from "../../../common/ui/DynamicForm";
import type { FieldConfig } from "../../../common/ui/DynamicForm";
import { useAppDispatch } from "../../../app/hooks";
import { updateVendor, fetchVendors } from "../slice";
import type { VendorItem } from "../types";

interface EditVendorModalProps {
  vendor: VendorItem | null;
  open: boolean;
  onClose: () => void;
}

export default function EditVendorModal({
  vendor,
  open,
  onClose,
}: EditVendorModalProps) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState<Partial<VendorItem>>({});

  /* 🔒 Lock background scroll when modal is open */
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (vendor) setForm(vendor);
  }, [vendor]);

  const fields: FieldConfig[] = [
    {
      name: "legal_name",
      label: "Legal Name",
      type: "text",
      placeholder: "Enter legal registered name",
    },
    {
      name: "address",
      label: "Address",
      type: "text",
      placeholder: "Enter vendor's address",
    },
    {
      name: "primary_email",
      label: "Primary Email",
      type: "email",
      placeholder: "Enter main company email",
    },
    {
      name: "primary_phone",
      label: "Primary Phone",
      type: "text",
      placeholder: "Enter main contact number",
    },
    {
      name: "gst",
      label: "GST Number",
      type: "text",
      placeholder: "Enter GST number (optional)",
    },
    {
      name: "payment_terms",
      label: "Payment Terms",
      type: "text",
      placeholder: "Ex: Net 30 / Monthly / Quarterly",
    },
  ];

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    if (!vendor) return;

    await dispatch(updateVendor({ id: vendor.id, data: form }));
    dispatch(fetchVendors());
    onClose();
  };

  if (!open || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[450px] max-h-[90vh] rounded-xl shadow-lg flex flex-col">

        {/* Header */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">Edit Vendor</h2>
        </div>

        {/* Scrollable Form Section */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          <DynamicForm fields={fields} form={form} onChange={update} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end gap-3">
          <button className="px-4 py-2 border rounded" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded"
            onClick={save}
          >
            Update
          </button>
        </div>

      </div>
    </div>
  );
}
