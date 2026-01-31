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

  // Dynamic extra fields
  const [extraProps, setExtraProps] = useState<
    { key: string; value: string }[]
  >([]);

  // Backend meta
  const [meta, setMeta] = useState<any>({});

  /* ---------------- LOAD PRODUCT ---------------- */

  useEffect(() => {
    if (product) {
      setBase({
        name: product.name ?? "",
        price: product.price ?? "",
        category: product.category ?? "",
        description: product.description ?? "",
        product_img_url: product.product_img_url ?? "",   // 👈
      });

      const list = Object.entries(
        product.extra_properties || {}
      ).map(([key, value]) => ({
        key,
        value: String(value),
      }));

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
    } else {
      setBase({
        name: "",
        price: "",
        category: "",
        description: "",
        product_img_url: "",
      });
      setExtraProps([{ key: "", value: "" }]);
      setMeta({});
    }

    setErrors({});
  }, [product, open]);

  /* ---------------- LOCK BODY SCROLL ---------------- */

  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  if (!open) return null;

  /* ---------------- FIELD CONFIG ---------------- */

  const fields: FieldConfig[] = [
    {
      name: "product_img_url",
      label: "Product Image",
      type: "image",
      upload: async (file: File) => {
        const res = await uploadImage(file);
        return res.data.url; // must return URL
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

  /* ---------------- SUBMIT HANDLER ---------------- */

  const handleSubmit = () => {
    // 🔒 BLOCK SUBMIT IF INVALID
    const hasErrors = fields.some((field) => {
      const error = validateField(
        field,
        base[field.name as keyof typeof base],
        base
      );

      setErrors((prev) => ({
        ...prev,
        [field.name]: error,
      }));

      return error;
    });

    if (hasErrors) return;

    // Build extra_properties
    const extra_properties: Record<string, any> = {};
    extraProps.forEach((p) => {
      if (p.key.trim()) {
        extra_properties[p.key] = p.value;
      }
    });

    // Final payload
    const payload = {
      ...meta,
      ...base,
      price: Number(base.price),
      extra_properties,
    };

    onSubmit(payload);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[500px] max-h-[85vh] shadow-lg flex flex-col space-y-4">

        <h2 className="text-xl font-semibold">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        {/* -------- BASE PRODUCT FIELDS -------- */}
        <DynamicForm
          fields={fields}
          form={base}
          onChange={update}
          errors={errors}
          setErrors={setErrors}
        />

        {/* -------- ACTIONS -------- */}
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            {product ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
