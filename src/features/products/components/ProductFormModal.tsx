import { useState, useEffect } from "react";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  product?: any;
}

export default function ProductFormModal({ open, onClose, onSubmit, product }: ProductFormModalProps) {

  const [base, setBase] = useState({
    name: "",
    price: "",
    category: "",
    sku: "",
    description: ""
  });

  const [extraProps, setExtraProps] = useState<{ key: string; value: string }[]>([]);

  // Hidden fields from backend
  const [meta, setMeta] = useState<any>({});

  useEffect(() => {
    if (product) {
      // Fill required fields
      setBase({
        name: product.name,
        price: product.price,
        category: product.category,
        sku: product.sku,
        description: product.description
      });

      // Fill extra properties dynamically
      const extraList = Object.entries(product.extra_properties || {}).map(
        ([key, value]) => ({ key, value: String(value) })
      );
      setExtraProps(extraList.length ? extraList : [{ key: "", value: "" }]);

      // Store uneditable backend fields
      setMeta({
        id: product.id,
        vendor_id: product.vendor_id,
        status: product.status,
        created_at: product.created_at,
        updated_at: product.updated_at
      });
    } else {
      // Reset for new product
      setBase({
        name: "",
        price: "",
        category: "",
        sku: "",
        description: ""
      });
      setExtraProps([{ key: "", value: "" }]);
      setMeta({});
    }
  }, [product]);

  const handleBaseChange = (e: any) => {
    setBase({ ...base, [e.target.name]: e.target.value });
  };

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

  if (!open) return null;

  // Convert dynamic extra fields to object
  const extraProperties: Record<string, any> = {};
  extraProps.forEach((p) => {
    if (p.key.trim() !== "") extraProperties[p.key] = p.value;
  });

  // Final payload matches backend PUT structure
  const payload = {
    ...meta, // id, vendor_id, status, created_at, updated_at
    name: base.name,
    price: Number(base.price),
    category: base.category,
    sku: base.sku,
    description: base.description,
    extra_properties: extraProperties
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-[500px] space-y-4">
        <h2 className="text-xl font-semibold">{product ? "Edit Product" : "Add Product"}</h2>

        {/* Editable Fields */}
        <input name="name" value={base.name} onChange={handleBaseChange} className="border w-full rounded-lg p-2" placeholder="Name" />
        <input name="price" value={base.price} onChange={handleBaseChange} className="border w-full rounded-lg p-2" type="number" placeholder="Price" />
        <input name="category" value={base.category} onChange={handleBaseChange} className="border w-full rounded-lg p-2" placeholder="Category" />
        <input name="sku" value={base.sku} onChange={handleBaseChange} className="border w-full rounded-lg p-2" placeholder="SKU" />
        <textarea name="description" value={base.description} onChange={handleBaseChange} className="border w-full rounded-lg p-2 h-20" placeholder="Description" />

        {/* EXTRA PROPERTIES */}
        <h3 className="font-medium">Extra Properties</h3>

        {extraProps.map((prop, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input
              value={prop.key}
              onChange={(e) => handleExtraChange(idx, "key", e.target.value)}
              placeholder="Field name"
              className="border rounded-lg p-2 w-1/2"
            />
            <input
              value={prop.value}
              onChange={(e) => handleExtraChange(idx, "value", e.target.value)}
              placeholder="Value"
              className="border rounded-lg p-2 w-1/2"
            />
            {extraProps.length > 1 && (
              <button onClick={() => removeExtraField(idx)} className="text-red-500">✕</button>
            )}
          </div>
        ))}

        <button onClick={addExtraField} className="text-purple-600">
          + Add another field
        </button>

        {/* ACTIONS */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="border px-4 py-2 rounded-lg">Cancel</button>

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
