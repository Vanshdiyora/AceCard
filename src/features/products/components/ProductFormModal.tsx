import { useState, useEffect } from "react";
import DynamicForm, { type FieldConfig } from "../../../common/ui/DynamicForm";

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
  // Base editable fields
  const [base, setBase] = useState({
    name: "",
    price: 0,
    category: "",
    sku: "",
    description: "",
  });

  // Dynamic extra fields
  const [extraProps, setExtraProps] = useState<{ key: string; value: string }[]>([]);

  // Backend meta (id, vendor_id etc)
  const [meta, setMeta] = useState<any>({});

  // Load product data into form
  useEffect(() => {
    if (product) {
      setBase({
        name: product.name,
        price: product.price,
        category: product.category,
        sku: product.sku,
        description: product.description,
      });

      const list = Object.entries(product.extra_properties || {}).map(
        ([key, value]) => ({ key, value: String(value) })
      );
      setExtraProps(list.length ? list : [{ key: "", value: "" }]);

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
        price: 0,
        category: "",
        sku: "",
        description: "",
      });
      setExtraProps([{ key: "", value: "" }]);
      setMeta({});
    }
  }, [product]);

  if (!open) return null;

  // DynamicForm fields
  const fields: FieldConfig[] = [
    {
      name: "name",
      label: "Product Name",
      type: "text",
      placeholder: "Enter product name",
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      placeholder: "Enter price",
    },
    {
      name: "category",
      label: "Category",
      type: "text",
      placeholder: "Enter category",
    },
    {
      name: "sku",
      label: "SKU",
      type: "text",
      placeholder: "Enter SKU code",
    },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Write product description",
    },
  ];

  // Handle DynamicForm updates
  const update = (key: string, value: any) => {
    const field = fields.find((f) => f.name === key);

    // Convert to number if numeric field
    if (field?.type === "number") value = Number(value);

    setBase((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Extra properties handlers
  const handleExtraChange = (idx: number, field: "key" | "value", value: string) => {
    const updated = [...extraProps];
    updated[idx][field] = value;
    setExtraProps(updated);
  };

  const addExtraField = () => {
    setExtraProps([...extraProps, { key: "", value: "" }]);
  };

  const removeExtraField = (idx: number) => {
    setExtraProps(extraProps.filter((_, i) => i !== idx));
  };

  // Build final extra_properties object
  const extraProperties: Record<string, any> = {};
  extraProps.forEach((p) => {
    if (p.key.trim()) extraProperties[p.key] = p.value;
  });

  // Final payload (same as your backend expects)
  const payload = {
    ...meta,
    ...base,
    price: Number(base.price),
    extra_properties: extraProperties,
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[500px] max-h-[85vh] shadow-lg flex flex-col space-y-4">

        <h2 className="text-xl font-semibold">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        {/* BASE PRODUCT FIELDS (DynamicForm) */}
        <DynamicForm
          fields={fields}
          form={base}
          onChange={update}
          extraProps={extraProps}
          onExtraAdd={addExtraField}
          onExtraChange={handleExtraChange}
          onExtraRemove={removeExtraField}
        />

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">
            Cancel
          </button>

          <button
            onClick={() => onSubmit(payload)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg"
          >
            {product ? "Update Product" : "Create Product"}
          </button>
        </div>
      </div>
    </div>
  );
}
