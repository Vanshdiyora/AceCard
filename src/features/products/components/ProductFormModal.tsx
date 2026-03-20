import { useState, useEffect } from "react";
import DynamicForm, {
  type FieldConfig,
} from "../../../common/ui/DynamicForm";
import { validateField } from "../../../common/utils/formValidator";
import { uploadImage } from "../../publicProfile/services/publicProfile.api";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  product?: any;
}

export default function ProductFormModal({
  open,
  onClose,
  onSubmit,
  product,
}: ProductFormModalProps) {
  /* ---------------- FORM STATE ---------------- */

  const [base, setBase] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    product_img_url: "",
  });

  const [errors, setErrors] = useState<
    Record<string, string | null>
  >({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [extraProps, setExtraProps] = useState<
    { key: string; value: string }[]
  >([]);

  const [meta, setMeta] = useState<any>({});

  /* ---------------- LOAD PRODUCT ---------------- */

  useEffect(() => {
    if (!open) return;

    if (product) {
      queueMicrotask(() => {
        setBase({
          name: product.name ?? "",
          price: product.price ?? "",
          category: product.category ?? "",
          description: product.description ?? "",
          product_img_url: product.product_img_url ?? "",
        });
      });

      const list = Object.entries(
        product.extra_properties || {}
      ).map(([key, value]) => ({
        key,
        value: String(value),
      }));

      queueMicrotask(() => {
        setExtraProps(
          list.length ? list : [{ key: "", value: "" }]
        );

        setMeta({
          id: product.id,
          vendor_id: product.vendor_id,
          status: product.status,
          created_at: product.created_at,
          updated_at: product.updated_at,
        });
      });
    } else {
      queueMicrotask(() => {
        setBase({
          name: "",
          price: "",
          category: "",
          description: "",
          product_img_url: "",
        });
        setExtraProps([{ key: "", value: "" }]);
        setMeta({});
      });
    }

    queueMicrotask(() => {
      setSubmitAttempted(false);
      setErrors({});
    });
  }, [product, open]);

  if (!open) return null;

  /* ---------------- FIELD CONFIG ---------------- */

  const fields: FieldConfig[] = [
    {
      name: "product_img_url",
      label: "Product Image",
      type: "image",
      upload: async (file: File) => {
        const res = await uploadImage(file);
        return res.data.url;
      },
    },
    {
      name: "name",
      label: "Product Name",
      type: "text",
      placeholder: "Enter product name",
      required: true,
      minLength: 3,
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      placeholder: "Enter price",
      required: true,
      min: 1,
    },
    {
      name: "category",
      label: "Category",
      type: "text",
      placeholder: "Enter category",
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Write product description",
      maxLength: 500,
    },
  ];

  /* ---------------- HANDLE FIELD UPDATE ---------------- */

  const update = (key: string, value: any) => {
    setBase((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = () => {
    setSubmitAttempted(true);

    const newErrors: Record<string, string | null> = {};
    let hasErrors = false;

    fields.forEach((field) => {
      const error = validateField(
        field,
        base[field.name as keyof typeof base],
        base
      );
      newErrors[field.name] = error;
      if (error) hasErrors = true;
    });

    setErrors(newErrors);

    if (hasErrors) return;

    const extra_properties: Record<string, any> = {};
    extraProps.forEach((p) => {
      if (p.key.trim()) {
        extra_properties[p.key] = p.value;
      }
    });

    const payload = {
      ...meta,
      ...base,
      price: Number(base.price),
      extra_properties,
    };

    onSubmit(payload);
  };

  /* ---------------- UI (MATCHED TO AddMemberModal) ---------------- */

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[420px] max-h-[90vh] overflow-y-auto rounded-xl shadow-lg">

        {/* HEADER */}
        <div className="p-5 border-b">
          <h2 className="text-xl font-semibold">
            {product ? "Edit Product" : "Add Product"}
          </h2>
        </div>

        {/* FORM */}
        <DynamicForm
          fields={fields}
          form={base}
          onChange={update}
          errors={errors}
          setErrors={setErrors}
          submitAttempted={submitAttempted}
        />

        {/* FOOTER (STICKY LIKE AddMemberModal) */}
        <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-purple-600 text-white rounded"
          >
            {product ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}