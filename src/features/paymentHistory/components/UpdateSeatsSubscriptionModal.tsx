import { useEffect, useState } from "react";
import BlockingLoader from "../../../common/ui/BlockingLoader";
import DynamicForm, {
 type FieldConfig,
} from "../../../common/ui/DynamicForm";

type PaymentTerm =
  | "monthly"
  | "quarterly"
  | "semiannually"
  | "annually";

interface Props {
  open: boolean;
  vendor: {
    vendor_id: number;
    seats: number;
    price_per_card: number;
    payment_terms: string;
  } | null;
  onClose: () => void;
  onSubmit: (data: {
    seats: number;
    price_per_card: number;
    payment_terms: PaymentTerm;
  }) => Promise<void>;
}

const paymentTermOptions = [
  { label: "Monthly", value: "monthly" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Semi-Annually", value: "semiannually" },
  { label: "Annually", value: "annually" },
];

export default function UpdateSeatsSubscriptionModal({
  open,
  vendor,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<any>({
    seats: "",
    price_per_card: "",
    payment_terms: "monthly",
  });

  const [errors, setErrors] = useState<
    Record<string, string | null>
  >({});

  const [submitAttempted, setSubmitAttempted] =
    useState(false);

  const [loading, setLoading] = useState(false);
const getTermMultiplier = (term: PaymentTerm) => {
  switch (term) {
    case "monthly":
      return 1;
    case "quarterly":
      return 3;
    case "semiannually":
      return 6;
    case "annually":
      return 12;
    default:
      return 1;
  }
};
  /* ---------- initialize values ---------- */
  useEffect(() => {
    if (vendor) {
      setForm({
        seats: vendor.seats,
        price_per_card: vendor.price_per_card,
        payment_terms:
          vendor.payment_terms?.toLowerCase() ||
          "monthly",
      });
    }
  }, [vendor]);

  if (!open || !vendor) return null;

  const handleChange = (key: string, value: any) => {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);

    if (!form.seats || !form.price_per_card) return;

    try {
      setLoading(true);

      await onSubmit({
        seats: Number(form.seats),
        price_per_card: Number(form.price_per_card),
        payment_terms: form.payment_terms,
      });

      onClose();
    } finally {
      setLoading(false);
    }
  };

const total =
  Number(form.seats || 0) *
  Number(form.price_per_card || 0) *
  getTermMultiplier(form.payment_terms);
  
  const fields: FieldConfig[] = [
    {
      name: "seats",
      label: "Number of Seats",
      type: "number",
      required: true,
      min: 1,
    },
    {
      name: "price_per_card",
      label: "Price Per Seat (₹)",
      type: "number",
      required: true,
      min: 1,
    },
    {
      name: "payment_terms",
      label: "Payment Terms",
      type: "select",
      required: true,
      options: paymentTermOptions,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <BlockingLoader show={loading} />

      <div className="bg-white rounded-xl w-[450px]">
        <h3 className="text-lg font-semibold px-5 pt-5">
          Update Subscription
        </h3>

        <DynamicForm
          fields={fields}
          form={form}
          onChange={handleChange}
          errors={errors}
          setErrors={setErrors}
          submitAttempted={submitAttempted}
        />

        <div className="bg-gray-50 px-5 rounded text-sm">
          <span className="font-medium">
            Total Amount:
          </span>{" "}
          ₹{total.toLocaleString("en-IN")}
        </div>

        <div className="flex justify-end gap-3 pb-5 px-5">
          <button
            className="px-4 py-2 rounded border"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded bg-black text-white"
            onClick={handleSubmit}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}